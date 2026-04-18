import { auth } from "@/lib/auth";
import JudgeDashboardClient from "./JudgeDashboardClient";

export default async function JudgeDashboardPage() {
  const session = await auth();
  
  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl font-heading font-bold text-[#061735]">Chambers / Case Docket</h2>
        <p className="text-slate-500 font-medium mt-1">Review AI-structured case briefs. All outputs are advisory.</p>
      </div>
      
      <JudgeDashboardClient />
    </div>
  );
}
