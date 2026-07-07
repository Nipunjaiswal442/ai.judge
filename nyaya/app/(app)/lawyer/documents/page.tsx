import { getServerUser } from "@/lib/serverUser";
import DocumentVaultClient from "./DocumentVaultClient";

export default async function DocumentVaultPage() {
  const user = await getServerUser();
  if (!user) return null;
  return <DocumentVaultClient userId={user.convexId} />;
}
