import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion";
import { ClipboardCheck, Award, GraduationCap, Wallet } from "lucide-react";
import { getStudentDashboard } from "@/lib/actions/student";
import { getSession } from "@/lib/auth";
import { formatINR } from "@/lib/utils";

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
      hint: `${d.pendingCount} unpaid`,
      icon: Wallet,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Hello, {session!.user.name?.split(" ")[0] ?? "Student"}
        </h1>
        <p className="mt-1 text-sm text-sub">Your week at a glance</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <Card>
              <CardContent>
                <div className="flex items-center gap-2 text-sub">
                  <s.icon className="h-4 w-4 text-brand-600" />
                  <p className="text-sm">{s.label}</p>
                </div>
                <p className="mt-2 font-display text-2xl font-extrabold text-ink">{s.value}</p>
                <p className="mt-1 text-sm text-sub">{s.hint}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <Card className="mt-4">
          <CardContent>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/student/attendance"
                className="rounded-lg bg-brand-50 px-4 py-2 font-semibold text-brand-700"
              >
                View attendance
              </Link>
              <Link
                href="/student/assignments"
                className="rounded-lg bg-brand-50 px-4 py-2 font-semibold text-brand-700"
              >
                Submit assignments
              </Link>
              <Link
                href="/student/fees"
                className="rounded-lg bg-brand-50 px-4 py-2 font-semibold text-brand-700"
              >
                Check fees
              </Link>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
