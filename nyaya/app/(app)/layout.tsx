import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Chakra from "@/components/ui/chakra";

function ScaleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0l-3-7zM19 7l-3 7a4 4 0 0 0 6 0l-3-7zM5 7h14M9 21h6"/>
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v16a2 2 0 0 0 2 2h14V6H6a2 2 0 0 1-2-2zM6 4a2 2 0 0 0-2 2"/>
    </svg>
  );
}
function FilingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v6"/>
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}
function PaperclipIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 12-9.6 9.6a5 5 0 0 1-7-7l9.6-9.6a3.4 3.4 0 0 1 4.8 4.8l-9.5 9.5a1.7 1.7 0 0 1-2.4-2.4l8.6-8.6"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const id = session.user.id || "";
  const looksLikeConvexId = /^[a-z0-9]{20,}$/.test(id);
  if (!looksLikeConvexId) {
    await signOut({ redirectTo: "/sign-in" });
  }

  const role = session.user.role as string;
  const isJudge = role === "JUDGE";
  const name = session.user.name || session.user.email || "User";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

  const judgeNav = [
    { href: "/judge/dashboard", label: "Cases Assigned", icon: <ScaleIcon /> },
    { href: "/judge/dashboard", label: "Precedent Library", icon: <BookIcon /> },
    { href: "/judge/dashboard", label: "Audit Log", icon: <ShieldIcon /> },
    { href: "/judge/dashboard", label: "Calendar", icon: <CalendarIcon /> },
  ];

  const lawyerNav = [
    { href: "/lawyer/dashboard", label: "My Cases", icon: <FilingIcon /> },
    { href: "/lawyer/cases/new", label: "File New Case", icon: <PlusIcon /> },
    { href: "/lawyer/dashboard", label: "Active Q&A", icon: <DocIcon /> },
    { href: "/lawyer/dashboard", label: "Document Vault", icon: <PaperclipIcon /> },
    { href: "/lawyer/dashboard", label: "Precedent Library", icon: <BookIcon /> },
  ];

  const navItems = isJudge ? judgeNav : lawyerNav;

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <Link href={isJudge ? "/judge/dashboard" : "/lawyer/dashboard"} className="brand">
          <span className="brand-mark">
            <Chakra size={26} strokeWidth={1.4} />
          </span>
          <span className="brand-name">
            Nyāya<span className="devanagari">न्याय</span>
          </span>
        </Link>

        <div className="topbar-mid">
          <div className="crumbs">
            <span>{isJudge ? "Judge" : "Counsel"}</span>
            <span className="sep">›</span>
            <span className="here">{isJudge ? "Workspace" : "Workspace"}</span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="user-chip">
            <div className="avatar" style={{ background: isJudge ? "var(--primary)" : "var(--blue)" }}>
              {initials}
            </div>
            <span className="name">{name.split(" ")[0]}</span>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <button type="submit" className="icon-btn" title="Sign out">
              <LogoutIcon />
            </button>
          </form>
        </div>
      </header>

      {/* Main + sidebar */}
      <div className="main">
        <aside className="sidebar">
          <div className="side-section">
            <div className="side-label">Workspace</div>
            <nav className="side-nav">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} className="side-link">
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="side-foot">
            <div className="advisory-pill">
              <InfoIcon />
              <div>
                <strong>Analysis Brief — Not a Verdict</strong>
                All AI outputs are advisory. Decisional authority remains with the bench.
              </div>
            </div>
            <div className="row faint" style={{ fontSize: 10, justifyContent: "space-between" }}>
              <span>v0.4.2 · MVP</span>
              <span style={{ fontFamily: "var(--mono)" }}>Build 2026.05.01</span>
            </div>
          </div>
        </aside>

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
