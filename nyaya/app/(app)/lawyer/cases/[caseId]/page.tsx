import { auth } from "@/lib/auth";
import CaseDetailClient from "./CaseDetailClient";

export default async function LawyerCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const session = await auth();
  if (!session?.user) return null;

  const resolvedParams = await params;

  return (
    <CaseDetailClient
      caseId={resolvedParams.caseId as any}
      userId={session.user.id as any}
    />
  );
}
