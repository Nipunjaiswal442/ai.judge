import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverUser";
import PrecedentLibraryClient from "./PrecedentLibraryClient";

export default async function PrecedentLibraryPage() {
  const user = await getServerUser();
  if (!user) redirect("/sign-in");
  return <PrecedentLibraryClient />;
}
