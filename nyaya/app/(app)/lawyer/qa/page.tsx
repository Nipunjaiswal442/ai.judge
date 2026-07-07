import { getServerUser } from "@/lib/serverUser";
import CounselQAClient from "./CounselQAClient";

export default async function CounselQAPage() {
  const user = await getServerUser();
  if (!user) return null;
  return (
    <CounselQAClient
      userId={user.convexId}
      counselType={user.counselType === "OPPOSING" ? "OPPOSING" : "COMPLAINANT"}
    />
  );
}
