import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { Reveal } from "@/shared/motion";
import { Users, School, BookOpen, Wallet, ArrowRight } from "lucide-react";
import { cn, formatDate, formatINR } from "@/lib/utils";

import { getAdminStats } from "@/features/overview/actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getAdminStats();
  const stats = [
    { label: "Users", value: String(s.users), hint: "Admin, teacher, student", icon: Users },
    { label: "Classes", value: String(s.classes), hint: "Across departments", icon: School },
    { label: "Subjects", value: String(s.subjects), hint: "With teachers assigned", icon: BookOpen },
    {
      label: "Pending fees",
      value: formatINR(s.pendingFees),
      hint: "Unpaid invoices",
      icon: Wallet,
      badge: s.pendingFees === 0 ? <Badge variant="muted">Clear</Badge> : <Badge variant="warning">Due</Badge>,
    },
  ];
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Admin overview</h1>
        <p className="mt-1 text-sm text-sub">MIT-ADT single campus · {formatDate(new Date())}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.06}>
            <Card>
              <CardContent className="flex items-start gap-3">
                <span className="rounded-lg bg-brand-50 p-2 text-brand-700">
                  <stat.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-xl font-extrabold text-ink sm:text-2xl">
                      {stat.value}
                    </span>
                    {"badge" in stat && stat.badge}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{stat.label}</span>
                  <span className="block text-xs text-sub">{stat.hint}</span>
                </span>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Reveal delay={0.1} className="lg:col-span-3">
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
              <Link href="/admin/fees" className={cn(buttonVariants({ variant: "secondary" }), "min-h-[44px]")}>
                Review invoices <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.15} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Manage</CardTitle>
                <CardDescription>People and classes</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/users" className={cn(buttonVariants({ variant: "secondary" }), "min-h-[44px]")}>
                  Users
                </Link>
                <Link href="/admin/classes" className={cn(buttonVariants({ variant: "secondary" }), "min-h-[44px]")}>
                  Classes
                </Link>
                <Link href="/admin/timetable" className={cn(buttonVariants({ variant: "secondary" }), "min-h-[44px]")}>
                  Timetable
                </Link>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
