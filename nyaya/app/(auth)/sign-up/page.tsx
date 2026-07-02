"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";
import Chakra from "@/components/ui/chakra";
import { dashboardForRole, searchRoleToSignInKey, signInRoleKeyToAppRole } from "@/lib/authRoles";

function ArrowRIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  );
}
function ScaleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0l-3-7zM19 7l-3 7a4 4 0 0 0 6 0l-3-7zM5 7h14M9 21h6"/>
    </svg>
  );
}
function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  );
}
function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <circle cx="9" cy="8" r="3.5"/><path d="M3 21a6 6 0 0 1 12 0M16 5a3.5 3.5 0 0 1 0 7M21 21a5.5 5.5 0 0 0-4-5.3"/>
    </svg>
  );
}

const ROLES = [
  { key: "judge",              label: "Judge",               desc: "DCDRC presiding officer — reviews analysis briefs",     icon: <ScaleIcon /> },
  { key: "complainant_lawyer", label: "Complainant Counsel", desc: "Files consumer cases and answers guided Q&A",           icon: <UserIcon /> },
  { key: "opposing_lawyer",    label: "Opposing Counsel",    desc: "Joins invited cases to defend the opposite party",      icon: <UsersIcon /> },
];

type RegisterResponse = {
  error?: string;
  dashboardUrl?: string;
  role?: string;
};

function friendlyFirebaseError(error: unknown, fallback: string) {
  const code = (error as { code?: string })?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and retry.";
    default:
      return (error as { message?: string })?.message || fallback;
  }
}

async function establishSession(user: User, name: string, role: string) {
  const idToken = await user.getIdToken();

  const sessionRes = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!sessionRes.ok) {
    const data = (await sessionRes.json().catch(() => ({}))) as RegisterResponse;
    throw new Error(data.error || "Could not create a secure session.");
  }

  const registerRes = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role }),
  });
  const data = (await registerRes.json().catch(() => ({}))) as RegisterResponse;
  if (!registerRes.ok) {
    throw new Error(data.error || "Account was created, but setup could not be completed.");
  }

  return data.dashboardUrl || dashboardForRole(data.role || role);
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [roleKey, setRoleKey] = useState(() => searchRoleToSignInKey(searchParams.get("role")));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = ROLES.find(r => r.key === roleKey)!;
  const roleLabel = selectedRole.label;
  const appRole = signInRoleKeyToAppRole(roleKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(cred.user, { displayName: name }).catch(() => {});
      const destination = await establishSession(cred.user, name, appRole);
      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyFirebaseError(err, "Registration failed. Please try again."));
      setLoading(false);
    }
  };

  return (
    <div className="signin">
      {/* ── Left art panel ── */}
      <div className="signin-art">
        <Chakra size={520} strokeWidth={0.6} style={{ position: "absolute", top: -120, right: -120, opacity: 0.10, color: "white" }} />
        <div className="row" style={{ gap: 10, alignItems: "center", position: "relative" }}>
          <Chakra size={28} strokeWidth={1.4} style={{ color: "white" }} />
          <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "white" }}>
            Nyāya <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 400 }}>न्याय</span>
          </div>
        </div>
        <div style={{ marginTop: "auto", maxWidth: 480, position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>
            Join the workspace
          </div>
          <h1 className="serif" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0, color: "white" }}>
            Structured submissions.<br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>Faster hearings.</span>
          </h1>
          <p style={{ marginTop: 24, color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>
            Register your {roleLabel.toLowerCase()} account to access guided Q&amp;A, document management, and AI-assisted case analysis.
          </p>
        </div>
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "2px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 11, position: "relative" }}>
          Academic / portfolio MVP · Not for production deployment without legal review
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="signin-form">
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Create account</h2>
          <p className="muted" style={{ margin: "0 0 24px", fontSize: 13 }}>
            Registering as <strong>{roleLabel}</strong>
          </p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "var(--red-bg)", color: "var(--red)", fontSize: 13, fontWeight: 600, border: "2px solid var(--red)" }}>
              {error}
            </div>
          )}

          {/* Role selector — one card per party */}
          <div className="col" style={{ gap: 8, marginBottom: 24 }}>
            <label className="label">I am registering as</label>
            {ROLES.map(r => (
              <button key={r.key} type="button" className={"cat-card " + (roleKey === r.key ? "selected" : "")} onClick={() => setRoleKey(r.key)} style={{ padding: 12 }}>
                <div className="cat-icon">{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="cat-name">{r.label}</div>
                  <div className="cat-desc">{r.desc}</div>
                </div>
                <div style={{ width: 18, height: 18, border: "2px solid var(--text)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {roleKey === r.key && <div style={{ width: 8, height: 8, background: "var(--text)" }} />}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <label className="label">Full name</label>
            <input className="input" placeholder="Ramesh Kumar" required value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 14 }} />
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="advocate@bar.in" required value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 14 }} />
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="btn primary lg" style={{ width: "100%", justifyContent: "center", marginTop: 22 }} disabled={loading}>
              {loading ? "Creating account…" : `Create ${roleLabel} account`}
              {!loading && <ArrowRIcon />}
            </button>
          </form>

          <p className="help" style={{ marginTop: 24, lineHeight: 1.6 }}>
            Already have an account?{" "}
            <Link href={`/sign-in`} style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 700 }}>Sign in</Link>
          </p>
          <p className="help" style={{ marginTop: 12, lineHeight: 1.6 }}>
            All AI outputs are <strong>advisory only</strong> and not legal advice. Case data is encrypted at rest and in transit.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--ink-900)", color: "white" }}>Loading…</div>}>
      <SignUpContent />
    </Suspense>
  );
}
