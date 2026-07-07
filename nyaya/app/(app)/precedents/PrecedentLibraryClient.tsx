"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function BookIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
}
function GavelIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/></svg>;
}
function DownloadIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;
}

export default function PrecedentLibraryClient() {
  const [keyword, setKeyword] = useState("");
  const [section, setSection] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedErr, setSeedErr] = useState("");

  const precedents = useQuery(api.precedents.listPrecedents, {
    keyword: keyword.trim() || undefined,
    cpaSection: section || undefined,
  });
  const allPrecedents = useQuery(api.precedents.listPrecedents, {});
  const seedCurated = useMutation(api.precedents.seedCurated);

  const sections = useMemo(() => {
    const s = new Set<string>();
    (allPrecedents || []).forEach((p: any) => p.cpaSections.forEach((x: string) => s.add(x)));
    return Array.from(s).sort();
  }, [allPrecedents]);

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedErr("");
    try {
      await seedCurated({});
    } catch (e) {
      setSeedErr(e instanceof Error ? e.message : "Could not load the curated set.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="cap-label">Research</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Precedent Library</h1>
          <p className="page-sub">
            Curated CPA 2019 decisions — the closed citation set used by analysis briefs and the research assistant.
          </p>
        </div>
      </div>

      {seedErr && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--red-bg)", color: "var(--red)", fontSize: 13, border: "2px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
          {seedErr}
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div className="row" style={{ gap: 10 }}>
            <div className="search-wrap" style={{ width: 280 }}>
              <SearchIcon />
              <input
                className="input"
                placeholder="Search title, summary, keywords…"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <select className="sel" style={{ width: 240 }} value={section} onChange={e => setSection(e.target.value)}>
              <option value="">All CPA sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            {precedents ? `${precedents.length} decision${precedents.length === 1 ? "" : "s"}` : "Loading…"}
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {precedents === undefined && (
            <div style={{ padding: "32px 24px", fontSize: 13, color: "var(--text-3)" }}>Loading library…</div>
          )}

          {precedents && precedents.length === 0 && (allPrecedents?.length ?? 0) === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div className="serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Library is empty</div>
              <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
                Load the curated CPA 2019 sample set to enable grounded citations in briefs and research answers.
              </p>
              <button className="btn primary" onClick={handleSeed} disabled={seeding}>
                <DownloadIcon /> {seeding ? "Loading…" : "Load curated set"}
              </button>
            </div>
          )}

          {precedents && precedents.length === 0 && (allPrecedents?.length ?? 0) > 0 && (
            <div style={{ padding: "32px 24px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
              No precedents match this search.
            </div>
          )}

          {precedents && precedents.length > 0 && (
            <div className="col" style={{ padding: 16, gap: 12 }}>
              {precedents.map((p: any) => (
                <div key={p._id} style={{ padding: 16, border: "2px solid var(--border)", background: "var(--surface)" }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                        <GavelIcon />
                        <div className="serif" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.3 }}>{p.title}</div>
                      </div>
                      <div className="case-id">{p.citation} · {p.commission} · {p.year}</div>
                    </div>
                    <span className="badge green">{p.outcome ? "Decided" : "Cited"}</span>
                  </div>
                  <p style={{ margin: "10px 0 8px", fontSize: 13, lineHeight: 1.65, color: "var(--text-2)" }}>{p.summary}</p>
                  <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.5, color: "var(--text-3)" }}>
                    <strong>Outcome:</strong> {p.outcome}
                  </p>
                  <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                    {p.cpaSections.map((s: string) => (
                      <span key={s} className="badge violet" style={{ fontSize: 10.5 }}><BookIcon size={10} /> {s}</span>
                    ))}
                    {p.keywords.slice(0, 5).map((k: string) => (
                      <span key={k} className="badge gray" style={{ fontSize: 10.5 }}>{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
