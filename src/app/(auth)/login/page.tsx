"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* LEFT SIDE: Brand/Photography */}
      <div className="hidden lg:flex w-[60%] border-r border-border/40 bg-muted/20 p-12 flex-col justify-between relative z-10 overflow-hidden">
        {/* Real photography background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
        />
        {/* Light overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />

        <Link href="/" className="flex items-center gap-3 w-fit relative z-10 hover:opacity-80 transition-opacity">
          <GraduationCap className="h-10 w-10 text-primary" />
          <span className="font-display font-black text-2xl tracking-tighter uppercase">CampusConnect</span>
        </Link>

        <div className="relative z-10">
          <h1 className="font-display font-black text-[7vw] leading-[0.85] tracking-tighter uppercase text-foreground">
            UNIFY<br />YOUR<br /><span className="text-primary">CAMPUS.</span>
          </h1>
        </div>

        <div className="text-xl font-medium text-muted-foreground relative z-10">
          A sophisticated ecosystem for modern institutions.
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 sm:p-16 relative z-10 bg-white">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 mb-16">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-display font-black text-2xl tracking-tighter uppercase">CampusConnect</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center">
            <h2 className="font-display font-bold text-3xl mb-2 text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground font-medium">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@campusconnect.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/30 border-border/40 focus-visible:ring-primary h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/30 border-border/40 focus-visible:ring-primary h-12"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-glow hover:shadow-lg hover:-translate-y-0.5 transition-all" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
