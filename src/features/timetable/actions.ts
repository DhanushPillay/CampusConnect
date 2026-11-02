"use server";

import prisma from "@/lib/prisma";
import { requireUser, scopedUserId } from "@/lib/auth";
import { normalizeTime } from "@/lib/date";
import { revalidatePath } from "next/cache";
import { entrySchema } from "./schemas";

export async function getTimetable() {
  await requireUser(["ADMIN"]);
  return prisma.timetable.findMany({
    include: { class: true, subject: true, teacher: { select: { name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    take: 200,
  });
}

export async function createTimetableEntry(
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  classId: string,
  subjectId: string,
  teacherId: string,
  room?: string
) {
  await requireUser(["ADMIN"]);
  const input = entrySchema.parse({
    dayOfWeek,
    startTime: normalizeTime(startTime),
    endTime: normalizeTime(endTime),
    classId,
    subjectId,
    teacherId,
    room,
  });

  const [cls, subject, teacher] = await Promise.all([
    prisma.class.findUnique({ where: { id: input.classId }, select: { id: true } }),
    prisma.subject.findUnique({
      where: { id: input.subjectId },
      select: { classId: true, teacherId: true },
    }),
    prisma.user.findUnique({
      where: { id: input.teacherId },
      select: { role: true, isActive: true },
    }),
  ]);
  if (!cls) throw new Error("Class not found");
  if (!subject || subject.classId !== input.classId) throw new Error("Subject does not belong to class");
  if (teacher?.role !== "TEACHER" || !teacher.isActive) throw new Error("Teacher not found");
  if (subject.teacherId !== input.teacherId) throw new Error("Teacher is not assigned to this subject");

  const conflict = await prisma.timetable.findFirst({
    where: {
      dayOfWeek: input.dayOfWeek,
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
      OR: [{ classId: input.classId }, { teacherId: input.teacherId }],
    },
    select: { id: true },
  });
  if (conflict) throw new Error("Class or teacher already has a slot at this time");

  await prisma.timetable.create({
    data: {
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      classId: input.classId,
      subjectId: input.subjectId,
      teacherId: input.teacherId,
      room: input.room?.trim() || null,
    },
  });
  revalidatePath("/admin/timetable");
  revalidatePath("/teacher/timetable");
  revalidatePath("/student/timetable");
}

export async function deleteTimetableEntry(id: string) {
  await requireUser(["ADMIN"]);
  await prisma.timetable.delete({ where: { id } });
  revalidatePath("/admin/timetable");
  revalidatePath("/teacher/timetable");
  revalidatePath("/student/timetable");
}

export async function getTeacherTimetable(teacherId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  return prisma.timetable.findMany({
    where: { teacherId: id },
    include: { class: true, subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function getStudentTimetable(studentId: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const id = scopedUserId(me, studentId);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: id },
    select: { classId: true },
  });
  return prisma.timetable.findMany({
    where: { classId: { in: enrollments.map((enrollment) => enrollment.classId) } },
    include: { subject: true, teacher: { select: { name: true } }, class: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}
