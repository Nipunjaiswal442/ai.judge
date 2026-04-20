"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Bot, Gavel } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";

type ChatMessage = {
  role: "judge" | "assistant";
  content: string;
};

const DEFAULT_SYNTHESIS_PROMPT =
  "Provide a neutral synthesis of lawyer-submitted facts, key disputes, evidentiary gaps, and procedural flags for this case.";

export default function JudgeDashboardClient() {
  const cases = useQuery(api.judge.getJudgeCases, {});
  const askCaseSynthesis = useAction(api.analysis.askJudgeCaseSynthesis);

  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Select a case and ask for a synthesis. I will ground every answer in the lawyers' submitted Q&A and the generated advisory brief.",
    },
  ]);

  useEffect(() => {
    if (!cases || cases.length === 0 || selectedCaseId) return;
    setSelectedCaseId(cases[0]._id);
  }, [cases, selectedCaseId]);

  const activeCase = useMemo(
    () => cases?.find((c: any) => c._id === selectedCaseId) || cases?.[0],
    [cases, selectedCaseId]
  );

  if (cases === undefined) {
    return <div className="text-slate-500 animate-pulse">Loading docket...</div>;
  }

  if (cases.length === 0) {
    return (
      <EmptyState
        title="Docket is empty"
        description="No cases have been filed in your jurisdiction."
        icon={<Gavel size={32} strokeWidth={1.5} />}
      />
    );
  }

  const handleAsk = async () => {
    if (!activeCase?._id || asking) return;
    setAsking(true);
    setChatError("");

    const prompt = question.trim() || DEFAULT_SYNTHESIS_PROMPT;
    setMessages((prev) => [...prev, { role: "judge", content: prompt }]);
    setQuestion("");

    try {
      const response = await askCaseSynthesis({
        caseId: activeCase._id,
        question: prompt,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: response.answer }]);
    } catch (error: any) {
      const fallback =
        error?.message || "Unable to generate synthesis right now. Please try again.";
      setChatError(fallback);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I could not complete that request: ${fallback}`,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c: any) => (
          <Card key={c._id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-500">{c.humanId}</div>
                  <h3 className="font-heading font-semibold text-lg text-[#061735] mt-1 line-clamp-1">
                    {c.complainantName} v. {c.opposingPartyName}
                  </h3>
                </div>
              </div>

              <div className="text-sm text-slate-600 line-clamp-2">
                <span className="font-medium text-slate-900">Relief:</span> {c.reliefSought}
              </div>

              <div className="flex items-center gap-2 mt-4">
                {c.status === "JUDGE_REVIEWED" ? (
                  <span className="text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-1 rounded">
                    Acknowledged
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded">
                    Action Required
                  </span>
                )}
              </div>

              <div className="pt-4 flex w-full">
                <Link href={`/judge/cases/${c._id}`} className="w-full bg-[#1e3a8a] hover:bg-[#0a1f44] text-white py-2.5 rounded-md text-center text-sm font-medium transition-colors">
                  Review Advisory Brief
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0a1f44] text-white flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-xl text-[#061735]">Bench Assistant</h3>
              <p className="text-sm text-slate-500">
                Ask for grounded synthesis of lawyer submissions for a selected case.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Case Context</label>
            <select
              value={activeCase?._id || ""}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]"
            >
              {cases.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.humanId} - {c.complainantName} v. {c.opposingPartyName}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 max-h-[360px] overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`rounded-md px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "judge"
                    ? "bg-[#0a1f44] text-white ml-8"
                    : "bg-white border border-slate-200 text-slate-700 mr-8"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Judge Prompt</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about disputed facts, evidentiary gaps, or side-by-side positions. Leave blank to auto-generate a full synthesis."
              className="min-h-[100px]"
            />
            {chatError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                {chatError}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAsk}
              disabled={asking || !activeCase?._id}
              className="bg-[#1e3a8a] hover:bg-[#0a1f44] text-white"
            >
              {asking ? "Synthesizing..." : "Ask Bench Assistant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
