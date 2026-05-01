import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverUser";

export default async function LawyerSectionLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/sign-in?role=LAWYER");
  if (user.role === "JUDGE") redirect("/judge/dashboard");
  return <>{children}</>;
}
