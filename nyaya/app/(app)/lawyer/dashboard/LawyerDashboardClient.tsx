"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

export default function LawyerDashboardClient({ userId }: { userId: Id<"users"> }) {
  const cases = useQuery(api.cases.getLawyerCases, { lawyerId: userId });

  if (cases === undefined) {
    return <div className="text-slate-500 animate-pulse">Loading cases...</div>;
  }

  if (cases.length === 0) {
    return (
      <EmptyState
        title="No cases found"
        description="You have not created any cases yet or been invited as an opposing counsel."
        icon={<Scale size={32} strokeWidth={1.5} />}
        action={
          <Button asChild className="bg-[#0a1f44] hover:bg-[#1e3a8a] text-white">
            <Link href="/lawyer/cases/new">Create New Case</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild className="bg-[#0a1f44] hover:bg-[#1e3a8a] text-white">
          <Link href="/lawyer/cases/new">Create New Case</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => (
          <Card key={c._id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-500">{c.humanId}</div>
                  <h3 className="font-heading font-semibold text-lg text-[#0a1f44] mt-1 line-clamp-1">
                    {c.complainantName} v. {c.opposingPartyName}
                  </h3>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {c.status.replace(/_/g, " ")}
                </div>
              </div>
              
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">Category:</span> {c.category.replace(/_/g, " ")}
              </div>
              
              <div className="pt-4 flex w-full">
                <Button asChild variant="outline" className="w-full text-[#1e3a8a] border-[#1e3a8a] hover:bg-slate-50">
                  <Link href={`/lawyer/cases/${c._id}`}>View Case Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
