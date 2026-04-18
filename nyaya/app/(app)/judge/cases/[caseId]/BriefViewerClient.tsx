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

      <Accordion type="multiple" defaultValue={["summary", "agreed", "disputed"]} className="space-y-4">
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
              {brief.agreedFacts.map((fact, i) => (
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
            {brief.disputedFacts.map((df, i) => (
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
            {brief.applicableLaw.map((law, i) => (
              <div key={i} className="pb-2 border-b border-slate-100 last:border-0">
                <h4 className="font-semibold text-slate-900">{law.statute} - {law.section}</h4>
                <p className="text-sm text-slate-600 mt-1">{law.relevance}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Caveats */}
        <AccordionItem value="caveats" className="bg-white border-l-4 border-l-red-500 border-slate-200 rounded-r-xl px-6 py-2 shadow-sm">
          <AccordionTrigger className="text-2xl font-heading font-bold text-red-600 hover:no-underline">
            Caveats & AI Limitations
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <ul className="list-disc pl-5 space-y-2 text-red-700 font-medium">
              {brief.caveats.map((c, i) => (
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
