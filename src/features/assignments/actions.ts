"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function letterFor(pct: number) {
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export async function getTeacherAssignments(teacherId: string) {
  await requireUser(["TEACHER","ADMIN"]);
  return prisma.assignment.findMany({
    where: { teacherId },
    include: { subject: true, _count: { select: { submissions: true } } },
    orderBy: { deadline: "asc" },
  });
}

export async function createAssignment(input: {
  title: string;
  description: string;
  subjectId: string;
  teacherId: string;
  deadline: Date;
  maxMarks: number;
}) {
  await requireUser(["TEACHER","ADMIN"]);
  await prisma.assignment.create({ data: input });
  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
}

export async function getPendingSubmissions(teacherId: string) {
  await requireUser(["TEACHER","ADMIN"]);
  return prisma.submission.findMany({
    where: { assignment: { teacherId }, marksObtained: null },
    include: {
      assignment: { select: { title: true, maxMarks: true } },
      student: { select: { name: true } },
    },
    take: 25,
  });
}

export async function gradeSubmission(id: string, marks: number, feedback: string, graderId: string) {
  const me4 = await requireUser(["TEACHER", "ADMIN"]);
  if (me4.role !== "ADMIN" && graderId !== me4.id) throw new Error("Forbidden");
  const sub = await prisma.submission.findUnique({
    where: { id },
    select: { studentId: true, assignment: { select: { subjectId: true, maxMarks: true } } },
  });
  if (!sub) throw new Error("Submission not found");
  const max = sub.assignment.maxMarks;
  const safe = Math.max(0, Math.min(Number.isFinite(marks) ? Math.round(marks) : 0, max));
  const pct = max > 0 ? (safe / max) * 100 : 0;
  const letter = letterFor(pct);
  await prisma.$transaction([
    prisma.submission.update({
      where: { id },
      data: { marksObtained: safe, feedback, gradedById: graderId },
    }),
    prisma.grade.upsert({
      where: { studentId_subjectId: { studentId: sub.studentId, subjectId: sub.assignment.subjectId } },
      update: { marksObtained: safe, totalMarks: max, grade: letter },
      create: {
        studentId: sub.studentId,
        subjectId: sub.assignment.subjectId,
        marksObtained: safe,
        totalMarks: max,
        grade: letter,
      },
    }),
  ]);
  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
  revalidatePath("/student/grades");
  revalidatePath("/student");
}

export async function getStudentAssignments(studentId: string) {
  await requireUser(["STUDENT","ADMIN"]);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);
  const assignments = await prisma.assignment.findMany({
    where: { subject: { classId: { in: classIds } } },
    include: {
      subject: { select: { name: true, code: true } },
      submissions: {
        where: { studentId },
        select: { content: true, marksObtained: true, feedback: true },
      },
    },
    orderBy: { deadline: "asc" },
    take: 50,
  });
  return assignments;
}

export async function submitAssignment(assignmentId: string, studentId: string, content: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  if (me.role !== "ADMIN" && me.id !== studentId) throw new Error("Forbidden");
  const asg = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, subject: { select: { classId: true } } },
  });
  if (!asg) throw new Error("Assignment not found");
  const enr = await prisma.enrollment.findFirst({ where: { studentId, classId: asg.subject.classId } });
  if (!enr) throw new Error("Forbidden");
  const prior = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    select: { marksObtained: true },
  });
  if (prior?.marksObtained != null) throw new Error("Already graded");
  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    update: { content },
    create: { assignmentId, studentId, content },
  });
  revalidatePath("/student/assignments");
  revalidatePath("/student");
}

export async function getStudentGrades(studentId: string) {
  await requireUser(["STUDENT","ADMIN"]);
  const [grades, examResults] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId },
      include: { subject: { select: { name: true, code: true } } },
    }),
    prisma.examSubmission.findMany({
      where: { studentId, exam: { isPublished: true } },
      include: {
        exam: {
          select: {
            name: true,
            totalMarks: true,
            subject: { select: { name: true, code: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);
  return { grades, examResults };
}
