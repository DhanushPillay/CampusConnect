import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { Reveal } from "@/shared/motion";
import { ClipboardCheck, Award, GraduationCap, Wallet } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

import { getSession } from "@/lib/auth";
import { getStudentDashboard } from "@/features/overview/actions";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await getSession();
  const d = await getStudentDashboard(session!.user.id);

  const stats = [
    { label: "Attendance", value: `${d.attendancePct}%`, hint: "Across subjects", icon: ClipboardCheck },
    { label: "Average score", value: `${d.avgPct}%`, hint: "Graded work", icon: Award },
    { label: "Enrollments", value: String(d.subjects), hint: "Active classes", icon: GraduationCap },
    {
      label: "Fees due",
      value: formatINR(d.pendingFees),
      hint: d.pendingCount === 0 ? "Nothing unpaid" : `${d.pendingCount} unpaid`,
      icon: Wallet,
      badge: d.pendingCount === 0 ? <Badge variant="muted">Clear</Badge> : <Badge variant="warning">Due</Badge>,
    },
  ];

  const links = [
    { href: "/student/attendance", label: "View attendance" },
    { href: "/student/assignments", label: "Submit assignments" },
    { href: "/student/fees", label: "Check fees" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Hello, {session!.user.name?.split(" ")[0] ?? "Student"}
        </h1>
        <p className="mt-1 text-sm text-sub">
          {d.subjects} classes · {d.attendancePct}% attendance · {d.pendingCount} fees unpaid
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <Card>
              <CardContent className="flex items-start gap-3">
                <span className="rounded-lg bg-brand-50 p-2 text-brand-700">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-xl font-extrabold text-ink sm:text-2xl">
                      {s.value}
                    </span>
                    {"badge" in s && s.badge}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{s.label}</span>
                  <span className="block text-xs text-sub">{s.hint}</span>
                </span>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <Card className="mt-4">
          <CardHeader>
            <div>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump to your most-used sections</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(buttonVariants({ variant: "secondary" }), "min-h-[44px]")}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
