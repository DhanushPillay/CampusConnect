import { Reveal } from "@/components/motion";
import { StudentAssignmentsClient } from "./client";
import { getStudentAssignments } from "@/lib/actions/student";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentAssignments() {
  const session = await getSession();
  const items = await getStudentAssignments(session!.user.id);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-sub">Submit before the deadline</p>
      </div>
      <Reveal delay={0.05}>
        <StudentAssignmentsClient items={items} studentId={session!.user.id} />
      </Reveal>
    </div>
  );
}
