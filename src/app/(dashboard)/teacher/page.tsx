import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge, StatusBadge } from "@/shared/ui/badge";
import { Reveal } from "@/shared/motion";
import { BookOpen, FileText, ClipboardCheck, CalendarDays, ArrowRight } from "lucide-react";

import { getSession } from "@/lib/auth";
import { getTeacherDashboard } from "@/features/overview/actions";
import { getPendingSubmissions } from "@/features/assignments/actions";
import { getTeacherSubjects } from "@/features/classes/actions";
import { getTeacherTimetable } from "@/features/timetable/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAY = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][new Date().getDay()];

export default async function TeacherDashboard() {
  const session = await getSession();
  const teacherId = session!.user.id;
  const [d, pending, subjects, week] = await Promise.all([
    getTeacherDashboard(teacherId),
    getPendingSubmissions(teacherId),
    getTeacherSubjects(teacherId),
    getTeacherTimetable(teacherId),
  ]);

  const stats = [
    { label: "Subjects", value: String(d.subjects), hint: "Assigned to you", icon: BookOpen },
    { label: "Assignments", value: String(d.assignments), hint: "Created", icon: FileText },
    { label: "Pending grading", value: String(d.pendingSubs), hint: "To grade", icon: ClipboardCheck },
    { label: "Marked today", value: String(d.todayAttendance), hint: "Attendance records", icon: CalendarDays },
  ];

  const first = subjects[0];
  const subtitle = first
    ? `${first.class.name} · ${first.name} · ${formatDate(new Date())}`
    : `${formatDate(new Date())}`;
  const today = week.filter((r) => r.dayOfWeek === DAY).slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Hello, {session!.user.name?.split(" ")[0] ?? "Teacher"}
        </h1>
        <p className="mt-1 text-sm text-sub">{subtitle}</p>
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
                  <span className="block font-display text-xl font-extrabold text-ink sm:text-2xl">
                    {s.value}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{s.label}</span>
                  <span className="block text-xs text-sub">{s.hint}</span>
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
                <CardTitle>Needs grading</CardTitle>
                <CardDescription>
                  {pending.length === 0
                    ? "Inbox zero - nothing waiting"
                    : `${pending.length} submission${pending.length === 1 ? "" : "s"} waiting for marks`}
                </CardDescription>
              </div>
              {pending.length > 0 ? (
                <StatusBadge status="PENDING" />
              ) : (
                <Badge variant="muted">Clear</Badge>
              )}
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-sm text-sub">New submissions will appear here.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {pending.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <span className="min-w-0 truncate">
                        <span className="font-medium text-ink">{p.student.name}</span>
                        <span className="text-sub"> · {p.assignment.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-sub">Out of {p.assignment.maxMarks}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/teacher/assignments" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                Open assignments <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.15} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Today</CardTitle>
                <CardDescription>{today.length === 0 ? "No classes scheduled" : `${today.length} sessions`}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {today.length === 0 ? (
                <p className="text-sm text-sub">Your week is clear.</p>
              ) : (
                <ul className="space-y-2">
                  {today.map((r) => (
                    <li key={r.id} className="rounded-lg bg-surface px-3 py-2 text-sm">
                      <span className="text-xs font-medium text-brand-700">
                        {r.startTime}–{r.endTime}
                      </span>
                      <br />
                      <span className="font-medium text-ink">{r.subject.name}</span>
                      <span className="text-sub"> · {r.class.name}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/teacher/timetable" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                Full timetable <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
