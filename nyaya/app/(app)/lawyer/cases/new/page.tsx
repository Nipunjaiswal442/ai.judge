import { getServerUser } from "@/lib/serverUser";
import NewCaseClient from "./NewCaseClient";

export default async function NewCasePage() {
  const user = await getServerUser();
  if (!user) return null;
  return <NewCaseClient userId={user.convexId} />;
}
