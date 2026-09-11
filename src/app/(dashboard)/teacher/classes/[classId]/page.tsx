import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { Users, ArrowLeft } from "lucide-react";
import { getClassRoster } from "@/lib/actions/teacher";

export const dynamic = "force-dynamic";

export default async function ClassRosterPage({ params }: { params: { classId: string } }) {
  const { class: cls, students } = await getClassRoster(params.classId);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {cls?.name ?? "Class"} roster
          </h1>
          <p className="mt-1 text-sm text-sub">
            {students.length} students · attendance and average grades
          </p>
        </div>
        <Link href="/teacher/classes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            All classes
          </Button>
        </Link>
      </div>
      {students.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <Users className="h-5 w-5 text-brand-600" />
                </span>
                <div>
                  <p className="font-semibold text-ink">No students enrolled</p>
                  <p className="text-sm text-sub">Roster is empty for this class.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Students ({students.length})</CardTitle>
                <CardDescription>Attendance share and grade average per student</CardDescription>
              </div>
              <Badge variant="brand">{cls?.name}</Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <THead>
                  <Tr>
                    <Th>Student</Th>
                    <Th>Attendance</Th>
                    <Th>Avg grade</Th>
                  </Tr>
                </THead>
                <TBody>
                  {students.map((s) => (
                    <Tr key={s.id}>
                      <Td className="font-medium">{s.name}</Td>
                      <Td className="text-sub">
                        {s.attendancePct}% ({s.present}/{s.total})
                      </Td>
                      <Td className="text-sub">
                        {s.gradesCount > 0 ? `${s.avgPct}%` : "No grades"}
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
