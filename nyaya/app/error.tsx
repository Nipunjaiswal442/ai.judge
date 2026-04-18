"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  const looksLikeStaleSession =
    error.message?.includes("Id") ||
    error.message?.includes("Validator") ||
    error.message?.includes("ArgumentValidationError");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#061735] via-[#0a1f44] to-[#1e3a8a] text-white p-6">
      <div className="max-w-md w-full bg-white text-slate-900 rounded-xl p-8 shadow-xl space-y-4">
        <h1 className="text-2xl font-heading font-bold text-[#0a1f44]">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-600">
          {looksLikeStaleSession
            ? "Your sign-in session is out of date. Please sign in again to continue."
            : "An unexpected error occurred."}
        </p>
        <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-3 overflow-auto max-h-32">
          {error.message}
        </pre>
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded bg-slate-100 text-slate-800 text-sm"
          >
            Try again
          </button>
          <Link
            href="/api/auth/signout?callbackUrl=/sign-in"
            className="px-4 py-2 rounded bg-[#0a1f44] text-white text-sm"
          >
            Sign out & restart
          </Link>
        </div>
      </div>
    </div>
  );
}
