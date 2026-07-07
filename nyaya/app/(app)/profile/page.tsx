import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/serverUser";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) redirect("/sign-in");
  return (
    <ProfileClient
      userId={user.convexId}
      role={user.role}
      email={user.email}
    />
  );
}
