import { getServerUser } from "@/lib/serverUser";
import LawyerDashboardClient from "./LawyerDashboardClient";

export default async function LawyerDashboardPage() {
  const user = await getServerUser();
  if (!user) return null;
  return <LawyerDashboardClient userId={user.convexId} />;
}
