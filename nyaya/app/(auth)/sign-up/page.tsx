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
import { dashboardForRole, normalizeRole } from "@/lib/authRoles";

function ArrowRIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  );
}

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
  const rolePrefix = normalizeRole(searchParams.get("role"));
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleLabel = rolePrefix === "JUDGE" ? "Judge" : "Counsel";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(cred.user, { displayName: name }).catch(() => {});
      const destination = await establishSession(cred.user, name, rolePrefix);
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
          <p className="muted" style={{ margin: "0 0 28px", fontSize: 13 }}>
            Registering as <strong>{roleLabel}</strong>
          </p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "var(--red-bg)", color: "var(--red)", fontSize: 13, fontWeight: 600, border: "2px solid var(--red)" }}>
              {error}
            </div>
          )}

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
