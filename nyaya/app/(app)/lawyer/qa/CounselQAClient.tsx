"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function BotIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7M8 7h8a2 2 0 0 1 2 2v2H6V9a2 2 0 0 1 2-2zM9 15h.01M15 15h.01"/></svg>;
}
function SendIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>;
}
function InfoIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
}

type ChatMsg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What must a complainant prove for 'deficiency in service' under CPA 2019?",
  "Which curated precedents deal with warranty exclusions for electronics?",
  "What are the limitation periods for filing a consumer complaint?",
  "How does the CPA 2019 treat marketplace e-commerce entities?",
];

export default function CounselQAClient({
  userId,
  counselType,
}: {
  userId: Id<"users">;
  counselType: "COMPLAINANT" | "OPPOSING";
}) {
  const cases = useQuery(api.cases.getLawyerCases, { lawyerId: userId });
  const askResearch = useAction(api.research.askCounselResearch);

  const [researchCaseId, setResearchCaseId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "I am your case research assistant. Ask me about CPA 2019 provisions, precedent strategy, or pick one of your cases for grounded Q&A on your own record. Everything I say is advisory only.",
    },
  ]);

  const handleAsk = async (preset?: string) => {
    const q = (preset ?? question).trim();
    if (!q || asking) return;
    setAsking(true);
    const history = messages.slice(1); // drop the canned greeting
    setMessages(p => [...p, { role: "user", content: q }]);
    setQuestion("");
    try {
      const resp = await askResearch({
        lawyerId: userId,
        caseId: researchCaseId ? (researchCaseId as Id<"cases">) : undefined,
        question: q,
        history,
      });
      setMessages(p => [...p, { role: "assistant", content: resp.answer }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Research request failed.";
      setMessages(p => [...p, { role: "assistant", content: `I could not complete that request: ${msg}` }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div className="page-head">
        <div>
          <div className="cap-label">
            {counselType === "OPPOSING" ? "Opposing Counsel Workspace" : "Complainant Counsel Workspace"}
          </div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Research Q&amp;A</h1>
          <p className="page-sub">
            AI case research grounded in the curated precedent set and your own case record. Advisory only.
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
              <div className="card-title" style={{ marginBottom: 2 }}>Counsel Research Assistant</div>
              <div className="faint" style={{ fontSize: 11 }}>
                Cites only the curated precedent library · sees only your own side&apos;s record · never predicts verdicts
              </div>
            </div>
          </div>
          <div style={{ minWidth: 300 }}>
            <select className="sel" value={researchCaseId} onChange={e => setResearchCaseId(e.target.value)}>
              <option value="">General CPA 2019 research (no case)</option>
              {(cases || []).map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.humanId} — {c.complainantName} v. {c.opposingPartyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-body" style={{ display: "grid", gap: 14 }}>
          <div style={{ border: "2px solid var(--border)", background: "var(--bg-2)", padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 320, maxHeight: 460, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
                  ...(m.role === "user"
                    ? { background: "var(--primary)", color: "white", marginLeft: 40 }
                    : { background: "var(--surface)", border: "2px solid var(--border)", color: "var(--text-2)", marginRight: 40 }),
                }}
              >
                {m.content}
              </div>
            ))}
            {asking && (
              <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-3)", marginRight: 40 }}>
                Researching…
              </div>
            )}
          </div>

          {messages.length === 1 && (
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
              <label className="label">Your question</label>
              <textarea
                className="textarea"
                rows={2}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
                }}
                placeholder={researchCaseId
                  ? "e.g. Which precedents from the curated set support my client's position?"
                  : "e.g. What must a complainant prove for 'deficiency in service' under CPA 2019?"}
              />
            </div>
            <button className="btn primary" onClick={() => handleAsk()} disabled={asking || !question.trim()}>
              <SendIcon /> {asking ? "Asking…" : "Ask"}
            </button>
          </div>

          <div className="row" style={{ gap: 8, fontSize: 11.5, color: "var(--text-3)" }}>
            <InfoIcon />
            <span>Selecting a case grounds answers in your own submitted Q&amp;A. The other side&apos;s record is never shared with you.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
