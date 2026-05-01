"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CASE_CATEGORIES } from "@/lib/caseCategories";

// ── Icons ──────────────────────────────────────────────────
function UsersIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 21a6 6 0 0 1 12 0M16 5a3.5 3.5 0 0 1 0 7M21 21a5.5 5.5 0 0 0-4-5.3"/></svg>;
}
function SparklesIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>;
}
function PaperclipIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m21 12-9.6 9.6a5 5 0 0 1-7-7l9.6-9.6a3.4 3.4 0 0 1 4.8 4.8l-9.5 9.5a1.7 1.7 0 0 1-2.4-2.4l8.6-8.6"/></svg>;
}
function SendIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function CheckIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ChevronLIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}
function ChevronRIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
}
function LockIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// ── Sub-components ─────────────────────────────────────────
function QAEntry({
  entry,
  disabled,
  onSave,
}: {
  entry: Doc<"qaEntries">;
  disabled: boolean;
  onSave: (text: string) => Promise<unknown> | unknown;
}) {
  const [text, setText] = useState(entry.answerText || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setText(entry.answerText || ""); }, [entry.answerText]);

  const handleBlur = async () => {
    if (text === (entry.answerText || "")) return;
    await onSave(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: 20 }}>
      {disabled && entry.answerText ? (
        <>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>{entry.answerText}</p>
          {entry.aiFollowUpNeeded && entry.aiFollowUpNote && (
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: "var(--primary-bg)", border: "1px solid color-mix(in oklch, var(--primary) 18%, transparent)", display: "flex", gap: 12 }}>
              <SparklesIcon />
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: "var(--text-2)" }}>
                <strong style={{ display: "block", marginBottom: 4 }}>Nyāya follow-up</strong>
                {entry.aiFollowUpNote}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <textarea
            className="textarea"
            rows={6}
            placeholder="Provide a complete, factual answer. Cite document references where applicable…"
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
          />
          <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm"><PaperclipIcon /> Attach</button>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {saved && <span style={{ fontSize: 11, color: "var(--green)" }}>Saved</span>}
              {text.trim().length < 10 && text.trim().length > 0 && (
                <span style={{ fontSize: 11, color: "var(--text-4)" }}>Answer appears too short</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function CaseDetailClient({
  caseId,
  userId,
}: {
  caseId: Id<"cases">;
  userId: Id<"users">;
}) {
  const router = useRouter();
  const caseData = useQuery(api.judge.getCaseById, { caseId });
  const initializeSession = useMutation(api.qa.initializeQASession);
  const updateAnswer = useMutation(api.qa.updateAnswer);
  const submitSession = useMutation(api.qa.submitQASession);
  const generateBrief = useAction(api.analysis.generateAnalysisBrief);

  const [side, setSide] = useState<"COMPLAINANT" | "OPPOSING" | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!caseData || initialized) return;
    const isComplainant = caseData.complainantLawyerId === userId;
    const isOpposing = caseData.opposingLawyerId === userId;
    const computedSide = isComplainant ? "COMPLAINANT" : isOpposing ? "OPPOSING" : null;
    setSide(computedSide);
    if (computedSide) {
      initializeSession({ caseId, side: computedSide, category: caseData.category })
        .then(() => setInitialized(true))
        .catch((e: unknown) => setError(getErrorMessage(e, "Could not initialize Q&A session.")));
    } else {
      setInitialized(true);
    }
  }, [caseData, userId, caseId, initialized, initializeSession]);

  const session = useQuery(api.qa.getQASession, side ? { caseId, side } : "skip");
  const entries = useQuery(api.qa.getQAEntries, session?._id ? { sessionId: session._id } : "skip");

  if (caseData === undefined) {
    return (
      <div className="qa-shell">
        <aside className="qa-side" />
        <main className="qa-main">
          <div className="muted" style={{ fontSize: 13 }}>Loading case…</div>
        </main>
        <aside className="qa-side right" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="qa-shell">
        <aside className="qa-side" />
        <main className="qa-main">
          <div className="card" style={{ padding: 24 }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Case not found</div>
            <p className="muted" style={{ fontSize: 13 }}>This matter is unavailable or may have been removed.</p>
          </div>
        </main>
        <aside className="qa-side right" />
      </div>
    );
  }

  const categoryLabel = CASE_CATEGORIES.find(c => c.id === caseData.category)?.label || caseData.category;
  const submitted = session?.status === "SUBMITTED";
  const active = entries?.[activeIdx];
  const completedCount = entries?.filter((e) => e.answerText && e.answerText.trim().length >= 10).length ?? 0;
  const totalCount = entries?.length ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = async () => {
    if (!session?._id) return;
    setError("");
    try { await submitSession({ sessionId: session._id }); }
    catch (e: unknown) { setError(getErrorMessage(e, "Submit failed")); }
  };

  const handleGenerateBrief = async () => {
    setGenerating(true);
    setError("");
    try { await generateBrief({ caseId }); }
    catch (e: unknown) { setError(getErrorMessage(e, "Brief generation failed")); }
    finally { setGenerating(false); }
  };

  const sideLabel = side === "COMPLAINANT" ? "Complainant" : side === "OPPOSING" ? "Opposing" : "Observer";
  const sideTone = side === "COMPLAINANT" ? "blue" : "gold";

  return (
    <div className="qa-shell">
      {/* ── LEFT: question navigator ── */}
      <aside className="qa-side">
        <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid var(--border)" }}>
          <div className="cap-label">Active matter</div>
          <div className="serif" style={{ fontSize: 16, fontWeight: 500, marginTop: 4, lineHeight: 1.25 }}>
            {caseData.complainantName} v. {caseData.opposingPartyName}
          </div>
          <div className="case-id" style={{ marginTop: 4 }}>{caseData.humanId}</div>
          <div className="row" style={{ marginTop: 10, gap: 6, flexWrap: "wrap" }}>
            <span className={"badge " + sideTone}><span className="dot" />{sideLabel}</span>
            <span className="badge gray">{caseData.jurisdiction || "DCDRC"}</span>
          </div>
        </div>

        {/* Questions list */}
        <div style={{ flex: 1, overflow: "auto", padding: "10px 10px 4px" }}>
          {!side && (
            <div style={{ padding: "16px 8px", fontSize: 13, color: "var(--text-3)" }}>
              You are not listed as counsel on this case.
            </div>
          )}
          {side && (
            <>
              <div className="row" style={{ justifyContent: "space-between", padding: "0 6px 4px" }}>
                <div className="cap-label">{sideLabel} questions</div>
                {submitted ? (
                  <span className="badge green"><span className="dot" />Submitted</span>
                ) : (
                  <span className="badge amber">In progress</span>
                )}
              </div>
              {entries === undefined && (
                <div style={{ padding: "12px 6px", fontSize: 12, color: "var(--text-4)" }}>Loading…</div>
              )}
              {entries?.map((entry, i) => {
                const answered = entry.answerText && entry.answerText.trim().length >= 10;
                return (
                  <div
                    key={entry._id}
                    className={"q-step " + (i === activeIdx ? "active " : "") + (answered ? "done" : "")}
                    onClick={() => setActiveIdx(i)}
                  >
                    <div className="q-step-num">{answered ? <CheckIcon /> : i + 1}</div>
                    <div className="q-step-body">
                      <div className="q-step-cat">{side === "COMPLAINANT" ? "C" : "O"}{i + 1} · Q&amp;A</div>
                      <div className="q-step-title">{entry.questionText}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: 14, borderTop: "1px solid var(--border)" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <span className="cap-label">Overall progress</span>
            <span className="muted tnum" style={{ fontSize: 11 }}>{progress}%</span>
          </div>
          <div className="bar green"><span style={{ width: progress + "%" }} /></div>

          {(caseData.status === "BRIEF_GENERATED" || caseData.status === "JUDGE_REVIEWED") && (
            <button
              className="btn primary sm"
              style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
              onClick={() => router.push(`/judge/cases/${caseId}`)}
            >
              <SparklesIcon /> View Analysis Brief
            </button>
          )}
        </div>
      </aside>

      {/* ── CENTER: active Q&A ── */}
      <main className="qa-main">
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--red-bg)", color: "var(--red)", borderRadius: 8, fontSize: 13, border: "1px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
            {error}
          </div>
        )}

        {!side && (
          <div className="card" style={{ padding: 24 }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Not listed as counsel</div>
            <p className="muted" style={{ fontSize: 13 }}>
              You are not assigned to this case. Ask the complainant lawyer to invite you as opposing counsel.
            </p>
          </div>
        )}

        {side && !active && entries !== undefined && (
          <div className="card" style={{ padding: 24 }}>
            <div className="muted" style={{ fontSize: 13 }}>No questions found for your session. The session may still be initializing.</div>
          </div>
        )}

        {side && active && (
          <>
            {/* Question header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                  <span className={"badge " + sideTone}><span className="dot" />{sideLabel}</span>
                  <span className="muted" style={{ fontSize: 12 }}>· Structured Q&amp;A</span>
                  <span className="case-id">Question {activeIdx + 1} of {totalCount}</span>
                </div>
                <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.015em", margin: "0 0 8px", maxWidth: 720 }}>
                  {active.questionText}
                </h2>
                <div className="row" style={{ gap: 8 }}>
                  <span className="ai-badge"><SparklesIcon /> AI generated question</span>
                  <span className="muted" style={{ fontSize: 11 }}>· Curated from CPA 2019 precedent set</span>
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn ghost sm" disabled={activeIdx === 0} onClick={() => setActiveIdx(i => i - 1)}>
                  <ChevronLIcon /> Prev
                </button>
                <button className="btn ghost sm" disabled={activeIdx === totalCount - 1} onClick={() => setActiveIdx(i => i + 1)}>
                  Next <ChevronRIcon />
                </button>
              </div>
            </div>

            {/* Answer card */}
            <div className="card">
              <div className="card-head">
                <div className="row" style={{ gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: side === "COMPLAINANT" ? "var(--blue-bg,#eff6ff)" : "var(--gold-bg,#fffbeb)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: side === "COMPLAINANT" ? "var(--blue,#2563eb)" : "var(--gold,#d97706)" }}>
                      {side === "COMPLAINANT" ? "C" : "O"}{activeIdx + 1}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{sideLabel} counsel</div>
                    <div className="faint" style={{ fontSize: 11 }}>
                      {submitted ? "Submitted · locked" : "Drafting…"}
                    </div>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  {submitted && (
                    <span className="badge green"><CheckIcon /> Submitted</span>
                  )}
                  {active.aiFollowUpNeeded && (
                    <span className="badge violet"><SparklesIcon /> AI follow-up</span>
                  )}
                </div>
              </div>

              <QAEntry
                entry={active}
                disabled={submitted}
                onSave={(text) => updateAnswer({ entryId: active._id, answerText: text })}
              />
            </div>

            {/* Submit / generate brief CTAs */}
            {!submitted && session?.status === "IN_PROGRESS" && (
              <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button
                  className="btn primary"
                  onClick={handleSubmit}
                  disabled={!entries || entries.some((e) => !e.answerText || e.answerText.trim().length < 10)}
                >
                  <SendIcon /> Submit my side
                </button>
              </div>
            )}

            {submitted && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--green-bg,#f0fdf4)", border: "1px solid color-mix(in oklch, var(--green) 30%, transparent)", borderRadius: 8, fontSize: 13, color: "var(--green,#16a34a)" }}>
                <LockIcon /> Your submission is locked. Awaiting the other side or judge review.
              </div>
            )}

            {side === "COMPLAINANT" && caseData.status === "READY_FOR_BRIEF" && (
              <div style={{ marginTop: 16, padding: "14px 18px", background: "var(--amber-bg,#fffbeb)", border: "1px solid color-mix(in oklch, var(--amber,#d97706) 30%, transparent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
                  Both sides have submitted. You can trigger the AI advisory brief now.
                </p>
                <button className="btn primary" onClick={handleGenerateBrief} disabled={generating}>
                  <SparklesIcon /> {generating ? "Generating…" : "Generate Analysis Brief"}
                </button>
              </div>
            )}

            {(caseData.status === "BRIEF_GENERATED" || caseData.status === "JUDGE_REVIEWED") && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--green-bg,#f0fdf4)", border: "1px solid color-mix(in oklch, var(--green) 30%, transparent)", borderRadius: 8, fontSize: 13, color: "var(--green,#16a34a)" }}>
                Advisory brief generated. It is now with the assigned judge for review.
              </div>
            )}
          </>
        )}
      </main>

      {/* ── RIGHT: context panel ── */}
      <aside className="qa-side right">
        {/* Parties */}
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <UsersIcon />
            <div className="cap-label">Parties</div>
          </div>
          <div style={{ fontSize: 13 }}>
            <div className="row" style={{ gap: 10, padding: "8px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--blue-bg,#eff6ff)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--blue,#2563eb)" }}>C</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{caseData.complainantName}</div>
                <div className="faint" style={{ fontSize: 11 }}>Complainant</div>
              </div>
            </div>
            <div className="row" style={{ gap: 10, padding: "8px 0", borderTop: "1px dashed var(--border)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--gold-bg,#fffbeb)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold,#d97706)" }}>O</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{caseData.opposingPartyName}</div>
                <div className="faint" style={{ fontSize: 11 }}>Opposite Party</div>
              </div>
            </div>
          </div>
        </div>

        {/* Case info */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="cap-label" style={{ marginBottom: 10 }}>Case details</div>
          <div className="col" style={{ gap: 8, fontSize: 12.5 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Category</span>
              <span style={{ textAlign: "right", maxWidth: 160 }}>{categoryLabel}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Jurisdiction</span>
              <span>{caseData.jurisdiction || "—"}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Claim</span>
              <span className="tnum">₹{(caseData.claimAmount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Status</span>
              <span className="badge gray" style={{ fontSize: 11 }}>{caseData.status.replace(/_/g, " ")}</span>
            </div>
          </div>
        </div>

        {/* Nyāya assistant hint */}
        <div style={{ padding: "14px 18px" }}>
          <div className="row" style={{ marginBottom: 10, gap: 8 }}>
            <SparklesIcon />
            <div className="cap-label" style={{ color: "var(--primary)" }}>Nyāya assistant</div>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: "var(--primary-bg)", fontSize: 12.5, lineHeight: 1.55, color: "var(--text-2)" }}>
            {side === "COMPLAINANT"
              ? "You are the complainant counsel. Answer each question with specific facts, dates, and document references. The AI will use your responses to generate an advisory brief for the bench."
              : side === "OPPOSING"
              ? "You are opposing counsel. Respond to each question factually and cite contractual or statutory grounds where applicable. The AI checks citation accuracy."
              : "You are viewing this case as an observer. Sign in as a listed counsel to participate in the Q&A."}
          </div>
        </div>
      </aside>
    </div>
  );
}
