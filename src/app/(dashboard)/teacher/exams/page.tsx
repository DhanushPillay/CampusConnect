import { Reveal } from "@/shared/motion";
import { ExamsClient } from "../assignments/client";

import { getSession } from "@/lib/auth";
import { getTeacherExams } from "@/features/exams/actions";
import { getTeacherSubjects } from "@/features/classes/actions";

export const dynamic = "force-dynamic";

export default async function TeacherExams() {
  const session = await getSession();
  const teacherId = session!.user.id;
  const [exams, subjects] = await Promise.all([
    getTeacherExams(teacherId),
    getTeacherSubjects(teacherId),
  ]);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Exams</h1>
        <p className="mt-1 text-sm text-sub">MCQ exams with auto-grading</p>
      </div>
      <Reveal delay={0.05}>
        <ExamsClient exams={exams} subjects={subjects} teacherId={teacherId} />
      </Reveal>
    </div>
  );
}
