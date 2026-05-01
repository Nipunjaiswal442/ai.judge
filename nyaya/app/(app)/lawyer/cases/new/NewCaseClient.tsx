"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { CASE_CATEGORIES } from "@/lib/caseCategories";
import { Id } from "@/convex/_generated/dataModel";

// ── Icons ──────────────────────────────────────────────────
function ArrowLIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>;
}
function ArrowRIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
}
function StampIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 20h12M8 16h8a2 2 0 0 0 2-2V9a5 5 0 0 0-10 0v5a2 2 0 0 0 2 2z"/></svg>;
}
function SparklesIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>;
}
function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function AlertIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.3L2.2 18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>;
}
function InfoIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>;
}

// ── Category metadata ──────────────────────────────────────
const CAT_META: Record<string, { icon: React.ReactNode; desc: string }> = {
  DEFECTIVE_GOODS: {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    desc: "Product defects, warranty disputes, manufacturing faults",
  },
  DEFICIENT_SERVICES: {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    desc: "Service failures, breach of contract, airlines, banking",
  },
  UNFAIR_TRADE_PRACTICES: {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0l-3-7zM19 7l-3 7a4 4 0 0 0 6 0l-3-7z"/><path d="M5 7h14M9 21h6"/></svg>,
    desc: "Deceptive pricing, misleading representations, hoarding",
  },
  ECOMMERCE_DISPUTES: {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    desc: "Non-delivery, returns, marketplace liability, refunds",
  },
  MISLEADING_ADVERTISEMENTS: {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    desc: "False claims, deceptive ads, endorsement violations",
  },
  MEDICAL_NEGLIGENCE_CONSUMER: {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    desc: "Medical malpractice, hospital services, informed consent",
  },
};

const STEPS = ["Category", "Parties & Metadata", "Invite Counsel", "Review"];

export default function NewCaseClient({ userId }: { userId: Id<"users"> }) {
  const router = useRouter();
  const createCase = useMutation(api.cases.createCase);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [formData, setFormData] = useState({
    complainantName: "",
    complainantAddress: "",
    opposingPartyName: "",
    opposingPartyAddress: "",
    jurisdiction: "",
    claimAmount: "",
    reliefSought: "",
    opposingLawyerEmailInvite: "",
    barId: "",
    deadline: "7",
  });

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const selectedCat = CASE_CATEGORIES.find(c => c.id === category);

  const canNext = (): boolean => {
    if (step === 0) return !!category;
    if (step === 1) return !!(
      formData.complainantName &&
      formData.opposingPartyName &&
      formData.jurisdiction &&
      formData.claimAmount &&
      formData.reliefSought
    );
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const caseId = await createCase({
        category,
        complainantLawyerId: userId,
        complainantName: formData.complainantName,
        opposingPartyName: formData.opposingPartyName,
        claimAmount: parseFloat(formData.claimAmount) || 0,
        jurisdiction: formData.jurisdiction,
        reliefSought: formData.reliefSought,
        opposingLawyerEmailInvite: formData.opposingLawyerEmailInvite || undefined,
      });
      router.push(`/lawyer/cases/${caseId}`);
    } catch (e: any) {
      setError(e?.message || "Failed to create case.");
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      {/* Page head */}
      <div className="page-head">
        <div>
          <h1 className="page-title">File a new case</h1>
          <p className="page-sub">Generate a Case ID and invite opposing counsel</p>
        </div>
        <div className="page-actions">
          <button className="btn ghost" onClick={() => router.back()}>Cancel</button>
        </div>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div className={"step-pip " + (i === step ? "active" : i < step ? "done" : "")}>
              <div className="pip-num">{i < step ? <CheckIcon /> : i + 1}</div>
              <div className="pip-label">{label}</div>
            </div>
            {i < STEPS.length - 1 && <div className="step-line" style={{ flex: 1 }} />}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--red-bg)", color: "var(--red)", borderRadius: 8, fontSize: 13, border: "1px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
          {error}
        </div>
      )}

      {/* Step 0 — Category */}
      {step === 0 && (
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Select case category</h3>
            <span className="muted" style={{ fontSize: 12 }}>The Q&amp;A template adapts to the category you choose</span>
          </div>
          <div className="card-body">
            <div className="cat-grid">
              {CASE_CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={"cat-card " + (category === c.id ? "selected" : "")}
                  onClick={() => setCategory(c.id)}
                >
                  <div className="cat-icon">{CAT_META[c.id]?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="cat-name">{c.label}</div>
                    <div className="cat-desc">{CAT_META[c.id]?.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {category && (
              <div className="advisory-pill" style={{ marginTop: 18, background: "var(--primary-bg)", border: "1px solid color-mix(in oklch, var(--primary) 18%, transparent)", color: "var(--primary)" }}>
                <SparklesIcon />
                <div>
                  <strong>Q&amp;A template preview — {selectedCat?.label}</strong>
                  6 questions for complainant and 6 for opposing counsel, curated for this category under CPA 2019.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 1 — Parties & Metadata */}
      {step === 1 && (
        <div className="card">
          <div className="card-head"><h3 className="card-title">Parties &amp; metadata</h3></div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div className="cap-label" style={{ marginBottom: 10 }}>Complainant</div>
              <label className="label">Name / Entity</label>
              <input className="input" placeholder="Full name or company" value={formData.complainantName} onChange={e => set("complainantName", e.target.value)} />
              <label className="label" style={{ marginTop: 12 }}>Address</label>
              <input className="input" placeholder="Street, City, PIN" value={formData.complainantAddress} onChange={e => set("complainantAddress", e.target.value)} />
            </div>
            <div>
              <div className="cap-label" style={{ marginBottom: 10 }}>Opposite Party</div>
              <label className="label">Name / Entity</label>
              <input className="input" placeholder="Company or individual" value={formData.opposingPartyName} onChange={e => set("opposingPartyName", e.target.value)} />
              <label className="label" style={{ marginTop: 12 }}>Address</label>
              <input className="input" placeholder="Registered address" value={formData.opposingPartyAddress} onChange={e => set("opposingPartyAddress", e.target.value)} />
            </div>
            <div>
              <label className="label">Jurisdiction (DCDRC)</label>
              <input className="input" placeholder="e.g. DCDRC, Delhi" value={formData.jurisdiction} onChange={e => set("jurisdiction", e.target.value)} />
              <p className="help">DCDRC handles claims up to ₹50L under CPA 2019.</p>
            </div>
            <div>
              <label className="label">Claim amount (₹)</label>
              <input className="input" type="number" min="0" placeholder="0" value={formData.claimAmount} onChange={e => set("claimAmount", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Relief sought</label>
              <textarea className="textarea" rows={3} placeholder="Refund, replacement, compensation for mental agony, costs…" value={formData.reliefSought} onChange={e => set("reliefSought", e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Invite Counsel */}
      {step === 2 && (
        <div className="card">
          <div className="card-head"><h3 className="card-title">Invite opposing counsel</h3></div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="label">Counsel email</label>
                <input className="input" type="email" placeholder="opposing.counsel@law.in" value={formData.opposingLawyerEmailInvite} onChange={e => set("opposingLawyerEmailInvite", e.target.value)} />
                <p className="help">An invitation will be sent with the Case ID.</p>
              </div>
              <div>
                <label className="label">Bar Council ID (if known)</label>
                <input className="input" placeholder="DL/2024/1234" value={formData.barId} onChange={e => set("barId", e.target.value)} />
                <p className="help"><AlertIcon /> Not auto-verified in MVP — flagged for manual review.</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Q&amp;A response deadline</label>
                <select className="select" value={formData.deadline} onChange={e => set("deadline", e.target.value)}>
                  <option value="7">7 days (default)</option>
                  <option value="14">14 days</option>
                  <option value="21">21 days</option>
                </select>
              </div>
            </div>

            {formData.opposingLawyerEmailInvite && (
              <div style={{ marginTop: 18, padding: 14, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)" }}>
                <div className="cap-label">Email preview</div>
                <div style={{ marginTop: 8, fontFamily: "var(--serif)", fontSize: 14 }}>
                  <strong>Subject:</strong> Notice of representation — {formData.complainantName || "Complainant"} v. {formData.opposingPartyName || "Opposing Party"} · Case ID pending
                </div>
                <div className="muted" style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6 }}>
                  Dear Counsel,<br />
                  You have been listed as opposing counsel in this matter. Please sign in to Nyāya to review the complainant&apos;s structured Q&amp;A submission and respond within {formData.deadline} days. — {formData.jurisdiction || "DCDRC"} e-Filing
                </div>
              </div>
            )}

            {!formData.opposingLawyerEmailInvite && (
              <div className="advisory-pill" style={{ marginTop: 18 }}>
                <InfoIcon />
                <div>Opposing counsel invite is optional. You can proceed without it — the case will be created in DRAFT status.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3 — Review */}
      {step === 3 && (
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Review &amp; confirm</h3>
            <span className="badge green"><span className="dot" /> Ready to file</span>
          </div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[
              { l: "Case ID (auto)", v: <span className="case-id" style={{ fontSize: 13, fontWeight: 500 }}>Auto-generated on filing</span> },
              { l: "Category", v: selectedCat?.label || "—" },
              { l: "Complainant", v: formData.complainantName || "—" },
              { l: "Opposite Party", v: formData.opposingPartyName || "—" },
              { l: "Jurisdiction", v: formData.jurisdiction || "—" },
              { l: "Claim", v: formData.claimAmount ? "₹" + parseFloat(formData.claimAmount).toLocaleString("en-IN") : "—" },
              { l: "Opposing counsel", v: formData.opposingLawyerEmailInvite || "Not invited" },
              { l: "Q&A deadline", v: formData.deadline + " days from filing" },
            ].map((r, i) => (
              <div key={i}>
                <div className="cap-label">{r.l}</div>
                <div style={{ marginTop: 4, fontSize: 13 }}>{r.v}</div>
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }} className="advisory-pill">
              <InfoIcon />
              <div>By filing, you acknowledge that the platform&apos;s outputs are <strong>advisory</strong>. Lawyer submissions are treated as data, not instructions, by the LLM. All actions are audit-logged.</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}>
        <button className="btn" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>
          <ArrowLIcon /> Back
        </button>
        {step < 3 ? (
          <button className="btn primary" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
            Continue <ArrowRIcon />
          </button>
        ) : (
          <button className="btn primary lg" disabled={loading} onClick={handleSubmit}>
            <StampIcon /> {loading ? "Filing…" : "Generate Case ID & begin Q&A"}
          </button>
        )}
      </div>
    </div>
  );
}
