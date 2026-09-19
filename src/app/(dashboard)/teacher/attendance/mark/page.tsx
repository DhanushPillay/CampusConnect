import { Reveal } from "@/shared/motion";
import MarkClient from "./client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTeacherSubjects } from "@/features/classes/actions";

export const dynamic = "force-dynamic";

export default async function MarkPage() {
  const session = await getSession();
  const teacherId = session!.user.id;
  const subjects = await getTeacherSubjects(teacherId);
  const classIds = Array.from(new Set(subjects.map((s) => s.classId)));
  const classes = subjects
    .filter((s, i, arr) => arr.findIndex((t) => t.classId === s.classId) === i)
    .map((s) => ({ id: s.classId, name: s.class.name }));
  const enrollments = await prisma.enrollment.findMany({
    where: { classId: { in: classIds } },
    include: { student: { select: { id: true, name: true } } },
    take: 200,
  });
  const byClass: Record<string, { id: string; name: string }[]> = {};
  for (const c of classIds) byClass[c] = [];
  const seenPerClass = new Map<string, Set<string>>();
  for (const e of enrollments) {
    if (!seenPerClass.has(e.classId)) seenPerClass.set(e.classId, new Set());
    if (seenPerClass.get(e.classId)!.has(e.student.id)) continue;
    seenPerClass.get(e.classId)!.add(e.student.id);
    byClass[e.classId].push(e.student);
  }
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Mark attendance</h1>
        <p className="mt-1 text-sm text-sub">Pick a class and date, then save the register</p>
      </div>
      <Reveal delay={0.05}>
        <MarkClient
          classes={classes}
          studentsByClass={byClass}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name, classId: s.classId }))}
          teacherId={teacherId}
        />
      </Reveal>
    </div>
  );
}
