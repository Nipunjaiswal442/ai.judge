import { auth } from "@/lib/auth";
import LawyerDashboardClient from "./LawyerDashboardClient";

export default async function LawyerDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;
  return <LawyerDashboardClient userId={session.user.id as any} />;
}
