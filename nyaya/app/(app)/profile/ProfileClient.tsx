"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function UserIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
}
function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ShieldIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProfileClient({
  userId,
  role,
  email,
}: {
  userId: Id<"users">;
  role: string;
  email: string;
}) {
  const router = useRouter();
  const user = useQuery(api.users.getUserById, { userId });
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState("");
  const [barCouncilId, setBarCouncilId] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [phone, setPhone] = useState("");
  const [counselType, setCounselType] = useState<"COMPLAINANT" | "OPPOSING">("COMPLAINANT");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || loaded) return;
    setName(user.name || "");
    setBarCouncilId(user.barCouncilId || "");
    setJurisdiction(user.jurisdiction || "");
    setPhone(user.phone || "");
    setCounselType(user.counselType === "OPPOSING" ? "OPPOSING" : "COMPLAINANT");
    setLoaded(true);
  }, [user, loaded]);

  if (user === undefined) {
    return <div className="page"><div className="muted" style={{ fontSize: 13 }}>Loading profile…</div></div>;
  }
  if (user === null) {
    return <div className="page"><div className="muted" style={{ fontSize: 13 }}>Profile not found.</div></div>;
  }

  const isJudge = role === "JUDGE";
  const roleLabel = isJudge
    ? "Judge · DCDRC Presiding Officer"
    : counselType === "OPPOSING"
    ? "Opposing Counsel"
    : "Complainant Counsel";

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateProfile({
        userId,
        name,
        barCouncilId,
        jurisdiction,
        phone,
        counselType: isJudge ? undefined : counselType,
      });
      setSaved(true);
      // Layout crumbs / dashboards read the server user — refresh them.
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <div className="page-head">
        <div>
          <div className="cap-label">Account</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>My Profile</h1>
          <p className="page-sub">{roleLabel}</p>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--red-bg)", color: "var(--red)", fontSize: 13, border: "2px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Editable details */}
        <div className="card">
          <div className="card-head">
            <div className="row" style={{ gap: 8 }}>
              <UserIcon />
              <h3 className="card-title">Professional details</h3>
            </div>
            {saved && <span className="badge green"><CheckIcon /> Saved</span>}
          </div>
          <div className="card-body" style={{ display: "grid", gap: 14 }}>
            <div>
              <label className="label">Full name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Adv. Ramesh Kumar" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="label">{isJudge ? "Judicial service ID" : "Bar Council ID"}</label>
                <input className="input" value={barCouncilId} onChange={e => setBarCouncilId(e.target.value)} placeholder={isJudge ? "KSJ/2010/114" : "KAR/1234/2015"} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98XXXXXX21" />
              </div>
            </div>
            <div>
              <label className="label">Jurisdiction</label>
              <input className="input" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} placeholder="Bengaluru Urban, Karnataka" />
            </div>

            {!isJudge && (
              <div>
                <label className="label">I primarily practice as</label>
                <div className="row" style={{ gap: 8 }}>
                  {([
                    { k: "COMPLAINANT" as const, l: "Complainant Counsel", d: "Files consumer cases" },
                    { k: "OPPOSING" as const, l: "Opposing Counsel", d: "Defends opposite parties" },
                  ]).map(o => (
                    <button
                      key={o.k}
                      type="button"
                      className={"cat-card " + (counselType === o.k ? "selected" : "")}
                      style={{ flex: 1, padding: 12 }}
                      onClick={() => setCounselType(o.k)}
                    >
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div className="cat-name">{o.l}</div>
                        <div className="cat-desc">{o.d}</div>
                      </div>
                      {counselType === o.k && <CheckIcon />}
                    </button>
                  ))}
                </div>
                <p className="help" style={{ marginTop: 8 }}>
                  This tailors your dashboard. You can still act on the other side of a case you are already party to.
                </p>
              </div>
            )}

            <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
              <button className="btn primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Read-only account info */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3 className="card-title">Account</h3></div>
            <div className="card-body col" style={{ gap: 10, fontSize: 12.5 }}>
              <div>
                <div className="cap-label" style={{ marginBottom: 2 }}>Email</div>
                <div style={{ wordBreak: "break-all" }}>{email}</div>
              </div>
              <div>
                <div className="cap-label" style={{ marginBottom: 2 }}>Role</div>
                <span className={"badge " + (isJudge ? "violet" : counselType === "OPPOSING" ? "gold" : "blue")}>
                  <span className="dot" />{isJudge ? "Judge" : counselType === "OPPOSING" ? "Opposing Counsel" : "Complainant Counsel"}
                </span>
              </div>
              <div>
                <div className="cap-label" style={{ marginBottom: 2 }}>Verification</div>
                <div className="row" style={{ gap: 6, color: "var(--text-3)" }}>
                  <ShieldIcon /> {isJudge ? "Judicial account (verification simulated in MVP)" : "Bar verification simulated in MVP"}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text-3)" }}>
              Your email and role are fixed at registration. Professional details entered here appear
              to the bench on your cases&apos; counsel-on-record panel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
