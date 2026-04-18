import { auth } from "@/lib/auth";
import LawyerDashboardClient from "./LawyerDashboardClient";

export default async function LawyerDashboardPage() {
  const session = await auth();
  
  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-heading font-bold text-slate-900">Lawyer Dashboard</h2>
        <p className="text-slate-500">Manage your active cases and briefs.</p>
      </div>
      
      <LawyerDashboardClient userId={session.user.id as any} />
    </div>
  );
}
