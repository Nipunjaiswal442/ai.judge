import { getServerUser } from "@/lib/serverUser";
import BenchQAClient from "./BenchQAClient";

export default async function BenchQAPage() {
  const user = await getServerUser();
  if (!user) return null;
  return <BenchQAClient />;
}
