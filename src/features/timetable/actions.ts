"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTimetable() {
  await requireUser(["ADMIN"]);
  return prisma.timetable.findMany({
    include: { class: true, subject: true, teacher: { select: { name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    take: 100,
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
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  if (!DAYS.includes(dayOfWeek)) throw new Error("Invalid day");
  const pad = (t: string) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
    if (!m) throw new Error("Invalid time, use HH:MM");
    return `${m[1].padStart(2, "0")}:${m[2]}`;
  };
  const start = pad(startTime);
  const end = pad(endTime);
  if (start >= end) throw new Error("End time must be after start time");
  await prisma.timetable.create({
    data: {
      dayOfWeek,
      startTime: start,
      endTime: end,
      classId,
      subjectId,
      teacherId,
      room: room?.trim() || null,
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
  await requireUser(["TEACHER","ADMIN"]);
  return prisma.timetable.findMany({
    where: { teacherId },
    include: { class: true, subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function getStudentTimetable(studentId: string) {
  await requireUser(["STUDENT","ADMIN"]);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  return prisma.timetable.findMany({
    where: { classId: { in: enrollments.map((e) => e.classId) } },
    include: { subject: true, teacher: { select: { name: true } }, class: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}
