"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const rolePrefix = searchParams.get("role") || "LAWYER";
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Auth.js uses formData or JSON. The redirect happens natively, but we disabled native redirect to handle errors
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    setLoading(false);
    
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(rolePrefix === "JUDGE" ? "/judge/dashboard" : "/lawyer/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#061735] via-[#0a1f44] to-[#1e3a8a] p-4 text-slate-100">
      <Card className="w-full max-w-md bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-heading font-bold text-primary">Nyāya</CardTitle>
          <CardDescription className="text-slate-500 font-sans">
            Sign in to access your {rolePrefix.toLowerCase()} dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md border border-red-200">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email format (e.g. name@domain.com)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="advocate@bar.in" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button type="submit" className="w-full bg-[#1e3a8a] hover:bg-[#0a1f44]" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to Nyāya"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            type="button" 
            className="w-full text-slate-700 border-slate-300"
            onClick={() => signIn("google", { callbackUrl: rolePrefix === "JUDGE" ? "/judge/dashboard" : "/lawyer/dashboard" })}
          >
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-slate-600">
          <div>
            Don't have an account?{" "}
            <Link href={`/sign-up?role=${rolePrefix}`} className="text-[#1e3a8a] hover:underline font-semibold">
              Register here
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4 px-4 text-center">ADVISORY ONLY — NOT LEGAL ADVICE</p>
        </CardFooter>
      </Card>
    </div>
  );
}
