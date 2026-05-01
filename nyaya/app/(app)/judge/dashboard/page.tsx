import { getServerUser } from "@/lib/serverUser";
import JudgeDashboardClient from "./JudgeDashboardClient";

export default async function JudgeDashboardPage() {
  const user = await getServerUser();
  if (!user) return null;
  return <JudgeDashboardClient />;
}
