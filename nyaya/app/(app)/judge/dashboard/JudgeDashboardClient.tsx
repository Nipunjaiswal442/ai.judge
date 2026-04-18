"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function JudgeDashboardClient() {
  const cases = useQuery(api.judge.getJudgeCases, {});

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((c) => (
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
              <Button asChild className="w-full bg-[#1e3a8a] hover:bg-[#0a1f44] text-white">
                <Link href={`/judge/cases/${c._id}`}>Review Advisory Brief</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
