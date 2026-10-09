import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { Users, School, BookOpen, Wallet, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { getAdminStats } from "@/features/overview/actions";
import { formatDate, formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getAdminStats();
  const stats = [
    { label: "Users", value: String(s.users), hint: "Admin, teacher, student", icon: Users, tint: "bg-brand-50 text-brand-700" },
    { label: "Classes", value: String(s.classes), hint: "Across departments", icon: School, tint: "bg-brand-50 text-brand-700" },
    { label: "Subjects", value: String(s.subjects), hint: "With teachers assigned", icon: BookOpen, tint: "bg-magenta/10 text-magenta" },
    {
      label: "Pending fees",
      value: formatINR(s.pendingFees),
      hint: "Unpaid invoices",
      icon: Wallet,
      tint: "bg-ember/10 text-ember",
      badge: s.pendingFees === 0 ? <Badge variant="muted">Clear</Badge> : <Badge variant="warning">Due</Badge>,
    },
  ];
  return (
    <div>
      <div className="hero-gradient mb-6 rounded-2xl p-6 text-white shadow-card sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
            MIT-ADT single campus
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-[28px]">
            Admin overview
          </h1>
          <div className="mt-3">
            <Badge className="bg-white/15 text-white">{formatDate(new Date())}</Badge>
          </div>
        </div>
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-pop">
              <CardContent className="flex items-start gap-3">
                <span className={cn("rounded-lg p-2", stat.tint)}>
                  <stat.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-xl font-extrabold tabular-nums tracking-tight text-ink sm:text-2xl">
                      {stat.value}
                    </span>
                    {"badge" in stat && stat.badge}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{stat.label}</span>
                  <span className="block text-xs text-sub">{stat.hint}</span>
                </span>
              </CardContent>
            </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Fee collection</CardTitle>
                <CardDescription>
                  {s.pendingFees === 0 ? "No unpaid invoices" : `${formatINR(s.pendingFees)} awaiting payment`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/admin/fees" className={cn(buttonVariants({ variant: "default" }), "min-h-[44px]")}>
                Review invoices <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Manage</CardTitle>
                <CardDescription>People and classes</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline" }), "min-h-[44px]")}>
                  Users
                </Link>
                <Link href="/admin/classes" className={cn(buttonVariants({ variant: "outline" }), "min-h-[44px]")}>
                  Classes
                </Link>
                <Link href="/admin/timetable" className={cn(buttonVariants({ variant: "outline" }), "min-h-[44px]")}>
                  Timetable
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
