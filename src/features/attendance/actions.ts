"use server";

import prisma from "@/lib/prisma";
import { requireUser, scopedUserId } from "@/lib/auth";
import { dateOnly, endOfDate } from "@/lib/date";
import { revalidatePath } from "next/cache";
import { bulkMarkSchema } from "./schemas";

export async function bulkMarkAttendance(input: {
  classId: string;
  subjectId: string;
  date: Date | string;
  markedById: string;
  rows: { studentId: string; status: string }[];
}) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const parsed = bulkMarkSchema.parse(input);

  const [subject, cls] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: parsed.subjectId },
      select: { classId: true, teacherId: true },
    }),
    prisma.class.findUnique({ where: { id: parsed.classId }, select: { id: true } }),
  ]);
  if (!cls) throw new Error("Class not found");
  if (!subject || subject.classId !== parsed.classId) throw new Error("Subject does not belong to class");
  if (me.role !== "ADMIN" && subject.teacherId !== me.id) throw new Error("Forbidden");

  const studentIds = parsed.rows.map((row) => row.studentId);
  const enrolled = await prisma.enrollment.count({
    where: { classId: parsed.classId, studentId: { in: studentIds } },
  });
  if (enrolled !== studentIds.length) throw new Error("Student is not enrolled in this class");

  const day = dateOnly(parsed.date);
  const markedById = me.id;

  await prisma.$transaction(
    parsed.rows.map((row) =>
      prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: row.studentId,
            subjectId: parsed.subjectId,
            date: day,
          },
        },
        update: { status: row.status, markedById },
        create: {
          studentId: row.studentId,
          classId: parsed.classId,
          subjectId: parsed.subjectId,
          date: day,
          status: row.status,
          markedById,
        },
      })
    )
  );

  revalidatePath("/teacher/attendance");
  revalidatePath("/teacher");
  revalidatePath("/student/attendance");
  revalidatePath("/student");
}

export async function getAttendanceHistory(
  teacherId: string,
  classId?: string,
  from?: Date | string,
  to?: Date | string
) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  const gte = from ? dateOnly(from) : undefined;
  const lte = to ? endOfDate(to) : undefined;

  return prisma.attendance.findMany({
    where: {
      markedById: id,
      ...(classId ? { classId } : {}),
      ...(gte || lte ? { date: { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } } : {}),
    },
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
    take: 500,
  });
}

export async function getStudentAttendance(studentId: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const id = scopedUserId(me, studentId);

  const [records, groups] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId: id },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { date: "desc" },
      take: 25,
    }),
    prisma.attendance.groupBy({
      by: ["subjectId"],
      where: { studentId: id },
      _count: true,
    }),
  ]);

  const subjects = await prisma.subject.findMany({
    where: { id: { in: groups.map((group) => group.subjectId) } },
    select: { id: true, name: true, code: true },
  });
  const nameById = new Map(subjects.map((subject) => [subject.id, subject]));
  const presentBySubject = await prisma.attendance.groupBy({
    by: ["subjectId"],
    where: { studentId: id, status: { not: "ABSENT" } },
    _count: true,
  });
  const presentMap = new Map(presentBySubject.map((group) => [group.subjectId, group._count]));

  const perSubject = groups.map((group) => {
    const subject = nameById.get(group.subjectId);
    const present = presentMap.get(group.subjectId) ?? 0;
    return {
      code: subject?.code ?? group.subjectId,
      name: subject?.name ?? "",
      total: group._count,
      present,
      pct: group._count ? Math.round((present / group._count) * 100) : 0,
    };
  });

  return { records, perSubject };
}
