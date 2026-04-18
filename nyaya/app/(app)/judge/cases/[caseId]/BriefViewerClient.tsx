"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BriefViewerClient({ caseId }: { caseId: Id<"cases"> }) {
  const router = useRouter();
  const caseData = useQuery(api.judge.getCaseById, { caseId });
  const brief = useQuery(api.judge.getAnalysisBrief, { caseId });
  const acknowledgeBrief = useMutation(api.judge.acknowledgeBrief);
  const precedents = useQuery(
    api.precedents.getManyByIds,
    brief?.citedPrecedentIds ? { ids: brief.citedPrecedentIds } : "skip"
  );

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (caseData === undefined || brief === undefined) {
    return <div className="text-slate-500 animate-pulse p-8">Loading advisory brief...</div>;
  }

  if (!brief) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow border border-slate-200">
        <h3 className="text-xl font-heading font-semibold text-slate-900 mb-2">Brief Not Yet Generated</h3>
        <p className="text-slate-500">The AI analysis brief for {caseData?.humanId} is not available yet.</p>
      </div>
    );
  }

  const handleAcknowledge = async () => {
    setSaving(true);
    await acknowledgeBrief({
      caseId,
      briefId: brief._id,
      note: notes
    });
    setSaving(false);
    router.push("/judge/dashboard");
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#061735] via-[#0a1f44] to-[#1e3a8a] text-white rounded-2xl p-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="1.5" transform={`rotate(${i * 15} 50 50)`} />
            ))}
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <span className="font-mono text-slate-300 tracking-widest">{caseData.humanId}</span>
            <span className="font-bold text-[#c9a227] tracking-wider text-xl mt-2 md:mt-0 uppercase border border-[#c9a227] px-4 py-1 rounded-sm bg-black/20">
              Advisory Brief — Not A Verdict
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
            {caseData.complainantName} <span className="text-slate-400 font-light italic text-3xl">v.</span> {caseData.opposingPartyName}
          </h1>
          <p className="text-slate-300 font-medium tracking-wide">{caseData.category.replace(/_/g, " ")} • {caseData.jurisdiction}</p>
        </div>
      </div>
      <Accordion className="space-y-4">
        {/* Case Summary */}
        <AccordionItem value="summary" className="bg-white border-l-4 border-l-[#0a1f44] border-t border-r border-b border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-[#0a1f44] hover:no-underline">
            Case Summary
          </AccordionTrigger>
          <AccordionContent className="text-base text-slate-700 leading-relaxed pt-2 pb-6">
            {brief.caseSummary}
          </AccordionContent>
        </AccordionItem>

        {/* Agreed Facts */}
        <AccordionItem value="agreed" className="bg-white border-l-4 border-l-[#1e3a8a] border-t border-r border-b border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-[#1e3a8a] hover:no-underline">
            Agreed Facts
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              {brief.agreedFacts.map((fact: string, i: number) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Disputed Facts */}
        <AccordionItem value="disputed" className="bg-white border-l-4 border-l-[#c9a227] border-t border-r border-b border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-[#c9a227] hover:no-underline">
            Disputed Facts & Positions
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            {brief.disputedFacts.map((df: any, i: number) => (
              <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">{i + 1}. {df.point}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Complainant Position</span>
                    <p className="mt-1 text-sm text-slate-700">{df.complainantPosition}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Opposing Position</span>
                    <p className="mt-1 text-sm text-slate-700">{df.opposingPosition}</p>
                  </div>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Applicable Law */}
        <AccordionItem value="law" className="bg-white border-l-4 border-l-[#0a1f44] border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-[#0a1f44] hover:no-underline">
            Applicable Law
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-3">
            {brief.applicableLaw.map((law: any, i: number) => (
              <div key={i} className="pb-2 border-b border-slate-100 last:border-0">
                <h4 className="font-semibold text-slate-900">{law.statute} - {law.section}</h4>
                <p className="text-sm text-slate-600 mt-1">{law.relevance}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Relevant Precedents */}
        <AccordionItem value="precedents" className="bg-white border-l-4 border-l-emerald-600 border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-emerald-700 hover:no-underline">
            Relevant Precedents
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-3">
            {precedents === undefined && (
              <p className="text-sm text-slate-400">Loading precedents...</p>
            )}
            {precedents && precedents.filter(Boolean).length === 0 && (
              <p className="text-sm text-slate-500">No precedents cited in the curated set for this case.</p>
            )}
            {precedents?.filter(Boolean).map((p: any) => (
              <div key={p._id} className="pb-2 border-b border-slate-100 last:border-0">
                <h4 className="font-semibold text-slate-900">{p.title}</h4>
                <p className="text-xs font-mono text-slate-500">{p.citation} • {p.commission} • {p.year}</p>
                <p className="text-sm text-slate-600 mt-1">{p.summary}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Procedural Flags */}
        <AccordionItem value="procedural" className="bg-white border-l-4 border-l-orange-500 border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-orange-600 hover:no-underline">
            Procedural Flags
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            {brief.proceduralFlags.length === 0 ? (
              <p className="text-sm text-slate-500">No procedural issues flagged.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                {brief.proceduralFlags.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Evidentiary Gaps */}
        <AccordionItem value="gaps" className="bg-white border-l-4 border-l-violet-500 border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-violet-600 hover:no-underline">
            Evidentiary Gaps
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            {brief.evidentiaryGaps.length === 0 ? (
              <p className="text-sm text-slate-500">No major gaps identified.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                {brief.evidentiaryGaps.map((g: string, i: number) => <li key={i}>{g}</li>)}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Confidence */}
        <AccordionItem value="confidence" className="bg-white border-l-4 border-l-slate-400 border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-slate-700 hover:no-underline">
            Confidence Score
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: `${brief.confidenceScore}%` }} />
              </div>
              <span className="text-lg font-bold text-slate-800">{brief.confidenceScore}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">Self-reported by the underlying language model. Always apply independent judicial judgment.</p>
          </AccordionContent>
        </AccordionItem>

        {/* Caveats */}
        <AccordionItem value="caveats" className="bg-white border-l-4 border-l-red-500 border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-red-600 hover:no-underline">
            Caveats & AI Limitations
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <ul className="list-disc pl-5 space-y-2 text-red-700 font-medium">
              {brief.caveats.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-12 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">Judge's Private Notes</h3>
        <p className="text-sm text-slate-500 mb-4">These notes are exclusively visible to you and will not be shared with the parties.</p>
        <Textarea 
          placeholder="Jot down questions for the hearing..." 
          className="min-h-[150px] bg-white text-base"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="text-sm text-slate-500">
            <span className="font-bold text-amber-600">Pending</span> — Acknowledge to move to hearing
          </div>
          <Button 
            size="lg" 
            onClick={handleAcknowledge} 
            disabled={saving || brief.judgeAcknowledged}
            className="bg-[#c9a227] hover:bg-[#a6841d] text-[#061735] font-bold px-8 shadow-md"
          >
            {brief.judgeAcknowledged ? "Acknowledged" : saving ? "Saving..." : "Acknowledge — Proceed to Hearing"}
          </Button>
        </div>
      </div>
    </div>
  );
}
