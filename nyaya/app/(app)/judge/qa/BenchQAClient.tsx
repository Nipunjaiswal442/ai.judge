"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function BotIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7M8 7h8a2 2 0 0 1 2 2v2H6V9a2 2 0 0 1 2-2zM9 15h.01M15 15h.01"/></svg>;
}
function SendIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>;
}
function InfoIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
}

type ChatMsg = { role: "judge" | "assistant"; content: string };
const DEFAULT_PROMPT = "Provide a neutral synthesis of lawyer-submitted facts, key disputes, evidentiary gaps, and procedural flags for this case.";

const SUGGESTIONS = [
  "Summarise the disputed facts side by side.",
  "What evidentiary gaps remain in the record?",
  "Are there any procedural compliance issues?",
  "Which submitted facts are agreed by both sides?",
];

export default function BenchQAClient() {
  const cases = useQuery(api.judge.getJudgeCases, {});
  const askSynthesis = useAction(api.analysis.askJudgeCaseSynthesis);

  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatErr, setChatErr] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Select a case and ask for a synthesis. I ground every answer in the lawyers' submitted Q&A and the generated advisory brief — and I never suggest a verdict." },
  ]);

  useEffect(() => {
    if (!cases || cases.length === 0 || selectedCaseId) return;
    setSelectedCaseId(cases[0]._id);
  }, [cases, selectedCaseId]);

  const activeCase = useMemo(
    () => cases?.find((c: any) => c._id === selectedCaseId) || cases?.[0],
    [cases, selectedCaseId]
  );

  const handleAsk = async (preset?: string) => {
    if (!activeCase?._id || asking) return;
    setAsking(true);
    setChatErr("");
    const prompt = (preset ?? question).trim() || DEFAULT_PROMPT;
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
    <div className="page" style={{ maxWidth: 980 }}>
      <div className="page-head">
        <div>
          <div className="cap-label">Presiding Officer</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Bench Q&amp;A</h1>
          <p className="page-sub">
            Grounded synthesis of lawyer submissions for any matter on your docket. Advisory only — never a verdict.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="row" style={{ gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 0, background: "var(--primary-bg)", color: "var(--primary)", display: "grid", placeItems: "center" }}>
              <BotIcon />
            </div>
            <div>
              <div className="card-title" style={{ marginBottom: 2 }}>Bench Assistant</div>
              <div className="faint" style={{ fontSize: 11 }}>
                Grounded in both sides&apos; submitted Q&amp;A, the advisory brief, and cited precedents
              </div>
            </div>
          </div>
          <div style={{ minWidth: 320 }}>
            <select className="sel" value={activeCase?._id || ""} onChange={e => setSelectedCaseId(e.target.value)}>
              {(cases || []).map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.humanId} — {c.complainantName} v. {c.opposingPartyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-body" style={{ display: "grid", gap: 14 }}>
          {cases !== undefined && cases.length === 0 && (
            <div style={{ padding: "24px 12px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
              Your docket is empty — no cases available for synthesis yet.
            </div>
          )}

          <div style={{ border: "2px solid var(--border)", background: "var(--bg-2)", padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 320, maxHeight: 460, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
                  ...(m.role === "judge"
                    ? { background: "var(--primary)", color: "white", marginLeft: 40 }
                    : { background: "var(--surface)", border: "2px solid var(--border)", color: "var(--text-2)", marginRight: 40 }),
                }}
              >
                {m.content}
              </div>
            ))}
            {asking && (
              <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-3)", marginRight: 40 }}>
                Synthesising…
              </div>
            )}
          </div>

          {chatErr && (
            <div style={{ padding: "8px 12px", background: "var(--red-bg)", color: "var(--red)", fontSize: 12 }}>{chatErr}</div>
          )}

          {messages.length === 1 && (cases?.length ?? 0) > 0 && (
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="btn ghost sm" style={{ fontSize: 11.5 }} onClick={() => handleAsk(s)} disabled={asking}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="row" style={{ gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label className="label">Judge prompt</label>
              <textarea
                className="textarea"
                rows={2}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
                }}
                placeholder="Ask about disputed facts, evidentiary gaps, or side-by-side positions. Leave blank for a full synthesis."
              />
            </div>
            <button className="btn primary" onClick={() => handleAsk()} disabled={asking || !activeCase?._id}>
              <SendIcon /> {asking ? "Synthesising…" : "Ask"}
            </button>
          </div>

          <div className="row" style={{ gap: 8, fontSize: 11.5, color: "var(--text-3)" }}>
            <InfoIcon />
            <span>Requires at least one submitted lawyer Q&amp;A on the selected case. Decisional authority remains with the bench.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
