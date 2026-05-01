import { auth } from "@/lib/auth";
import NewCaseClient from "./NewCaseClient";

export default async function NewCasePage() {
  const session = await auth();
  
  if (!session?.user) return null;

  return <NewCaseClient userId={session.user.id as any} />;
}
