import { getServerUser } from "@/lib/serverUser";
import BriefViewerClient from "./BriefViewerClient";

export default async function JudgeBriefPage({ params }: { params: Promise<{ caseId: string }> }) {
  const [user, resolvedParams] = await Promise.all([getServerUser(), params]);
  if (!user) return null;
  return <BriefViewerClient caseId={resolvedParams.caseId as any} />;
}
