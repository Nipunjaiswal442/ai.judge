import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverUser";

export default async function JudgeSectionLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/sign-in?role=JUDGE");
  if (user.role !== "JUDGE") redirect("/lawyer/dashboard");
  return <>{children}</>;
}
