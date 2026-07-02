"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  const looksLikeStaleSession =
    error.message?.includes("Id") ||
    error.message?.includes("Validator") ||
    error.message?.includes("ArgumentValidationError");

  const handleSignOutRestart = async () => {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--ink-900, #0a0a0a)", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", background: "#fff", border: "3px solid #0a0a0a", boxShadow: "8px 8px 0 #6fa8ff", padding: 28 }}>
        <h1 style={{ fontFamily: "var(--serif, Georgia)", fontSize: 26, fontWeight: 800, textTransform: "uppercase", margin: "0 0 10px", color: "#0a0a0a" }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 13, color: "#3a3a3a", margin: "0 0 14px", lineHeight: 1.6 }}>
          {looksLikeStaleSession
            ? "Your sign-in session is out of date. Sign in again to continue."
            : "An unexpected error occurred."}
        </p>
        <pre style={{ fontSize: 11, background: "#f5f1e6", border: "2px solid #0a0a0a", padding: 10, overflow: "auto", maxHeight: 120, margin: "0 0 18px" }}>
          {error.message}
        </pre>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => reset()}
            style={{ padding: "10px 16px", border: "2px solid #0a0a0a", background: "#fff", color: "#0a0a0a", fontWeight: 800, fontSize: 12, textTransform: "uppercase", cursor: "pointer", boxShadow: "3px 3px 0 #0a0a0a" }}
          >
            Try again
          </button>
          <button
            onClick={handleSignOutRestart}
            style={{ padding: "10px 16px", border: "2px solid #0a0a0a", background: "#0a0a0a", color: "#fff", fontWeight: 800, fontSize: 12, textTransform: "uppercase", cursor: "pointer", boxShadow: "3px 3px 0 #6fa8ff" }}
          >
            Sign out &amp; restart
          </button>
        </div>
      </div>
    </div>
  );
}
