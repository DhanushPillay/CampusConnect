import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/badge";
import { Reveal } from "@/shared/motion";
import { BookOpen, FileText, ClipboardCheck, CalendarDays } from "lucide-react";

import { getSession } from "@/lib/auth";
import { getTeacherDashboard } from "@/features/overview/actions";
import { getPendingSubmissions } from "@/features/assignments/actions";
import { getTeacherSubjects } from "@/features/classes/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const session = await getSession();
  const teacherId = session!.user.id;
  const [d, pending, subjects] = await Promise.all([
    getTeacherDashboard(teacherId),
    getPendingSubmissions(teacherId),
    getTeacherSubjects(teacherId),
  ]);

  const stats = [
    { label: "Subjects", value: String(d.subjects), icon: BookOpen },
    { label: "Assignments", value: String(d.assignments), icon: FileText },
    { label: "Pending grading", value: String(d.pendingSubs), icon: ClipboardCheck },
    { label: "Marked today", value: String(d.todayAttendance), icon: CalendarDays },
  ];

  const first = subjects[0];
  const subtitle = first
    ? `${first.class.name} · ${first.name} · ${formatDate(new Date())}`
    : `${d.subjects} subjects · ${d.pendingSubs} to grade · ${formatDate(new Date())}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Hello, {session!.user.name?.split(" ")[0] ?? "Teacher"}
        </h1>
        <p className="mt-1 text-sm text-sub">{subtitle}</p>
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
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <Card className="mt-4">
          <CardHeader>
            <div>
              <CardTitle>Needs grading ({pending.length})</CardTitle>
              <CardDescription>{pending.length === 0 ? "All caught up" : "Submissions waiting for marks"}</CardDescription>
            </div>
            {pending.length > 0 ? <StatusBadge status="PENDING" /> : <StatusBadge status="GRADED" />}
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-sub">Nothing waiting. All caught up.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {pending.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>
                      <span className="font-medium text-ink">{p.student.name}</span>
                      <span className="text-sub"> · {p.assignment.title}</span>
                    </span>
                    <span className="text-sm text-sub">/ {p.assignment.maxMarks}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
