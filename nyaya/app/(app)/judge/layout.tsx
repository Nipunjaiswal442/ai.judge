import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function JudgeSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?role=JUDGE");
  }

  if (session.user.role !== "JUDGE") {
    redirect("/lawyer/dashboard");
  }

  return <>{children}</>;
}
