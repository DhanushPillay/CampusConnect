import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion";
import { Award, ClipboardCheck } from "lucide-react";
import { getStudentGrades } from "@/lib/actions/student";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentGrades() {
  const session = await getSession();
  const { grades, examResults } = await getStudentGrades(session!.user.id);
  const empty = grades.length === 0 && examResults.length === 0;
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Grades</h1>
        <p className="mt-1 text-sm text-sub">Marks per subject</p>
      </div>
      {empty ? (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-brand-600" />
                <CardTitle>No grades yet</CardTitle>
              </div>
              <CardDescription>Graded assignments and exams show up here.</CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
      ) : (
        <div className="space-y-4">
          <Reveal delay={0.05}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-brand-600" />
                  <div>
                    <CardTitle>Report card</CardTitle>
                    <CardDescription>{grades.length} graded subjects</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <p className="text-sm text-sub">No subject grades yet.</p>
                ) : (
                  <Table>
                    <THead>
                      <Tr>
                        <Th>Subject</Th>
                        <Th>Marks</Th>
                        <Th>Grade</Th>
                      </Tr>
                    </THead>
                    <TBody>
                      {grades.map((g) => (
                        <Tr key={g.id}>
                          <Td className="font-medium">
                            {g.subject.name}{" "}
                            <span className="text-sm text-sub">{g.subject.code}</span>
                          </Td>
                          <Td className="text-sm">
                            {g.marksObtained}/{g.totalMarks}
                          </Td>
                          <Td>
                            <StatusBadge status={g.grade} />
                          </Td>
                        </Tr>
                      ))}
                    </TBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-brand-600" />
                  <div>
                    <CardTitle>Exam results</CardTitle>
                    <CardDescription>{examResults.length} published exams attempted</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {examResults.length === 0 ? (
                  <p className="text-sm text-sub">No exam attempts yet.</p>
                ) : (
                  <Table>
                    <THead>
                      <Tr>
                        <Th>Exam</Th>
                        <Th>Subject</Th>
                        <Th>Score</Th>
                      </Tr>
                    </THead>
                    <TBody>
                      {examResults.map((r) => (
                        <Tr key={r.id}>
                          <Td className="font-medium">{r.exam.name}</Td>
                          <Td className="text-sm text-sub">
                            {r.exam.subject.name}{" "}
                            <span className="text-sm text-sub">{r.exam.subject.code}</span>
                          </Td>
                          <Td className="text-sm">
                            {r.score ?? 0}/{r.exam.totalMarks}
                          </Td>
                        </Tr>
                      ))}
                    </TBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      )}
    </div>
  );
}
