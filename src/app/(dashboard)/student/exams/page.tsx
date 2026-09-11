import { Reveal } from "@/components/motion";
import { StudentExamsClient } from "../assignments/client";
import { getStudentExams } from "@/lib/actions/student";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentExams() {
  const session = await getSession();
  const exams = await getStudentExams(session!.user.id);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Exams</h1>
        <p className="mt-1 text-sm text-sub">Published MCQ exams</p>
      </div>
      <Reveal delay={0.05}>
        <StudentExamsClient exams={exams} />
      </Reveal>
    </div>
  );
}
