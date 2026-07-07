"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function PaperclipIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m21 12-9.6 9.6a5 5 0 0 1-7-7l9.6-9.6a3.4 3.4 0 0 1 4.8 4.8l-9.5 9.5a1.7 1.7 0 0 1-2.4-2.4l8.6-8.6"/></svg>;
}
function UploadIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
}
function FileIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>;
}
function DownloadIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;
}

function fmtSizeLabel(mime: string) {
  if (mime.includes("pdf")) return "PDF";
  if (mime.startsWith("image/")) return mime.replace("image/", "").toUpperCase();
  if (mime.includes("word") || mime.includes("document")) return "DOC";
  if (mime.includes("sheet") || mime.includes("excel")) return "XLS";
  return mime.split("/").pop()?.slice(0, 4).toUpperCase() || "FILE";
}

export default function DocumentVaultClient({ userId }: { userId: Id<"users"> }) {
  const cases = useQuery(api.cases.getLawyerCases, { lawyerId: userId });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);

  const [caseId, setCaseId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!caseId && cases && cases.length > 0) setCaseId(cases[0]._id);
  }, [cases, caseId]);

  const documents = useQuery(
    api.documents.listByCase,
    caseId ? { caseId: caseId as Id<"cases"> } : "skip"
  );

  const activeCase = cases?.find((c: any) => c._id === caseId);

  const handleUpload = async (file: File) => {
    if (!caseId || uploading) return;
    setUploading(true);
    setError("");
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed. Try again.");
      const { storageId } = await res.json();
      await saveDocument({
        caseId: caseId as Id<"cases">,
        uploadedByUserId: userId,
        storageId,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload the document.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="cap-label">Evidence &amp; Filings</div>
          <h1 className="page-title" style={{ marginTop: 6 }}>Document Vault</h1>
          <p className="page-sub">
            Upload and manage evidence per case — invoices, warranty cards, correspondence, medical records.
          </p>
        </div>
        <div className="page-actions">
          <input
            ref={fileInput}
            type="file"
            style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
          <button
            className="btn primary"
            disabled={!caseId || uploading}
            onClick={() => fileInput.current?.click()}
          >
            <UploadIcon /> {uploading ? "Uploading…" : "Upload document"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--red-bg)", color: "var(--red)", fontSize: 13, border: "2px solid color-mix(in oklch, var(--red) 30%, transparent)" }}>
          {error}
        </div>
      )}

      {cases !== undefined && cases.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>No cases yet</div>
          <p className="muted" style={{ fontSize: 13 }}>
            The vault stores documents per case. Create or join a case first, then upload evidence here.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-head">
            <div className="row" style={{ gap: 10 }}>
              <PaperclipIcon />
              <select className="sel" style={{ minWidth: 320 }} value={caseId} onChange={e => setCaseId(e.target.value)}>
                {(cases || []).map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.humanId} — {c.complainantName} v. {c.opposingPartyName}
                  </option>
                ))}
              </select>
            </div>
            {activeCase && (
              <span className="badge gray">{activeCase.status.replace(/_/g, " ")}</span>
            )}
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {documents === undefined && (
              <div style={{ padding: "28px 24px", fontSize: 13, color: "var(--text-3)" }}>Loading documents…</div>
            )}
            {documents && documents.length === 0 && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ marginBottom: 8, color: "var(--text-3)" }}><FileIcon /></div>
                <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                  No documents on this case yet. Upload the first piece of evidence above.
                </div>
              </div>
            )}
            {documents && documents.length > 0 && (
              <table className="tbl">
                <thead>
                  <tr><th style={{ width: "40%" }}>Document</th><th>Type</th><th>Uploaded by</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {documents.map((d: any) => (
                    <tr key={d._id}>
                      <td>
                        <div className="row" style={{ gap: 10 }}>
                          <FileIcon />
                          <div className="ttl" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>
                            {d.filename}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge gray" style={{ fontSize: 10.5 }}>{fmtSizeLabel(d.mimeType)}</span></td>
                      <td><span className="muted" style={{ fontSize: 12.5 }}>{d.uploadedBy}</span></td>
                      <td><span className="muted tnum" style={{ fontSize: 12 }}>{new Date(d._creationTime).toLocaleDateString("en-IN")}</span></td>
                      <td>
                        {d.url && (
                          <a className="btn sm" href={d.url} target="_blank" rel="noreferrer">
                            <DownloadIcon /> Open
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
