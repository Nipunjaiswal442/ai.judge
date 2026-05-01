import { auth } from "@/lib/auth";
import BriefViewerClient from "./BriefViewerClient";

export default async function JudgeBriefPage({ params }: { params: Promise<{ caseId: string }> }) {
  const session = await auth();
  
  if (!session?.user) return null;

  const resolvedParams = await params;
  
  return (
    <BriefViewerClient caseId={resolvedParams.caseId as any} />
  );
}
