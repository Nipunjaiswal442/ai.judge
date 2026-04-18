"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const rolePrefix = searchParams.get("role") || "LAWYER";
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: rolePrefix }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Registered, but auto sign-in failed. Please sign in manually.");
        setLoading(false);
        router.push(`/sign-in?role=${rolePrefix}`);
        return;
      }

      router.push(rolePrefix === "JUDGE" ? "/judge/dashboard" : "/lawyer/dashboard");
      router.refresh();
    } catch (err) {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#061735] via-[#0a1f44] to-[#1e3a8a] p-4 text-slate-100">
      <Card className="w-full max-w-md bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-heading font-bold text-primary">Nyāya</CardTitle>
          <CardDescription className="text-slate-500 font-sans">
            Register as a {rolePrefix.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md border border-red-200">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Ramesh Kumar" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email format</Label>
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
              <Label htmlFor="password" className="text-slate-700">Password</Label>
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
              {loading ? "Registering..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-slate-600">
          <div>
            Already have an account?{" "}
            <Link href={`/sign-in?role=${rolePrefix}`} className="text-[#1e3a8a] hover:underline font-semibold">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4 px-4 text-center">ADVISORY ONLY — NOT LEGAL ADVICE</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#061735] text-white">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
