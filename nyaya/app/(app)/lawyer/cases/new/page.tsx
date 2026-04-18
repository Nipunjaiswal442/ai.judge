import { auth } from "@/lib/auth";
import NewCaseClient from "./NewCaseClient";

export default async function NewCasePage() {
  const session = await auth();
  
  if (!session?.user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-heading font-bold text-slate-900">New Case Filing</h2>
        <p className="text-slate-500">Initiate a new consumer dispute case.</p>
      </div>
      
      <NewCaseClient userId={session.user.id as any} />
    </div>
  );
}
