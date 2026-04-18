import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      <header className="fixed top-0 w-full h-16 bg-gradient-to-r from-[#061735] to-[#0a1f44] text-white flex items-center justify-between px-6 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <Link href={session.user.role === "JUDGE" ? "/judge/dashboard" : "/lawyer/dashboard"}>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#c9a227]">Nyāya</h1>
          </Link>
          <span className="text-xs uppercase tracking-wider text-slate-400 bg-white/10 px-2 py-1 rounded">
            {session.user.role}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium hidden sm:block">
            {session.user.name} ({session.user.email})
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
