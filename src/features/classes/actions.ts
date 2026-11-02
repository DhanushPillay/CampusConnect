"use server";

import prisma from "@/lib/prisma";
import { requireUser, scopedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { assignTeacherSchema, createClassSchema, createSubjectSchema } from "./schemas";

export async function getClasses() {
  await requireUser(["ADMIN"]);
  return prisma.class.findMany({
    include: { department: true, _count: { select: { enrollments: true, subjects: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createClass(name: string, section: string, departmentId: string) {
  await requireUser(["ADMIN"]);
  const input = createClassSchema.parse({ name, section, departmentId });
  const department = await prisma.department.findUnique({
    where: { id: input.departmentId },
    select: { id: true },
  });
  if (!department) throw new Error("Department not found");
  await prisma.class.create({ data: input });
  revalidatePath("/admin/classes");
  revalidatePath("/admin/subjects");
}

export async function getSubjects() {
  await requireUser(["ADMIN"]);
  return prisma.subject.findMany({
    include: { class: true, teacher: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createSubject(name: string, code: string, classId: string) {
  await requireUser(["ADMIN"]);
  const input = createSubjectSchema.parse({ name, code, classId });
  const cls = await prisma.class.findUnique({ where: { id: input.classId }, select: { id: true } });
  if (!cls) throw new Error("Class not found");

  try {
    await prisma.subject.create({ data: input });
  } catch (error) {
    if (isUniqueError(error)) throw new Error("Subject code already exists");
    throw error;
  }
  revalidatePath("/admin/subjects");
  revalidatePath("/teacher/classes");
}

export async function assignTeacher(subjectId: string, teacherId: string) {
  await requireUser(["ADMIN"]);
  const input = assignTeacherSchema.parse({ subjectId, teacherId });
  const [subject, teacher] = await Promise.all([
    prisma.subject.findUnique({ where: { id: input.subjectId }, select: { id: true } }),
    prisma.user.findUnique({
      where: { id: input.teacherId },
      select: { role: true, isActive: true },
    }),
  ]);
  if (!subject) throw new Error("Subject not found");
  if (teacher?.role !== "TEACHER" || !teacher.isActive) throw new Error("Teacher not found");

  await prisma.subject.update({ where: { id: input.subjectId }, data: { teacherId: input.teacherId } });
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/timetable");
  revalidatePath("/teacher/classes");
  revalidatePath("/teacher/timetable");
}

export async function getDepartments() {
  await requireUser(["ADMIN"]);
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function getClassesWithStudents() {
  await requireUser(["ADMIN"]);
  return prisma.class.findMany({
    include: {
      department: true,
      _count: { select: { enrollments: true, subjects: true } },
      enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getTeacherSubjects(teacherId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  return prisma.subject.findMany({
    where: { teacherId: id },
    include: {
      class: true,
      _count: { select: { assignments: true, exams: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClassRoster(classId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) throw new Error("Class not found");

  if (me.role !== "ADMIN") {
    const teaches = await prisma.subject.count({ where: { classId, teacherId: me.id } });
    if (!teaches) throw new Error("Forbidden");
  }

  const [enrollments, attGroups, attPresent, subjects] = await Promise.all([
    prisma.enrollment.findMany({
      where: { classId },
      include: { student: { select: { id: true, name: true, email: true } } },
    }),
    prisma.attendance.groupBy({ by: ["studentId"], where: { classId }, _count: true }),
    prisma.attendance.groupBy({ by: ["studentId"], where: { classId, status: { not: "ABSENT" } }, _count: true }),
    prisma.subject.findMany({ where: { classId }, select: { id: true } }),
  ]);
  const totalMap = new Map(attGroups.map((g) => [g.studentId, g._count]));
  const presentMap = new Map(attPresent.map((g) => [g.studentId, g._count]));
  const grades = await prisma.grade.findMany({
    where: {
      subjectId: { in: subjects.map((s) => s.id) },
      studentId: { in: enrollments.map((e) => e.studentId) },
    },
    select: { studentId: true, marksObtained: true, totalMarks: true },
  });
  const gradesByStudent = new Map<string, { sum: number; n: number }>();
  for (const grade of grades) {
    if (!grade.totalMarks) continue;
    const current = gradesByStudent.get(grade.studentId) ?? { sum: 0, n: 0 };
    current.sum += grade.marksObtained / grade.totalMarks;
    current.n += 1;
    gradesByStudent.set(grade.studentId, current);
  }
  const students = enrollments.map((enrollment) => {
    const total = totalMap.get(enrollment.studentId) ?? 0;
    const present = presentMap.get(enrollment.studentId) ?? 0;
    const grade = gradesByStudent.get(enrollment.studentId);
    return {
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      present,
      total,
      attendancePct: total ? Math.round((present / total) * 100) : 0,
      avgPct: grade && grade.n ? Math.round((grade.sum / grade.n) * 100) : 0,
      gradesCount: grade?.n ?? 0,
    };
  });
  return { class: cls, students };
}

function isUniqueError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
