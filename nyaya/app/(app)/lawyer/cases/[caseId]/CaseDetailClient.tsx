"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CASE_CATEGORIES } from "@/lib/caseCategories";

export default function CaseDetailClient({
  caseId,
  userId,
}: {
  caseId: Id<"cases">;
  userId: Id<"users">;
}) {
  const caseData = useQuery(api.judge.getCaseById, { caseId });
  const initializeSession = useMutation(api.qa.initializeQASession);
  const updateAnswer = useMutation(api.qa.updateAnswer);
  const submitSession = useMutation(api.qa.submitQASession);
  const generateBrief = useAction(api.analysis.generateAnalysisBrief);

  const [side, setSide] = useState<"COMPLAINANT" | "OPPOSING" | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!caseData || initialized) return;
    const isComplainant = caseData.complainantLawyerId === userId;
    const isOpposing = caseData.opposingLawyerId === userId;
    const computedSide = isComplainant ? "COMPLAINANT" : isOpposing ? "OPPOSING" : null;
    setSide(computedSide);

    if (computedSide) {
      initializeSession({ caseId, side: computedSide, category: caseData.category })
        .then(() => setInitialized(true))
        .catch((e) => setError(String(e)));
    } else {
      setInitialized(true);
    }
  }, [caseData, userId, caseId, initialized, initializeSession]);

  const session = useQuery(
    api.qa.getQASession,
    side ? { caseId, side } : "skip"
  );
  const entries = useQuery(
    api.qa.getQAEntries,
    session?._id ? { sessionId: session._id } : "skip"
  );

  if (!caseData) {
    return <div className="text-slate-500 animate-pulse p-8">Loading case...</div>;
  }

  const handleSubmit = async () => {
    if (!session?._id) return;
    await submitSession({ sessionId: session._id });
  };

  const handleGenerateBrief = async () => {
    setGenerating(true);
    setError("");
    try {
      await generateBrief({ caseId });
    } catch (e: any) {
      setError(e?.message || "Brief generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const categoryLabel =
    CASE_CATEGORIES.find((c) => c.id === caseData.category)?.label ||
    caseData.category;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#061735] via-[#0a1f44] to-[#1e3a8a] text-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-sm text-slate-300">{caseData.humanId}</span>
          <span className="text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded">
            {caseData.status.replace(/_/g, " ")}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold">
          {caseData.complainantName}{" "}
          <span className="text-slate-400 italic font-light">v.</span>{" "}
          {caseData.opposingPartyName}
        </h1>
        <p className="text-slate-300 mt-2">
          {categoryLabel} • {caseData.jurisdiction} • ₹{caseData.claimAmount.toLocaleString("en-IN")}
        </p>
        <p className="text-xs mt-3 text-amber-300 uppercase tracking-wider">
          Side: {side || "Observer"}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      {!side && (
        <Card>
          <CardContent className="p-6 text-slate-700">
            You are not a listed counsel on this case. Ask the complainant lawyer to
            invite you.
          </CardContent>
        </Card>
      )}

      {side && entries && entries.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-2xl text-[#0a1f44]">
            Structured Q&amp;A — {side.toLowerCase()} side
          </h2>
          {session?.status === "SUBMITTED" && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-200">
              Your submission is locked. Awaiting the other side / judge review.
            </div>
          )}
          {entries.map((entry: any, idx: number) => (
            <QAEntry
              key={entry._id}
              entry={entry}
              index={idx}
              disabled={session?.status === "SUBMITTED"}
              onSave={(text) => updateAnswer({ entryId: entry._id, answerText: text })}
            />
          ))}

          {session?.status === "IN_PROGRESS" && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                className="bg-[#0a1f44] hover:bg-[#1e3a8a] text-white"
                disabled={entries.some((e: any) => !e.answerText || e.answerText.trim().length < 10)}
              >
                Submit my side
              </Button>
            </div>
          )}
        </div>
      )}

      {side === "COMPLAINANT" && caseData.status === "READY_FOR_BRIEF" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
          <p className="text-sm text-amber-800">
            Both sides have submitted. You can trigger the AI advisory brief now.
          </p>
          <Button onClick={handleGenerateBrief} disabled={generating} className="bg-[#c9a227] text-[#061735] font-bold">
            {generating ? "Generating..." : "Generate Analysis Brief"}
          </Button>
        </div>
      )}

      {caseData.status === "BRIEF_GENERATED" || caseData.status === "JUDGE_REVIEWED" ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">
          Advisory brief generated. It is now with the assigned judge for review.
        </div>
      ) : null}
    </div>
  );
}

function QAEntry({
  entry,
  index,
  disabled,
  onSave,
}: {
  entry: any;
  index: number;
  disabled: boolean;
  onSave: (text: string) => Promise<void> | void;
}) {
  const [text, setText] = useState(entry.answerText || "");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setText(entry.answerText || "");
  }, [entry.answerText]);

  const handleBlur = async () => {
    if (text === (entry.answerText || "")) return;
    await onSave(text);
    setSavedAt(Date.now());
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-2">
        <p className="font-medium text-slate-900">
          <span className="text-slate-500 mr-2">Q{index + 1}.</span>
          {entry.questionText}
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="Type your answer here. Details strengthen the record."
          className="min-h-[100px]"
        />
        <div className="flex justify-between text-xs">
          {entry.aiFollowUpNeeded && entry.aiFollowUpNote ? (
            <span className="text-amber-600">
              AI follow-up: {entry.aiFollowUpNote}
            </span>
          ) : (
            <span className="text-slate-400">
              {text.trim().length < 10 ? "Answer appears too short" : " "}
            </span>
          )}
          {savedAt && <span className="text-emerald-600">Saved</span>}
        </div>
      </CardContent>
    </Card>
  );
}
