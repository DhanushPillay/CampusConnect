"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getClasses() {
  await requireUser(["ADMIN"]);
  return prisma.class.findMany({
    include: { department: true, _count: { select: { enrollments: true, subjects: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createClass(name: string, section: string, departmentId: string) {
  await requireUser(["ADMIN"]);
  await prisma.class.create({ data: { name, section, departmentId } });
  revalidatePath("/admin/classes");
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
  const cleanCode = code.trim().toUpperCase();
  const existing = await prisma.subject.findUnique({ where: { code: cleanCode } });
  if (existing) throw new Error("Subject code already exists");
  await prisma.subject.create({ data: { name: name.trim(), code: cleanCode, classId } });
  revalidatePath("/admin/subjects");
  revalidatePath("/teacher/subjects");
}

export async function assignTeacher(subjectId: string, teacherId: string) {
  await requireUser(["ADMIN"]);
  await prisma.subject.update({ where: { id: subjectId }, data: { teacherId } });
  revalidatePath("/admin/subjects");
  revalidatePath("/teacher/subjects");
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
  await requireUser(["TEACHER","ADMIN"]);
  return prisma.subject.findMany({
    where: { teacherId },
    include: {
      class: true,
      _count: { select: { assignments: true, exams: true } },
    },
  });
}

export async function getClassRoster(classId: string) {
  await requireUser(["TEACHER","ADMIN"]);
  const [cls, enrollments, attGroups, attPresent, subjects] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
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
  for (const g of grades) {
    if (!g.totalMarks) continue;
    const cur = gradesByStudent.get(g.studentId) ?? { sum: 0, n: 0 };
    cur.sum += g.marksObtained / g.totalMarks;
    cur.n += 1;
    gradesByStudent.set(g.studentId, cur);
  }
  const students = enrollments.map((e) => {
    const total = totalMap.get(e.studentId) ?? 0;
    const present = presentMap.get(e.studentId) ?? 0;
    const gr = gradesByStudent.get(e.studentId);
    return {
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      present,
      total,
      attendancePct: total ? Math.round((present / total) * 100) : 0,
      avgPct: gr && gr.n ? Math.round((gr.sum / gr.n) * 100) : 0,
      gradesCount: gr?.n ?? 0,
    };
  });
  return { class: cls, students };
}
