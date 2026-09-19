"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function bulkMarkAttendance(input: {
  classId: string;
  subjectId: string;
  date: Date;
  markedById: string;
  rows: { studentId: string; status: string }[];
}) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  if (me.role !== "ADMIN" && input.markedById !== me.id) throw new Error("Forbidden");
  for (const r of input.rows) {
    if (!["PRESENT", "ABSENT", "LATE"].includes(r.status)) throw new Error("Invalid status");
  }
  const day = new Date(input.date);
  day.setHours(0, 0, 0, 0);
  await prisma.$transaction(
    input.rows.map((r) =>
      prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: { studentId: r.studentId, subjectId: input.subjectId, date: day },
        },
        update: { status: r.status, markedById: input.markedById },
        create: {
          studentId: r.studentId,
          classId: input.classId,
          subjectId: input.subjectId,
          date: day,
          status: r.status,
          markedById: input.markedById,
        },
      })
    )
  );
  revalidatePath("/teacher/attendance");
}

export async function getAttendanceHistory(
  teacherId: string,
  classId?: string,
  from?: Date,
  to?: Date
) {
  await requireUser(["TEACHER","ADMIN"]);
  const gte = from ? new Date(from) : undefined;
  if (gte) gte.setHours(0, 0, 0, 0);
  const lte = to ? new Date(to) : undefined;
  if (lte) lte.setHours(23, 59, 59, 999);
  return prisma.attendance.findMany({
    where: {
      markedById: teacherId,
      ...(classId ? { classId } : {}),
      ...(gte || lte ? { date: { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } } : {}),
    },
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
    take: 200,
  });
}

export async function getStudentAttendance(studentId: string) {
  await requireUser(["STUDENT","ADMIN"]);
  const me0 = await requireUser(["STUDENT", "ADMIN"]);
  if (me0.role !== "ADMIN" && me0.id !== studentId) throw new Error("Forbidden");
  const [records, groups] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { date: "desc" },
      take: 25,
    }),
    prisma.attendance.groupBy({
      by: ["subjectId"],
      where: { studentId },
      _count: true,
    }),
  ]);
  const subjects = await prisma.subject.findMany({
    where: { id: { in: groups.map((g) => g.subjectId) } },
    select: { id: true, name: true, code: true },
  });
  const nameById = new Map(subjects.map((s) => [s.id, s]));
  const presentBySubject = await prisma.attendance.groupBy({
    by: ["subjectId"],
    where: { studentId, status: { not: "ABSENT" } },
    _count: true,
  });
  const presentMap = new Map(presentBySubject.map((g) => [g.subjectId, g._count]));
  const perSubject = groups.map((g) => {
    const s = nameById.get(g.subjectId);
    const present = presentMap.get(g.subjectId) ?? 0;
    return {
      code: s?.code ?? g.subjectId,
      name: s?.name ?? "",
      total: g._count,
      present,
      pct: g._count ? Math.round((present / g._count) * 100) : 0,
    };
  });
  return {
    records,
    perSubject,
  };
}
