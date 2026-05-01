import { getServerUser } from "@/lib/serverUser";
import CaseDetailClient from "./CaseDetailClient";

export default async function LawyerCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const [user, resolvedParams] = await Promise.all([getServerUser(), params]);
  if (!user) return null;
  return (
    <CaseDetailClient
      caseId={resolvedParams.caseId as any}
      userId={user.convexId}
    />
  );
}
