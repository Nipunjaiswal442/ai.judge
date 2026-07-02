"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  );
}

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Clear the server session cookie first, then the client SDK state.
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(firebaseAuth).catch(() => {});
    } finally {
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <button className="icon-btn" title="Sign out" onClick={handleSignOut} disabled={busy}>
      <LogoutIcon />
    </button>
  );
}
