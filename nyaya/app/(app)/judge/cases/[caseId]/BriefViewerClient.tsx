"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Icons ──────────────────────────────────────────────────
function SparklesIcon({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>;
}
function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function FlagIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
}
function ExternalIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}
function StampIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 20h12M8 16h8a2 2 0 0 0 2-2V9a5 5 0 0 0-10 0v5a2 2 0 0 0 2 2z"/></svg>;
}
function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function BookIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function ChevronLIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
}
function ChevronRIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
}
function DocIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function GavelIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/></svg>;
}
function AlertIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.3L2.2 18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>;
}

// ── Confidence dots ────────────────────────────────────────
function ConfidenceDots({ value }: { value: number }) {
  const n = Math.round(value * 5);
  return (
    <div className="row" style={{ gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i <= n ? "var(--green,#16a34a)" : "var(--border-2)" }} />
      ))}
    </div>
  );
}

// ── Section definitions ────────────────────────────────────
const SECTION_IDS = [
  { id: "summary",     title: "Case Summary",            color: "var(--primary)" },
  { id: "agreed",      title: "Agreed Facts",             color: "var(--blue,#2563eb)" },
  { id: "disputed",    title: "Disputed Facts",           color: "var(--gold,#d97706)" },
  { id: "law",         title: "Applicable Law",           color: "var(--primary)" },
  { id: "precedents",  title: "Relevant Precedents",      color: "var(--green,#16a34a)" },
  { id: "procedural",  title: "Procedural Flags",         color: "var(--amber,#d97706)" },
  { id: "gaps",        title: "Evidentiary Gaps",         color: "var(--violet,#7c3aed)" },
  { id: "confidence",  title: "Confidence Score",         color: "var(--text-3)" },
  { id: "caveats",     title: "Caveats & AI Limitations", color: "var(--red,#dc2626)" },
];

export default function BriefViewerClient({ caseId }: { caseId: Id<"cases"> }) {
  const router = useRouter();
  const caseData = useQuery(api.judge.getCaseById, { caseId });
  const brief = useQuery(api.judge.getAnalysisBrief, { caseId });
  const acknowledgeBrief = useMutation(api.judge.acknowledgeBrief);
  const precedents = useQuery(
    api.precedents.getManyByIds,
    brief?.citedPrecedentIds ? { ids: brief.citedPrecedentIds } : "skip"
  );

  const [activeSection, setActiveSection] = useState("summary");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [sourceKind, setSourceKind] = useState<"model" | "stat" | "case">("model");

  if (caseData === undefined || brief === undefined) {
    return (
      <div className="brief-shell">
        <aside className="brief-toc" />
        <main className="brief-mid">
          <div className="muted" style={{ fontSize: 13 }}>Loading advisory brief…</div>
        </main>
        <aside className="brief-source" />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="brief-shell">
        <aside className="brief-toc" />
        <main className="brief-mid">
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Brief Not Yet Generated</div>
            <p className="muted" style={{ fontSize: 13 }}>
              The AI analysis brief for {caseData?.humanId} is not available yet.
            </p>
          </div>
        </main>
        <aside className="brief-source" />
      </div>
    );
  }

  const handleAcknowledge = async () => {
    setSaving(true);
    await acknowledgeBrief({ caseId, briefId: brief._id, note });
    setSaving(false);
    router.push("/judge/dashboard");
  };

  const currentIdx = SECTION_IDS.findIndex(s => s.id === activeSection);
  const prevSection = SECTION_IDS[currentIdx - 1];
  const nextSection = SECTION_IDS[currentIdx + 1];
  const currentSec = SECTION_IDS[currentIdx];

  // ── Section body renderers ─────────────────────────────
  const renderSection = () => {
    if (activeSection === "summary") {
      return (
        <div className="col" style={{ gap: 14 }}>
          {brief.caseSummary?.split("\n").filter(Boolean).map((para: string, i: number) => (
            <p key={i} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: "var(--text)" }}>{para}</p>
          )) ?? <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75 }}>{brief.caseSummary}</p>}
        </div>
      );
    }

    if (activeSection === "agreed") {
      return (
        <div className="col" style={{ gap: 10 }}>
          {brief.agreedFacts?.map((fact: string, i: number) => (
            <div key={i} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: "var(--green-bg,#f0fdf4)", color: "var(--green,#16a34a)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                <CheckIcon />
              </div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "var(--text)" }}>{fact}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === "disputed") {
      return (
        <div className="col" style={{ gap: 14 }}>
          {brief.disputedFacts?.map((df: any, i: number) => (
            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--surface)" }}>
              <div style={{ padding: "10px 16px", background: "var(--bg-2)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="cap-label">Dispute {i + 1}</span>
                  <strong style={{ fontSize: 13.5 }}>{df.point}</strong>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: 14, borderRight: "1px solid var(--border)" }}>
                  <span className="badge blue"><span className="dot" />Complainant says</span>
                  <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6 }}>{df.complainantPosition}</p>
                </div>
                <div style={{ padding: 14 }}>
                  <span className="badge gold"><span className="dot" />Opposing says</span>
                  <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6 }}>{df.opposingPosition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === "law") {
      return (
        <div className="col" style={{ gap: 12 }}>
          {brief.applicableLaw?.map((law: any, i: number) => (
            <div key={i} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}>
              <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                <BookIcon />
                <strong style={{ fontSize: 13.5 }}>{law.statute} — {law.section}</strong>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-2)" }}>{law.relevance}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === "precedents") {
      if (precedents === undefined) return <div className="muted" style={{ fontSize: 13 }}>Loading precedents…</div>;
      const listed = precedents?.filter(Boolean) ?? [];
      if (listed.length === 0) return <div className="muted" style={{ fontSize: 13 }}>No precedents cited in the curated set for this case.</div>;
      return (
        <div className="col" style={{ gap: 10 }}>
          {listed.map((p: any) => (
            <div key={p._id} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.25 }}>{p.title}</div>
                  <div className="case-id" style={{ marginTop: 4 }}>{p.citation} · {p.commission} · {p.year}</div>
                </div>
                <span className="badge green">{p.category || "Allowed"}</span>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--text-2)" }}>{p.summary}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === "procedural") {
      if (!brief.proceduralFlags || brief.proceduralFlags.length === 0) {
        return <div className="muted" style={{ fontSize: 13 }}>No procedural issues flagged.</div>;
      }
      return (
        <div className="col" style={{ gap: 10 }}>
          {brief.proceduralFlags.map((f: string, i: number) => (
            <div key={i} className="row" style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--red-bg)", color: "var(--red,#dc2626)" }}>
                <AlertIcon />
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{f}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === "gaps") {
      if (!brief.evidentiaryGaps || brief.evidentiaryGaps.length === 0) {
        return <div className="muted" style={{ fontSize: 13 }}>No major gaps identified.</div>;
      }
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {brief.evidentiaryGaps.map((g: string, i: number) => (
            <div key={i} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{g}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === "confidence") {
      return (
        <div>
          <div className="row" style={{ gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div style={{ flex: 1, height: 12, borderRadius: 6, background: "var(--bg-2)", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ height: "100%", background: "linear-gradient(to right, var(--amber,#d97706), var(--green,#16a34a))", width: `${brief.confidenceScore ?? 0}%`, borderRadius: 6 }} />
            </div>
            <span className="serif" style={{ fontSize: 28, fontWeight: 500, minWidth: 60 }}>{brief.confidenceScore ?? 0}%</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-3)" }}>
            Self-reported by the underlying language model. Always apply independent judicial judgment. This score reflects the model&apos;s confidence in the completeness of the record, not a legal conclusion.
          </p>
        </div>
      );
    }

    if (activeSection === "caveats") {
      return (
        <div className="col" style={{ gap: 10 }}>
          {brief.caveats?.map((c: string, i: number) => (
            <div key={i} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: "var(--red-bg)", color: "var(--red,#dc2626)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                <AlertIcon />
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--text)", fontWeight: 500 }}>{c}</p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // ── Source panel ───────────────────────────────────────
  const renderSource = () => {
    if (sourceKind === "model") {
      return (
        <div>
          <div className="row" style={{ gap: 6, marginBottom: 10 }}>
            <SparklesIcon size={13} />
            <span className="cap-label">Source · Model trace</span>
          </div>
          <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-2)", fontSize: 12.5, lineHeight: 1.7 }}>
            {[
              { k: "Model", v: "claude-sonnet-4-6" },
              { k: "Generated", v: brief._creationTime ? new Date(brief._creationTime).toLocaleString("en-IN") : "—" },
              { k: "Precedent set", v: "Curated · 50+ cases" },
              { k: "Hallucination guard", v: "✓ closed-set retrieval" },
              { k: "Confidence", v: (brief.confidenceScore ?? 0) + "%" },
            ].map(r => (
              <div key={r.k} className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted">{r.k}</span>
                <span className="case-id">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sourceKind === "stat") {
      return (
        <div>
          <div className="row" style={{ gap: 6, marginBottom: 10 }}>
            <BookIcon />
            <span className="cap-label">Source · CPA 2019</span>
          </div>
          <div className="serif" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.25 }}>Consumer Protection Act, 2019</div>
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, fontFamily: "var(--serif)" }}>
            <strong>(11) "deficiency"</strong> means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force or has been undertaken to be performed by a person in pursuance of a contract or otherwise in relation to any service…
          </p>
          <button className="btn sm" style={{ marginTop: 12 }}><ExternalIcon /> Open full text</button>
        </div>
      );
    }

    if (sourceKind === "case") {
      const p = precedents?.filter(Boolean)?.[0];
      if (!p) return <div className="muted" style={{ fontSize: 13 }}>No precedent selected.</div>;
      return (
        <div>
          <div className="row" style={{ gap: 6, marginBottom: 10 }}>
            <GavelIcon />
            <span className="cap-label">Source · Cited precedent</span>
          </div>
          <div className="serif" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.25 }}>{p.title}</div>
          <div className="case-id" style={{ marginTop: 4 }}>{p.citation}</div>
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />
          <div className="cap-label" style={{ marginBottom: 6 }}>Summary</div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>{p.summary}</p>
          <button className="btn sm" style={{ marginTop: 12 }}><ExternalIcon /> Open full judgment</button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="brief-shell">
      {/* ── LEFT: TOC ── */}
      <aside className="brief-toc">
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="row" style={{ gap: 8, marginBottom: 4 }}>
            <span className="badge violet"><SparklesIcon /> Analysis Brief</span>
            <span className="badge amber"><span className="dot" />Not a Verdict</span>
          </div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 8, lineHeight: 1.25 }}>
            {caseData.complainantName} v. {caseData.opposingPartyName}
          </div>
          <div className="case-id" style={{ marginTop: 4 }}>{caseData.humanId}</div>
          <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 11 }}>{caseData.category.replace(/_/g, " ")}</span>
            <span className="faint" style={{ fontSize: 11 }}>·</span>
            <span className="muted tnum" style={{ fontSize: 11 }}>{caseData.jurisdiction}</span>
          </div>

          <div className="row" style={{ marginTop: 14, gap: 10, padding: 10, background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-2)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--primary)" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 15}`}
                  strokeDashoffset={`${2 * Math.PI * 15 * (1 - (brief.confidenceScore ?? 0) / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 600, fontFamily: "var(--mono)" }}>
                {brief.confidenceScore ?? 0}%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Overall confidence</div>
              <div className="faint" style={{ fontSize: 10.5 }}>Self-reported · AI generated</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "12px 12px" }}>
          <div className="cap-label" style={{ padding: "0 8px 6px" }}>Sections</div>
          {SECTION_IDS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="row"
              style={{
                width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 6,
                background: s.id === activeSection ? "var(--primary-bg)" : "transparent",
                color: s.id === activeSection ? "var(--primary)" : "var(--text)",
                border: "none", marginBottom: 2, gap: 8, cursor: "pointer",
              }}
            >
              <span className="case-id" style={{ minWidth: 22, color: s.id === activeSection ? "var(--primary)" : "var(--text-4)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: s.id === activeSection ? 500 : 400 }}>{s.title}</span>
              <ConfidenceDots value={0.8} />
            </button>
          ))}
        </div>

        {/* Bench actions */}
        <div style={{ padding: 14, borderTop: "1px solid var(--border)" }}>
          <div className="cap-label" style={{ marginBottom: 6 }}>Bench actions</div>
          {!brief.judgeAcknowledged ? (
            <button
              className="btn primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={saving}
              onClick={handleAcknowledge}
            >
              <StampIcon /> {saving ? "Saving…" : "Acknowledge & proceed"}
            </button>
          ) : (
            <span className="badge green" style={{ width: "100%", justifyContent: "center", padding: "6px 10px" }}>
              <CheckIcon /> Reviewed
            </span>
          )}
          <button className="btn ghost sm" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
            <FlagIcon /> Flag for revision
          </button>
          <button className="btn ghost sm" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            <ExternalIcon /> Export PDF
          </button>
        </div>
      </aside>

      {/* ── CENTER: section body ── */}
      <main className="brief-mid">
        <div className="row" style={{ marginBottom: 6, justifyContent: "space-between" }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="cap-label">Section {String(currentIdx + 1).padStart(2, "0")} of {String(SECTION_IDS.length).padStart(2, "0")}</span>
            <span className="ai-badge"><SparklesIcon /> AI generated</span>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn ghost sm"><FlagIcon /> Flag</button>
            <button className="btn ghost sm" onClick={() => setSourceKind("model")}><SparklesIcon /> Model trace</button>
          </div>
        </div>
        <h2 className="serif" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 18px", lineHeight: 1.1 }}>
          {currentSec?.title}
        </h2>

        {renderSection()}

        {/* Private notes */}
        <div style={{ marginTop: 28, padding: 16, border: "1px dashed var(--border-2)", borderRadius: 10, background: "var(--bg-2)" }}>
          <div className="row" style={{ marginBottom: 8, gap: 8 }}>
            <LockIcon />
            <span className="cap-label">Private notes (only you)</span>
          </div>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Add a note for this section. Notes are not shared with parties."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* Section navigation */}
        <div className="row" style={{ marginTop: 32, justifyContent: "space-between", paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <button className="btn" disabled={!prevSection} onClick={() => prevSection && setActiveSection(prevSection.id)}>
            <ChevronLIcon /> {prevSection ? prevSection.title : "—"}
          </button>
          <button className="btn primary" disabled={!nextSection} onClick={() => nextSection && setActiveSection(nextSection.id)}>
            {nextSection ? nextSection.title : "End"} <ChevronRIcon />
          </button>
        </div>
      </main>

      {/* ── RIGHT: source viewer ── */}
      <aside className="brief-source">
        <div style={{ position: "sticky", top: 0, padding: "14px 18px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <strong style={{ fontSize: 12, fontWeight: 500 }}>Source viewer</strong>
          <div className="row" style={{ gap: 6 }}>
            <button className={"btn sm " + (sourceKind === "model" ? "primary" : "ghost")} onClick={() => setSourceKind("model")} style={{ fontSize: 11 }}>Model</button>
            <button className={"btn sm " + (sourceKind === "stat" ? "primary" : "ghost")} onClick={() => setSourceKind("stat")} style={{ fontSize: 11 }}>Statute</button>
            {(precedents?.filter(Boolean).length ?? 0) > 0 && (
              <button className={"btn sm " + (sourceKind === "case" ? "primary" : "ghost")} onClick={() => setSourceKind("case")} style={{ fontSize: 11 }}>Case</button>
            )}
          </div>
        </div>
        <div style={{ padding: 18 }}>
          {renderSource()}
        </div>
      </aside>
    </div>
  );
}
