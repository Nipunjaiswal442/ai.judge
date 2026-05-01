"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_CATEGORIES } from "@/lib/caseCategories";

// ── Icons ──────────────────────────────────────────────────
function SparklesIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>;
}
function CalendarIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>;
}
function BookIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v16a2 2 0 0 0 2 2h14V6H6a2 2 0 0 1-2-2zM6 4a2 2 0 0 0-2 2"/></svg>;
}
function SearchIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
}
function ChevronRIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
}
function ArrowRIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
}
function SendIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>;
}
function BotIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7M8 7h8a2 2 0 0 1 2 2v2H6V9a2 2 0 0 1 2-2zM9 15h.01M15 15h.01"/></svg>;
}
function AlertIcon({ size = 10 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>;
}

// ── Helpers ────────────────────────────────────────────────
function statusTone(status: string) {
  if (status === "JUDGE_REVIEWED") return "gray";
  if (status === "BRIEF_GENERATED") return "green";
  if (status === "READY_FOR_BRIEF") return "amber";
  return "blue";
}
function statusLabel(status: string) {
  const m: Record<string, string> = {
    DRAFT: "Draft",
    AWAITING_OPPOSING: "Awaiting opp.",
    OPPOSING_IN_PROGRESS: "Opp. in progress",
    READY_FOR_BRIEF: "Ready for brief",
    BRIEF_GENERATED: "Brief ready",
    JUDGE_REVIEWED: "Reviewed",
  };
  return m[status] ?? status.replace(/_/g, " ");
}
function categoryShort(cat: string) {
  const f = CASE_CATEGORIES.find(c => c.id === cat);
  return f ? f.label.replace("(Consumer)", "").trim() : cat.replace(/_/g, " ");
}

type ChatMsg = { role: "judge" | "assistant"; content: string };
const DEFAULT_PROMPT = "Provide a neutral synthesis of lawyer-submitted facts, key disputes, evidentiary gaps, and procedural flags for this case.";

// ── Component ──────────────────────────────────────────────
export default function JudgeDashboardClient() {
  const cases = useQuery(api.judge.getJudgeCases, {});
  const askSynthesis = useAction(api.analysis.askJudgeCaseSynthesis);
  const router = useRouter();

  const [filter, setFilter] = useState("all");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatErr, setChatErr] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Select a case and ask for a synthesis. I will ground every answer in the lawyers' submitted Q&A and the generated advisory brief." },
  ]);

  useEffect(() => {
    if (!cases || cases.length === 0 || selectedCaseId) return;
    setSelectedCaseId(cases[0]._id);
  }, [cases, selectedCaseId]);

  const activeCase = useMemo(() => cases?.find((c: any) => c._id === selectedCaseId) || cases?.[0], [cases, selectedCaseId]);

  if (cases === undefined) {
    return <div className="page"><div className="muted" style={{ fontSize: 13 }}>Loading docket…</div></div>;
  }

  if (cases.length === 0) {
    return (
      <div className="page" style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <div style={{ textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Docket is empty</div>
          <p className="muted" style={{ fontSize: 13 }}>No cases have been filed in your jurisdiction.</p>
        </div>
      </div>
    );
  }

  const filtered = cases.filter((c: any) =>
    filter === "all" ? true :
    filter === "ready" ? c.status === "BRIEF_GENERATED" :
    filter === "wip"   ? ["DRAFT","AWAITING_OPPOSING","OPPOSING_IN_PROGRESS","READY_FOR_BRIEF"].includes(c.status) :
    filter === "done"  ? c.status === "JUDGE_REVIEWED" : true
  );

  const briefReadyCnt = cases.filter((c: any) => c.status === "BRIEF_GENERATED").length;
  const reviewedCnt   = cases.filter((c: any) => c.status === "JUDGE_REVIEWED").length;
  const priorityCase  = cases.find((c: any) => c.status === "BRIEF_GENERATED");

  const handleAsk = async () => {
    if (!activeCase?._id || asking) return;
    setAsking(true);
    setChatErr("");
    const prompt = question.trim() || DEFAULT_PROMPT;
    setMessages(p => [...p, { role: "judge", content: prompt }]);
    setQuestion("");
    try {
      const resp = await askSynthesis({ caseId: activeCase._id, question: prompt });
      setMessages(p => [...p, { role: "assistant", content: resp.answer }]);
    } catch (e: any) {
      const msg = e?.message || "Unable to generate synthesis right now.";
      setChatErr(msg);
      setMessages(p => [...p, { role: "assistant", content: `I could not complete that request: ${msg}` }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="page">
      {/* Watermark */}
      <svg className="watermark" style={{ top: -80, right: -120, width: 500, height: 500 }}
        viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4">
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          return <line key={i} x1={50 + 5 * Math.cos(a)} y1={50 + 5 * Math.sin(a)} x2={50 + 46 * Math.cos(a)} y2={50 + 46 * Math.sin(a)} />;
        })}
      </svg>

      {/* Page head */}
      <div className="page-head">
        <div>
          <div className="cap-label">Presiding Officer</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Cases assigned</h1>
          <p className="page-sub">{cases.length} matters · {briefReadyCnt} with briefs ready</p>
        </div>
        <div className="page-actions">
          <button className="btn"><CalendarIcon /> Cause list</button>
          <button className="btn"><BookIcon /> Precedent library</button>
          {priorityCase && (
            <button className="btn primary" onClick={() => router.push(`/judge/cases/${priorityCase._id}`)}>
              <SparklesIcon /> Open today's priority brief
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-label">Briefs ready for review</div>
          <div className="stat-value" style={{ color: briefReadyCnt > 0 ? "var(--green)" : undefined }}>{briefReadyCnt}</div>
          <div className="stat-foot"><SparklesIcon size={11} /> Avg generation ~54s</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total cases assigned</div>
          <div className="stat-value">{cases.length}</div>
          <div className="stat-foot"><CalendarIcon size={11} /> Check cause list for hearings</div>
        </div>
        <div className="stat">
          <div className="stat-label">Cases reviewed</div>
          <div className="stat-value">{reviewedCnt}</div>
          <div className="stat-foot">100% precedent citation accuracy</div>
        </div>
        <div className="stat">
          <div className="stat-label">In progress</div>
          <div className="stat-value">{cases.length - reviewedCnt - briefReadyCnt}</div>
          <div className="stat-foot">Awaiting submissions / brief</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        {/* Case table */}
        <div className="card">
          <div className="card-head">
            <div className="row" style={{ gap: 4 }}>
              {[{ k: "all", l: "All" }, { k: "ready", l: "Brief ready" }, { k: "wip", l: "In progress" }, { k: "done", l: "Reviewed" }].map(t => (
                <button key={t.k} className={"btn sm " + (filter === t.k ? "primary" : "ghost")} onClick={() => setFilter(t.k)}>{t.l}</button>
              ))}
            </div>
            <div className="search-wrap" style={{ width: 200 }}>
              <SearchIcon /><input className="input" placeholder="Search cases…" />
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Case</th><th>Category</th><th>Status</th><th>Brief</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c._id} onClick={() => router.push(c.status === "BRIEF_GENERATED" || c.status === "JUDGE_REVIEWED" ? `/judge/cases/${c._id}` : `/judge/dashboard`)}>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.status === "BRIEF_GENERATED" ? "var(--green)" : c.status === "JUDGE_REVIEWED" ? "var(--text-4)" : "var(--amber)", flexShrink: 0 }} />
                      <div>
                        <div className="ttl">{c.complainantName} v. {c.opposingPartyName}</div>
                        <div className="meta case-id">{c.humanId} · ₹{(c.claimAmount||0).toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="muted">{categoryShort(c.category)}</span></td>
                  <td><span className={"badge " + statusTone(c.status)}>{statusLabel(c.status)}</span></td>
                  <td>
                    {c.status === "BRIEF_GENERATED" || c.status === "JUDGE_REVIEWED"
                      ? <span className="badge green"><SparklesIcon size={10} /> Ready</span>
                      : <span className="muted" style={{ fontSize: 11 }}>—</span>}
                  </td>
                  <td><button className="icon-btn"><ChevronRIcon /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="col" style={{ gap: 16 }}>
          {/* Priority card */}
          {priorityCase ? (
            <div className="card" style={{ borderColor: "color-mix(in oklch, var(--primary) 22%, var(--border))" }}>
              <div style={{ padding: 18 }}>
                <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                  <SparklesIcon />
                  <div className="cap-label" style={{ color: "var(--primary)" }}>Today's priority</div>
                </div>
                <div className="serif" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.25, marginBottom: 6 }}>
                  {priorityCase.complainantName} v. {priorityCase.opposingPartyName}
                </div>
                <div className="case-id" style={{ marginBottom: 10 }}>{priorityCase.humanId}</div>
                <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  <span className="badge violet">{categoryShort(priorityCase.category)}</span>
                  <span className="badge green">Brief Ready</span>
                </div>
                <button
                  className="btn primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => router.push(`/judge/cases/${priorityCase._id}`)}
                >
                  Open analysis brief <ArrowRIcon />
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div style={{ padding: 18, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                No briefs ready for review yet.
              </div>
            </div>
          )}

          {/* Recent cases list */}
          <div className="card">
            <div className="card-head"><h3 className="card-title">All matters</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {cases.slice(0, 5).map((c: any, i: number, arr: any[]) => (
                <div
                  key={c._id}
                  className="row"
                  style={{ padding: "10px 18px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: 12, cursor: "pointer" }}
                  onClick={() => router.push(c.status === "BRIEF_GENERATED" || c.status === "JUDGE_REVIEWED" ? `/judge/cases/${c._id}` : `/judge/dashboard`)}
                >
                  <div style={{ width: 38, textAlign: "center", padding: "3px 0", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg-2)" }}>
                    <div className="cap-label" style={{ fontSize: 8, color: c.status === "BRIEF_GENERATED" ? "var(--green)" : "var(--text-4)" }}>
                      {c.status === "BRIEF_GENERATED" ? "READY" : c.status === "JUDGE_REVIEWED" ? "DONE" : "WIP"}
                    </div>
                    <div className="serif tnum" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1, marginTop: 1 }}>
                      {(c.claimAmount || 0) >= 100000 ? ((c.claimAmount || 0) / 100000).toFixed(1) + "L" : ((c.claimAmount || 0) / 1000).toFixed(0) + "K"}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.complainantName} v. {c.opposingPartyName}
                    </div>
                    <div className="faint" style={{ fontSize: 11 }}>{categoryShort(c.category)}</div>
                  </div>
                  {(c.status === "BRIEF_GENERATED") && <span className="badge amber" style={{ fontSize: 10 }}><AlertIcon size={9} /> brief ready</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bench Assistant */}
      <div style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-head">
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--primary-bg)", color: "var(--primary)", display: "grid", placeItems: "center" }}>
                <BotIcon />
              </div>
              <div>
                <div className="card-title" style={{ marginBottom: 2 }}>Bench Assistant</div>
                <div className="faint" style={{ fontSize: 11 }}>Ask for grounded synthesis of lawyer submissions for a selected case.</div>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 16 }}>
            {/* Case selector */}
            <div>
              <label className="label">Case context</label>
              <select
                className="sel"
                value={activeCase?._id || ""}
                onChange={e => setSelectedCaseId(e.target.value)}
              >
                {cases.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.humanId} — {c.complainantName} v. {c.opposingPartyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Chat */}
            <div style={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-2)", padding: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 7, padding: "10px 14px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
                    ...(m.role === "judge"
                      ? { background: "var(--primary)", color: "white", marginLeft: 32 }
                      : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)", marginRight: 32 })
                  }}
                >
                  {m.content}
                </div>
              ))}
            </div>

            {chatErr && (
              <div style={{ padding: "8px 12px", background: "var(--red-bg)", color: "var(--red)", borderRadius: 7, fontSize: 12 }}>{chatErr}</div>
            )}

            {/* Input */}
            <div>
              <label className="label">Judge prompt</label>
              <textarea
                className="textarea"
                rows={3}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ask about disputed facts, evidentiary gaps, or side-by-side positions. Leave blank to auto-generate a full synthesis."
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn primary"
                onClick={handleAsk}
                disabled={asking || !activeCase?._id}
              >
                <SendIcon /> {asking ? "Synthesising…" : "Ask Bench Assistant"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
