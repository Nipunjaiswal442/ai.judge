"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CASE_CATEGORIES } from "@/lib/caseCategories";

// ── Icons ──────────────────────────────────────────────────
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function PaperclipIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m21 12-9.6 9.6a5 5 0 0 1-7-7l9.6-9.6a3.4 3.4 0 0 1 4.8 4.8l-9.5 9.5a1.7 1.7 0 0 1-2.4-2.4l8.6-8.6"/></svg>;
}
function ChevronRIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
}
function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
}
function ClockIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
}
function SparklesIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></svg>;
}
function BotIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7M8 7h8a2 2 0 0 1 2 2v2H6V9a2 2 0 0 1 2-2zM9 15h.01M15 15h.01"/></svg>;
}
function BeakerIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M10 3v6.3L4.7 19a2 2 0 0 0 1.8 3h11a2 2 0 0 0 1.8-3L14 9.3V3"/></svg>;
}
function InboxIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
}

// ── Helpers ────────────────────────────────────────────────
function statusProgress(status: string): number {
  const map: Record<string, number> = {
    DRAFT: 10,
    AWAITING_OPPOSING: 30,
    OPPOSING_IN_PROGRESS: 55,
    READY_FOR_BRIEF: 70,
    BRIEF_GENERATED: 85,
    JUDGE_REVIEWED: 100,
  };
  return map[status] ?? 0;
}

function statusTone(status: string): string {
  if (status === "JUDGE_REVIEWED") return "green";
  if (status === "BRIEF_GENERATED") return "violet";
  if (status === "READY_FOR_BRIEF") return "amber";
  if (status === "OPPOSING_IN_PROGRESS") return "blue";
  return "gray";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    AWAITING_OPPOSING: "Awaiting opposing",
    OPPOSING_IN_PROGRESS: "Opp. in progress",
    READY_FOR_BRIEF: "Ready for brief",
    BRIEF_GENERATED: "Brief ready",
    JUDGE_REVIEWED: "Reviewed",
  };
  return map[status] ?? status.replace(/_/g, " ");
}

function categoryShort(cat: string): string {
  const found = CASE_CATEGORIES.find(c => c.id === cat);
  if (found) return found.label.replace("(Consumer)", "").trim();
  return cat.replace(/_/g, " ");
}

// ── Main component ─────────────────────────────────────────
export default function LawyerDashboardClient({
  userId,
  email,
  counselType,
}: {
  userId: Id<"users">;
  email: string;
  counselType: "COMPLAINANT" | "OPPOSING";
}) {
  const cases = useQuery(api.cases.getLawyerCases, { lawyerId: userId });
  const invitations = useQuery(api.cases.getInvitationsForLawyer, { email, lawyerId: userId });
  const seedPrototype = useMutation(api.seed.seedPrototypeCase);
  const acceptCase = useMutation(api.cases.acceptOpposingCounsel);
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState("");

  const isOpposing = counselType === "OPPOSING";

  const handleSeedPrototype = async () => {
    if (seeding) return;
    setSeeding(true);
    setActionErr("");
    try {
      const caseId = await seedPrototype({ lawyerId: userId });
      router.push(`/lawyer/cases/${caseId}`);
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Could not load the prototype case.");
    } finally {
      setSeeding(false);
    }
  };

  const handleJoin = async (caseId: Id<"cases">) => {
    if (joining) return;
    setJoining(caseId);
    setActionErr("");
    try {
      await acceptCase({ caseId, lawyerId: userId });
      router.push(`/lawyer/cases/${caseId}`);
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Could not join this case.");
    } finally {
      setJoining(null);
    }
  };

  if (cases === undefined) {
    return (
      <div className="page">
        <div className="muted" style={{ fontSize: 13 }}>Loading cases…</div>
      </div>
    );
  }

  const filtered = cases.filter((c: any) => {
    const matchFilter =
      filter === "all" ? true :
      filter === "active" ? (c.status !== "JUDGE_REVIEWED" && c.status !== "BRIEF_GENERATED") :
      filter === "review" ? c.status === "BRIEF_GENERATED" :
      filter === "closed" ? c.status === "JUDGE_REVIEWED" : true;
    const matchSearch = !search ||
      c.humanId?.toLowerCase().includes(search.toLowerCase()) ||
      c.complainantName?.toLowerCase().includes(search.toLowerCase()) ||
      c.opposingPartyName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCnt   = cases.filter((c: any) => c.status !== "JUDGE_REVIEWED").length;
  const pendingQA   = cases.filter((c: any) => ["DRAFT", "AWAITING_OPPOSING", "OPPOSING_IN_PROGRESS"].includes(c.status)).length;
  const awaitingCnt = cases.filter((c: any) => c.status === "BRIEF_GENERATED").length;
  const totalClaim  = cases.reduce((s: number, c: any) => s + (c.claimAmount || 0), 0);

  const fmtClaim = (n: number) => {
    if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
    if (n >= 1000)   return "₹" + (n / 1000).toFixed(1) + "K";
    return "₹" + n;
  };

  return (
    <div className="page">
      {/* Watermark */}
      <svg className="watermark" style={{ top: -80, right: -120, width: 500, height: 500 }}
        viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4">
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          return <line key={i} x1={50 + 5 * Math.cos(a)} y1={50 + 5 * Math.sin(a)} x2={50 + 46 * Math.cos(a)} y2={50 + 46 * Math.sin(a)} />;
        })}
      </svg>

      {/* Page head */}
      <div className="page-head">
        <div>
          <div className="cap-label">{isOpposing ? "Opposing Counsel Workspace" : "Complainant Counsel Workspace"}</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{isOpposing ? "Defended Matters" : "My Cases"}</h1>
          <p className="page-sub">
            {activeCnt} active matters · {isOpposing ? "Defending opposite parties" : "Filing from your workspace"}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={handleSeedPrototype} disabled={seeding}>
            <BeakerIcon /> {seeding ? "Loading…" : "Load Prototype Case"}
          </button>
          {!isOpposing && (
            <Link href="/lawyer/cases/new" className="btn primary">
              <PlusIcon /> File New Case
            </Link>
          )}
        </div>
      </div>

      {actionErr && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--red-bg)", color: "var(--red)", fontSize: 13, border: "2px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
          {actionErr}
        </div>
      )}

      {/* Invitations to act as opposing counsel */}
      {invitations && invitations.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "color-mix(in oklch, var(--gold, #d97706) 30%, var(--border))" }}>
          <div className="card-head">
            <div className="row" style={{ gap: 8 }}>
              <InboxIcon />
              <h3 className="card-title">Case invitations — opposing counsel needed</h3>
            </div>
            <span className="badge gold"><span className="dot" /> {invitations.length} open</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {invitations.slice(0, 4).map((c: any, i: number, arr: any[]) => (
              <div key={c._id} className="row" style={{ padding: "12px 18px", gap: 12, borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.complainantName} v. {c.opposingPartyName}</div>
                  <div className="faint" style={{ fontSize: 11 }}>
                    <span className="case-id">{c.humanId}</span> · {categoryShort(c.category)} · ₹{(c.claimAmount || 0).toLocaleString("en-IN")}
                    {c.opposingLawyerEmailInvite?.toLowerCase() === email.toLowerCase() && (
                      <strong style={{ color: "var(--gold, #d97706)" }}> · invited by email</strong>
                    )}
                  </div>
                </div>
                <button className="btn primary sm" onClick={() => handleJoin(c._id)} disabled={joining === c._id}>
                  {joining === c._id ? "Joining…" : "Join as opposing counsel"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-label">Active matters</div>
          <div className="stat-value">{activeCnt}</div>
          <div className="stat-foot">Total cases: {cases.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pending Q&amp;A</div>
          <div className="stat-value">{pendingQA}</div>
          <div className="stat-foot"><ClockIcon /> Answers awaited</div>
        </div>
        <div className="stat">
          <div className="stat-label">Awaiting bench</div>
          <div className="stat-value">{awaitingCnt}</div>
          <div className="stat-foot">Avg time-to-brief <strong>3.2 days</strong></div>
        </div>
        <div className="stat">
          <div className="stat-label">Total claim value</div>
          <div className="stat-value">{fmtClaim(totalClaim)}</div>
          <div className="stat-foot">Across all live matters</div>
        </div>
      </div>

      {/* Case table */}
      {cases.length === 0 ? (
        <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>No cases yet</div>
          <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>
            {isOpposing
              ? "You have not joined any matters yet. Accept an invitation above, or load a prototype case to explore the workspace."
              : "You have not created any cases yet. File your first case, or load a prototype case to explore the workspace."}
          </p>
          <div className="row" style={{ justifyContent: "center", gap: 8 }}>
            {!isOpposing && (
              <Link href="/lawyer/cases/new" className="btn primary lg" style={{ display: "inline-flex" }}>
                <PlusIcon /> File your first case
              </Link>
            )}
            <button className="btn lg" onClick={handleSeedPrototype} disabled={seeding} style={{ display: "inline-flex" }}>
              <BeakerIcon /> {seeding ? "Loading…" : "Load a prototype case"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-head">
            <div className="row" style={{ gap: 4 }}>
              {[
                { k: "all",    l: "All" },
                { k: "active", l: "In progress" },
                { k: "review", l: "Brief ready" },
                { k: "closed", l: "Reviewed" },
              ].map(t => (
                <button key={t.k} className={"btn sm " + (filter === t.k ? "primary" : "ghost")} onClick={() => setFilter(t.k)}>
                  {t.l}
                </button>
              ))}
            </div>
            <div className="search-wrap" style={{ width: 240 }}>
              <SearchIcon />
              <input className="input" placeholder="Search by Case ID, party…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              No cases match this filter.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Case</th>
                  <th>Category</th>
                  <th>Side</th>
                  <th>Claim</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => {
                  const isComplainant = c.complainantLawyerId === userId;
                  const progress = statusProgress(c.status);
                  const tone = statusTone(c.status);
                  return (
                    <tr key={c._id} onClick={() => router.push(`/lawyer/cases/${c._id}`)}>
                      <td>
                        <div className="ttl">{c.complainantName} v. {c.opposingPartyName}</div>
                        <div className="meta case-id">{c.humanId}</div>
                      </td>
                      <td><span className="muted">{categoryShort(c.category)}</span></td>
                      <td>
                        <span className={"badge " + (isComplainant ? "blue" : "gold")}>
                          <span className="dot" />
                          {isComplainant ? "Complainant" : "Opposing"}
                        </span>
                      </td>
                      <td className="tnum">₹{(c.claimAmount || 0).toLocaleString("en-IN")}</td>
                      <td><span className={"badge " + tone}>{statusLabel(c.status)}</span></td>
                      <td style={{ width: 140 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <div className="bar" style={{ flex: 1 }}><span style={{ width: progress + "%" }} /></div>
                          <span className="muted tnum" style={{ fontSize: 11, minWidth: 28 }}>{progress}%</span>
                        </div>
                      </td>
                      <td>
                        <button className="icon-btn"><ChevronRIcon /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Activity + Deadlines */}
      {cases.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 16 }}>
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {cases.slice(0, 4).map((c: any, i: number, arr: any[]) => (
                <div key={c._id} className="row" style={{ padding: "12px 18px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 0, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--primary)", flexShrink: 0 }}>
                    <SparklesIcon />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13 }}>
                      <span className="muted">Status: </span>
                      <strong>{statusLabel(c.status)}</strong> — {c.complainantName} v. {c.opposingPartyName}
                    </div>
                    <div className="faint" style={{ fontSize: 11, fontFamily: "var(--mono)" }}>{c.humanId}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Cases Needing Action</h3>
              {pendingQA > 0 && (
                <span className="badge amber"><span className="dot" /> {pendingQA} pending</span>
              )}
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {cases.filter((c: any) => c.status !== "JUDGE_REVIEWED").slice(0, 4).map((c: any, i: number, arr: any[]) => (
                <div key={c._id} onClick={() => router.push(`/lawyer/cases/${c._id}`)} style={{ cursor: "pointer", padding: "12px 18px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "grid", placeItems: "center", width: 44, padding: "4px 0", border: "2px solid var(--border)", borderRadius: 0, background: "var(--bg-2)" }}>
                    <div className="cap-label" style={{ fontSize: 9 }}>{c.status === "DRAFT" ? "DRAFT" : "ACT"}</div>
                    <div className="serif tnum" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>
                      {statusProgress(c.status)}%
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.complainantName} v. {c.opposingPartyName}
                    </div>
                    <div className="faint" style={{ fontSize: 11 }}>{statusLabel(c.status)}</div>
                  </div>
                  <span className={"badge " + statusTone(c.status)}>{statusLabel(c.status)}</span>
                </div>
              ))}
              {cases.filter((c: any) => c.status !== "JUDGE_REVIEWED").length === 0 && (
                <div style={{ padding: "24px 18px", color: "var(--text-3)", fontSize: 13, textAlign: "center" }}>
                  All caught up ✓
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Research chatbot lives exclusively on the Research Q&A page */}
      <div style={{ marginTop: 24 }}>
        <div className="card" style={{ borderColor: "color-mix(in oklch, var(--primary) 18%, var(--border))" }}>
          <div className="card-body row" style={{ justifyContent: "space-between", gap: 16 }}>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 0, background: "var(--primary-bg)", color: "var(--primary)", display: "grid", placeItems: "center" }}>
                <BotIcon />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Need case research or CPA 2019 answers?</div>
                <div className="faint" style={{ fontSize: 11.5 }}>
                  The Counsel Research Assistant now lives in its own Q&amp;A workspace.
                </div>
              </div>
            </div>
            <Link href="/lawyer/qa" className="btn primary">
              Open Research Q&amp;A <ChevronRIcon />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
