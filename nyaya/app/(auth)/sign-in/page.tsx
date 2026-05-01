"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Chakra from "@/components/ui/chakra";

function ScaleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0l-3-7zM19 7l-3 7a4 4 0 0 0 6 0l-3-7zM5 7h14M9 21h6"/>
    </svg>
  );
}
function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  );
}
function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5"/><path d="M3 21a6 6 0 0 1 12 0M16 5a3.5 3.5 0 0 1 0 7M21 21a5.5 5.5 0 0 0-4-5.3"/>
    </svg>
  );
}
function ArrowRIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
  { key: "judge",              label: "Judge",               desc: "DCDRC presiding officer",        icon: <ScaleIcon /> },
  { key: "complainant_lawyer", label: "Complainant Counsel", desc: "Filing on behalf of consumer",   icon: <UserIcon /> },
  { key: "opposing_lawyer",    label: "Opposing Counsel",    desc: "Defending opposite party",       icon: <UsersIcon /> },
];

// Map UI role key → auth role query param
function roleToParam(key: string) {
  if (key === "judge") return "JUDGE";
  return "LAWYER";
}

function SignInContent() {
  const router = useRouter();
  const [role, setRole] = useState("judge");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(role === "judge" ? "/judge/dashboard" : "/lawyer/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    const callbackUrl = role === "judge" ? "/judge/dashboard" : "/lawyer/dashboard";
    const res = await signIn("google", { callbackUrl, redirect: false });
    if (res?.error) {
      setError("Google sign-in is unavailable right now. Use email/password.");
      setGoogleLoading(false);
      return;
    }
    if (res?.url) { router.push(res.url); return; }
    setGoogleLoading(false);
    setError("Google sign-in could not be started.");
  };

  const selectedRole = ROLES.find(r => r.key === role)!;

  return (
    <div className="signin">
      {/* ── Left art panel ── */}
      <div className="signin-art">
        {/* Chakra watermark */}
        <Chakra
          size={520}
          strokeWidth={0.6}
          style={{ position: "absolute", top: -120, right: -120, opacity: 0.10, color: "white" }}
        />

        {/* Brand */}
        <div className="row" style={{ gap: 10, alignItems: "center", position: "relative" }}>
          <Chakra size={28} strokeWidth={1.4} style={{ color: "white" }} />
          <div style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 20, letterSpacing: "-0.02em", color: "white" }}>
            Nyāya <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 400 }}>न्याय</span>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ marginTop: "auto", maxWidth: 480, position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
            An assistive layer for the bench &amp; the bar
          </div>
          <h1 className="serif" style={{ fontSize: 52, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0, color: "white" }}>
            Clarity for the bench.<br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>Structure for the bar.</span>
          </h1>
          <p style={{ marginTop: 24, color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>
            A neutral case-structuring platform for District Consumer Commissions under the Consumer Protection Act, 2019.
          </p>

          {/* Stats */}
          <div className="row" style={{ marginTop: 36, gap: 32, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {[
              { n: "50+", l: "Curated CPA precedents" },
              { n: "8 sections", l: "per analysis brief" },
              { n: "100%", l: "Sourced citations" },
            ].map(s => (
              <div key={s.l} className="col" style={{ gap: 4 }}>
                <span className="serif" style={{ fontSize: 22, color: "white", fontWeight: 500 }}>{s.n}</span>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: 11, position: "relative" }}>
          Academic / portfolio MVP · Not for production deployment without legal review · Aligned with SUPACE philosophy
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="signin-form">
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Sign in</h2>
          <p className="muted" style={{ margin: "0 0 28px", fontSize: 13 }}>Continue to the case workspace.</p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "var(--red-bg)", color: "var(--red)", borderRadius: 7, fontSize: 13, border: "1px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="col" style={{ gap: 8, marginBottom: 24 }}>
            <label className="label">I am signing in as</label>
            {ROLES.map(r => (
              <button
                key={r.key}
                type="button"
                className={"cat-card " + (role === r.key ? "selected" : "")}
                onClick={() => setRole(r.key)}
                style={{ padding: 12 }}
              >
                <div className="cat-icon">{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="cat-name">{r.label}</div>
                  <div className="cat-desc">{r.desc}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid var(--border-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {role === r.key && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--primary)" }} />}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="advocate@bar.in"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ marginBottom: 14 }}
            />

            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {role === "judge" && (
              <p className="help" style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
                <ShieldIcon /> Judicial accounts require admin verification (simulated in MVP)
              </p>
            )}

            <button
              type="submit"
              className="btn primary lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 22 }}
              disabled={loading}
            >
              {loading ? "Signing in…" : `Sign in as ${selectedRole.label}`}
              {!loading && <ArrowRIcon />}
            </button>
          </form>

          <div className="row" style={{ margin: "20px 0", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span className="muted" style={{ fontSize: 11 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button
            className="btn lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            type="button"
          >
            <GoogleIcon /> {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <p className="help" style={{ marginTop: 24, lineHeight: 1.6 }}>
            Don't have an account?{" "}
            <Link href={`/sign-up?role=${roleToParam(role)}`} style={{ color: "var(--primary)", textDecoration: "underline" }}>
              Register here
            </Link>
          </p>

          <p className="help" style={{ marginTop: 12, lineHeight: 1.6 }}>
            By continuing you agree to the platform's terms of use and acknowledge that all AI outputs are{" "}
            <strong>advisory only</strong> and not legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--navy-900)", color: "white" }}>
        Loading…
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
