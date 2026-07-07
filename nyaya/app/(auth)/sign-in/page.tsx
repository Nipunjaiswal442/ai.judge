"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebaseClient";
import Chakra from "@/components/ui/chakra";
import { counselTypeForRoleKey, dashboardForRole, searchRoleToSignInKey, signInRoleKeyToAppRole } from "@/lib/authRoles";

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
function ArrowRIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.33z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.29-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC04" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15A11 11 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

const ROLES = [
  { key: "judge",              label: "Judge",               desc: "DCDRC presiding officer",      icon: <ScaleIcon /> },
  { key: "complainant_lawyer", label: "Complainant Counsel", desc: "Filing on behalf of consumer", icon: <UserIcon /> },
  { key: "opposing_lawyer",    label: "Opposing Counsel",    desc: "Defending opposite party",     icon: <UsersIcon /> },
];

type RegisterResponse = {
  error?: string;
  dashboardUrl?: string;
  role?: string;
};

function friendlyFirebaseError(error: unknown, fallback: string) {
  const code = (error as { code?: string })?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Popup blocked by the browser. Allow popups and retry.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and retry.";
    default:
      return (error as { message?: string })?.message || fallback;
  }
}

// Create the server session cookie, then ensure the Convex account exists.
async function establishSession(user: User, roleKey: string) {
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

  const appRole = signInRoleKeyToAppRole(roleKey);
  const registerRes = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: appRole, counselType: counselTypeForRoleKey(roleKey) }),
  });
  const data = (await registerRes.json().catch(() => ({}))) as RegisterResponse;
  if (!registerRes.ok) {
    throw new Error(data.error || "Could not finish account setup.");
  }

  return data.dashboardUrl || dashboardForRole(data.role || appRole);
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState(() => searchRoleToSignInKey(searchParams.get("role")));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(searchRoleToSignInKey(searchParams.get("role")));
  }, [searchParams]);

  const selectedRole = ROLES.find(r => r.key === role)!;
  const busy = loading || googleLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const destination = await establishSession(cred.user, role);
      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyFirebaseError(err, "Sign-in failed. Please try again."));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setGoogleLoading(true);
    setError("");
    try {
      const cred = await signInWithPopup(firebaseAuth, googleProvider);
      const destination = await establishSession(cred.user, role);
      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyFirebaseError(err, "Google sign-in failed."));
      setGoogleLoading(false);
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
            An assistive layer for the bench &amp; the bar
          </div>
          <h1 className="serif" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0, color: "white" }}>
            Clarity for the bench.<br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>Structure for the bar.</span>
          </h1>
          <p style={{ marginTop: 24, color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>
            A neutral case-structuring platform for District Consumer Commissions under the Consumer Protection Act, 2019.
          </p>
          <div className="row" style={{ marginTop: 36, gap: 32, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {[{ n: "50+", l: "Curated CPA precedents" }, { n: "8 sections", l: "per analysis brief" }, { n: "100%", l: "Sourced citations" }].map(s => (
              <div key={s.l} className="col" style={{ gap: 4 }}>
                <span className="serif" style={{ fontSize: 22, color: "white", fontWeight: 700 }}>{s.n}</span>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "2px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: 11, position: "relative" }}>
          Academic / portfolio MVP · Not for production deployment without legal review · Aligned with SUPACE philosophy
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="signin-form">
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Sign in</h2>
          <p className="muted" style={{ margin: "0 0 28px", fontSize: 13 }}>Continue to the case workspace.</p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "var(--red-bg)", color: "var(--red)", fontSize: 13, fontWeight: 600, border: "2px solid var(--red)" }}>
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="col" style={{ gap: 8, marginBottom: 24 }}>
            <label className="label">I am signing in as</label>
            {ROLES.map(r => (
              <button key={r.key} type="button" className={"cat-card " + (role === r.key ? "selected" : "")} onClick={() => setRole(r.key)} style={{ padding: 12 }}>
                <div className="cat-icon">{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="cat-name">{r.label}</div>
                  <div className="cat-desc">{r.desc}</div>
                </div>
                <div style={{ width: 18, height: 18, border: "2px solid var(--text)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {role === r.key && <div style={{ width: 8, height: 8, background: "var(--text)" }} />}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="advocate@bar.in" required value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 14 }} />
            <label className="label">Password</label>
            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            {role === "judge" && (
              <p className="help" style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
                <ShieldIcon /> Judicial accounts require admin verification (simulated in MVP)
              </p>
            )}
            <button type="submit" className="btn primary lg" style={{ width: "100%", justifyContent: "center", marginTop: 22 }} disabled={busy}>
              {loading ? "Signing in…" : `Sign in as ${selectedRole.label}`}
              {!loading && <ArrowRIcon />}
            </button>
          </form>

          <div className="row" style={{ margin: "20px 0", gap: 12 }}>
            <div style={{ flex: 1, height: 2, background: "var(--border)" }} />
            <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 2, background: "var(--border)" }} />
          </div>

          <button className="btn lg" style={{ width: "100%", justifyContent: "center" }} onClick={handleGoogleSignIn} disabled={busy} type="button">
            <GoogleIcon /> {googleLoading ? "Waiting for Google…" : "Continue with Google"}
          </button>

          <p className="help" style={{ marginTop: 24, lineHeight: 1.6 }}>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 700 }}>Register here</Link>
          </p>
          <p className="help" style={{ marginTop: 12, lineHeight: 1.6 }}>
            By continuing you agree to the platform&apos;s terms of use and acknowledge that all AI outputs are <strong>advisory only</strong> and not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--ink-900)", color: "white" }}>Loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}
