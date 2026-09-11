"use client";

import { useState } from "react";
import Image from "next/image";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";
import { Reveal } from "@/components/motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setBusy(false);
      setError("That didn't match. Check your email and try again.");
      return;
    }
    const session = await getSession();
    setBusy(false);
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role === "ADMIN") router.push("/admin");
    else if (role === "TEACHER") router.push("/teacher");
    else if (role === "STUDENT") router.push("/student");
    else router.push("/");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="hero-gradient hero-grid relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          MIT-ADT University · Rajbaug, Pune
        </p>
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white">
            Teach.
            <br />
            Learn.
            <br />
            Rise.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
            The everyday workspace of MIT-ADT — Rajbaug, Pune.
          </p>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-white/60">
          NAAC &apos;A&apos; · 85-acre campus
        </p>
      </div>

      <div className="flex items-center justify-center bg-surface p-6">
        <Reveal className="w-full max-w-sm">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border/70 bg-white p-8 shadow-card"
          >
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/mit-adt-crest.png"
                alt="MIT-ADT University crest"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full"
              />
              <p className="font-display text-lg font-extrabold">CampusConnect</p>
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-ink max-lg:mt-4">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-sub">Sign in with your campus email.</p>

            <div className="mt-6">
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mitadt.edu.in"
              />
            </div>
            <div className="mt-4">
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={busy} className="mt-6 w-full">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Signing in…" : "Sign in"}
            </Button>

            <div className="mt-5 rounded-lg bg-surface p-3 text-xs leading-relaxed text-sub">
              <p className="font-semibold text-ink">Demo accounts · password123</p>
              <p>admin@mitadt.edu.in</p>
              <p>sneha.kulkarni@mitadt.edu.in</p>
              <p>aditya.shinde@mitadt.edu.in</p>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
