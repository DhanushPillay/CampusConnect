import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Reveal } from "@/shared/motion";
import { TakeExamClient } from "../../assignments/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TakeExam({ params }: { params: { id: string } }) {
  const [session, exam] = await Promise.all([
    getSession(),
    prisma.exam.findUnique({
      where: { id: params.id },
      include: { subject: true, questions: { select: { id: true, questionText: true, options: true } } },
    }),
  ]);
  const studentId = session!.user.id;
  if (!exam || !exam.isPublished) notFound();
  const [enrollment, existing] = await Promise.all([
    prisma.enrollment.findFirst({
      where: { studentId, classId: exam.subject.classId },
    }),
    prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId: exam.id, studentId } },
    }),
  ]);
  if (!enrollment) notFound();
  if (existing) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-ink">{exam.name}</h1>
          <p className="mt-1 text-sm text-sub">
            {exam.subject.name} · {exam.duration} min
          </p>
        </div>
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Already submitted</CardTitle>
                <Badge variant="success">Scored {existing.score}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-sub">
                You already submitted this exam and scored {existing.score} out of{" "}
                {exam.totalMarks}. Re-takes are not allowed.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">{exam.name}</h1>
        <p className="mt-1 text-sm text-sub">
          {exam.subject.name} · {exam.duration} min
        </p>
      </div>
      <Reveal delay={0.05}>
        <TakeExamClient examId={exam.id} studentId={studentId} questions={exam.questions} />
      </Reveal>
    </div>
  );
}
