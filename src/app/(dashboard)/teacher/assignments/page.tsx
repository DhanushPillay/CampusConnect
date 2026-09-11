import { Reveal } from "@/components/motion";
import { AssignmentsClient } from "./client";
import { getTeacherAssignments, getPendingSubmissions, getTeacherSubjects } from "@/lib/actions/teacher";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeacherAssignments() {
  const session = await getSession();
  const teacherId = session!.user.id;
  const [assignments, pending, subjects] = await Promise.all([
    getTeacherAssignments(teacherId),
    getPendingSubmissions(teacherId),
    getTeacherSubjects(teacherId),
  ]);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-sub">Create, collect, grade</p>
      </div>
      <Reveal delay={0.05}>
        <AssignmentsClient assignments={assignments} pending={pending} subjects={subjects} teacherId={teacherId} />
      </Reveal>
    </div>
  );
}
