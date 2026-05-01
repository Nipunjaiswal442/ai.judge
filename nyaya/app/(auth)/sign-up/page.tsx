"use client";

import { useAuth } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Chakra from "@/components/ui/chakra";
import { dashboardForRole, normalizeRole } from "@/lib/authRoles";

function ArrowRIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  );
}

type ClerkLikeError = {
  errors?: Array<{ longMessage?: string; message?: string }>;
  message?: string;
};

type RegisterResponse = {
  error?: string;
  dashboardUrl?: string;
  role?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const clerkError = error as ClerkLikeError;
  return (
    clerkError.errors?.[0]?.longMessage ||
    clerkError.errors?.[0]?.message ||
    clerkError.message ||
    fallback
  );
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const rolePrefix = normalizeRole(searchParams.get("role"));
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleLabel = rolePrefix === "JUDGE" ? "Judge" : "Counsel";
  const dashboardUrl = dashboardForRole(rolePrefix);

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace(`/auth/complete?role=${rolePrefix}`);
    }
  }, [authLoaded, isSignedIn, rolePrefix, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSignedIn) return;
    setLoading(true);
    setError("");

    try {
      // Step 1: Create user in Clerk
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || undefined,
        unsafeMetadata: { role: rolePrefix },
      });

      if (result.status === "complete") {
        // Step 2: Activate the session
        await setActive({ session: result.createdSessionId });

        // Step 3: Create Convex user + set Clerk publicMetadata
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, role: rolePrefix }),
        });
        const data = (await response.json().catch(() => ({}))) as RegisterResponse;

        if (!response.ok) {
          throw new Error(data.error || "Account was created, but setup could not be completed.");
        }

        router.replace(data.dashboardUrl || dashboardUrl);
        router.refresh();
      } else {
        // Should not happen when email verification is disabled in Clerk dashboard
        setError("Sign-up requires verification. Check your email.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
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
          <div style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 20, letterSpacing: "-0.02em", color: "white" }}>
            Nyāya <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 400 }}>न्याय</span>
          </div>
        </div>
        <div style={{ marginTop: "auto", maxWidth: 480, position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 16 }}>
            Join the workspace
          </div>
          <h1 className="serif" style={{ fontSize: 52, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0, color: "white" }}>
            Structured submissions.<br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>Faster hearings.</span>
          </h1>
          <p style={{ marginTop: 24, color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>
            Register your {roleLabel.toLowerCase()} account to access guided Q&amp;A, document management, and AI-assisted case analysis.
          </p>
        </div>
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: 11, position: "relative" }}>
          Academic / portfolio MVP · Not for production deployment without legal review
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="signin-form">
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Create account</h2>
          <p className="muted" style={{ margin: "0 0 28px", fontSize: 13 }}>
            Registering as <strong>{roleLabel}</strong>
          </p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 12px", background: "var(--red-bg)", color: "var(--red)", borderRadius: 7, fontSize: 13, border: "1px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
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
            <button type="submit" className="btn primary lg" style={{ width: "100%", justifyContent: "center", marginTop: 22 }} disabled={loading || !isLoaded}>
              {loading ? "Creating account…" : `Create ${roleLabel} account`}
              {!loading && <ArrowRIcon />}
            </button>
          </form>

          <p className="help" style={{ marginTop: 24, lineHeight: 1.6 }}>
            Already have an account?{" "}
            <Link href={`/sign-in`} style={{ color: "var(--primary)", textDecoration: "underline" }}>Sign in</Link>
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
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--navy-900)", color: "white" }}>Loading…</div>}>
      <SignUpContent />
    </Suspense>
  );
}
