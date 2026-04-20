import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LawyerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?role=LAWYER");
  }

  if (session.user.role === "JUDGE") {
    redirect("/judge/dashboard");
  }

  return <>{children}</>;
}
