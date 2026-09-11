import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";
import { Reveal } from "@/components/motion";
import { ClipboardCheck, CalendarDays } from "lucide-react";
import { getAttendanceHistory, getTeacherSubjects } from "@/lib/actions/teacher";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeacherAttendance({
  searchParams,
}: {
  searchParams: { classId?: string; from?: string; to?: string };
}) {
  const session = await getSession();
  const teacherId = session!.user.id;
  const classId = searchParams.classId || undefined;
  const from = searchParams.from ? new Date(searchParams.from) : undefined;
  const to = searchParams.to ? new Date(searchParams.to) : undefined;
  const [subjects, rows] = await Promise.all([
    getTeacherSubjects(teacherId),
    getAttendanceHistory(
      teacherId,
      classId,
      from && !isNaN(from.getTime()) ? from : undefined,
      to && !isNaN(to.getTime()) ? to : undefined
    ),
  ]);
  const classes = subjects
    .filter((s, i, arr) => arr.findIndex((t) => t.classId === s.classId) === i)
    .map((s) => ({ id: s.classId, name: s.class.name }));
  const present = rows.filter((r) => r.status === "PRESENT").length;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Attendance</h1>
          <p className="mt-1 text-sm text-sub">
            {rows.length} marked · {present} present
          </p>
        </div>
        <Link href="/teacher/attendance/mark">
          <Button>
            <ClipboardCheck className="h-4 w-4" />
            Mark attendance
          </Button>
        </Link>
      </div>
      <Reveal>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>History</CardTitle>
              <CardDescription>Filter by class and date range</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form method="get" className="grid gap-3 sm:grid-cols-4">
              <div>
                <FieldLabel>Class</FieldLabel>
                <select
                  name="classId"
                  defaultValue={classId ?? ""}
                  className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-ink outline-none focus:border-brand-600"
                >
                  <option value="">All classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>From</FieldLabel>
                <Input type="date" name="from" defaultValue={searchParams.from ?? ""} />
              </div>
              <div>
                <FieldLabel>To</FieldLabel>
                <Input type="date" name="to" defaultValue={searchParams.to ?? ""} />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="secondary">
                  Apply filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Reveal>
      {rows.length === 0 ? (
        <Reveal delay={0.05}>
          <Card className="mt-4">
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <CalendarDays className="h-5 w-5 text-brand-600" />
                </span>
                <div>
                  <p className="font-semibold text-ink">No records found</p>
                  <p className="text-sm text-sub">Adjust the filters or take a new register.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <Card className="mt-4">
            <CardHeader>
              <div>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  {present} of {rows.length} present
                </CardDescription>
              </div>
              <StatusBadge status={present === rows.length ? "PRESENT" : "PENDING"} />
            </CardHeader>
            <CardContent>
              <Table>
                <THead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Student</Th>
                    <Th>Class</Th>
                    <Th>Subject</Th>
                    <Th>Status</Th>
                  </Tr>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <Tr key={r.id}>
                      <Td className="text-sub">{formatDate(r.date)}</Td>
                      <Td className="font-medium">{r.student.name}</Td>
                      <Td className="text-sub">{r.class.name}</Td>
                      <Td className="text-sub">{r.subject.name}</Td>
                      <Td>
                        <StatusBadge status={r.status} />
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
