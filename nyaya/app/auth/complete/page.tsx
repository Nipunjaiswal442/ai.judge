"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { dashboardForRole, normalizeRole } from "@/lib/authRoles";

type RegisterResponse = {
  error?: string;
  dashboardUrl?: string;
  role?: string;
};

async function syncAccount(role: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const data = (await response.json().catch(() => ({}))) as RegisterResponse;

  if (!response.ok) {
    throw new Error(data.error || "Could not finish account setup.");
  }

  return data.dashboardUrl || dashboardForRole(data.role || role);
}

function AuthCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const role = normalizeRole(searchParams.get("role"));
  const startedRef = useRef(false);
  const [error, setError] = useState("");

  const finish = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setError("");

    try {
      const destination = await syncAccount(role);
      router.replace(destination);
      router.refresh();
    } catch (err: unknown) {
      startedRef.current = false;
      setError(err instanceof Error ? err.message : "Could not finish account setup.");
    }
  }, [role, router]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace(`/sign-in?role=${role}`);
      return;
    }

    void finish();
  }, [finish, isLoaded, isSignedIn, role, router]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--navy-900)", color: "white", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 24, background: "rgba(255,255,255,0.06)" }}>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 8px" }}>
          Finishing sign-in
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, fontSize: 14 }}>
          Syncing your secure workspace before opening the dashboard.
        </p>

        {error && (
          <div style={{ marginTop: 18 }}>
            <div style={{ padding: "10px 12px", background: "rgba(248,113,113,0.14)", color: "#fecaca", borderRadius: 7, fontSize: 13, border: "1px solid rgba(248,113,113,0.28)" }}>
              {error}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn primary" type="button" onClick={() => void finish()}>
                Try again
              </button>
              <button className="btn" type="button" onClick={() => signOut({ redirectUrl: "/" })}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--navy-900)", color: "white" }}>Loading…</div>}>
      <AuthCompleteContent />
    </Suspense>
  );
}
