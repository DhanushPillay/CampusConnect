"use server";

import prisma from "@/lib/prisma";
import { requireUser, scopedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createAssignmentSchema, gradeSchema, submitAssignmentSchema } from "./schemas";

function letterFor(pct: number) {
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export async function getTeacherAssignments(teacherId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  return prisma.assignment.findMany({
    where: { teacherId: id },
    include: { subject: true, _count: { select: { submissions: true } } },
    orderBy: { deadline: "asc" },
  });
}

export async function createAssignment(input: {
  title: string;
  description: string;
  subjectId: string;
  teacherId: string;
  deadline: Date | string;
  maxMarks: number;
}) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const parsed = createAssignmentSchema.parse(input);
  const teacherId = scopedUserId(me, parsed.teacherId);

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.subjectId },
    select: { teacherId: true },
  });
  if (!subject) throw new Error("Subject not found");
  if (subject.teacherId !== teacherId) throw new Error("Teacher is not assigned to this subject");

  const deadline = new Date(parsed.deadline);
  if (Number.isNaN(deadline.getTime())) throw new Error("Invalid deadline");

  await prisma.assignment.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      subjectId: parsed.subjectId,
      teacherId,
      deadline,
      maxMarks: parsed.maxMarks,
    },
  });
  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher");
  revalidatePath("/student/assignments");
  revalidatePath("/student");
}

export async function getPendingSubmissions(teacherId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  return prisma.submission.findMany({
    where: { assignment: { teacherId: id }, marksObtained: null },
    include: {
      assignment: { select: { title: true, maxMarks: true } },
      student: { select: { name: true } },
    },
    take: 25,
  });
}

export async function gradeSubmission(id: string, marks: number, feedback: string, graderId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const parsed = gradeSchema.parse({ id, marks, feedback, graderId });
  scopedUserId(me, parsed.graderId);
  const gradedById = me.id;

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.id },
    select: {
      studentId: true,
      assignment: { select: { subjectId: true, maxMarks: true, teacherId: true } },
    },
  });
  if (!submission) throw new Error("Submission not found");
  if (me.role !== "ADMIN" && submission.assignment.teacherId !== me.id) throw new Error("Forbidden");

  const max = submission.assignment.maxMarks;
  const safe = Math.max(0, Math.min(Math.round(parsed.marks), max));
  const pct = max > 0 ? (safe / max) * 100 : 0;
  const letter = letterFor(pct);

  await prisma.$transaction([
    prisma.submission.update({
      where: { id: parsed.id },
      data: { marksObtained: safe, feedback: parsed.feedback.trim(), gradedById },
    }),
    prisma.grade.upsert({
      where: {
        studentId_subjectId: {
          studentId: submission.studentId,
          subjectId: submission.assignment.subjectId,
        },
      },
      update: { marksObtained: safe, totalMarks: max, grade: letter },
      create: {
        studentId: submission.studentId,
        subjectId: submission.assignment.subjectId,
        marksObtained: safe,
        totalMarks: max,
        grade: letter,
      },
    }),
  ]);

  revalidatePath("/teacher/assignments");
  revalidatePath("/teacher");
  revalidatePath("/student/assignments");
  revalidatePath("/student/grades");
  revalidatePath("/student");
}

export async function getStudentAssignments(studentId: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const id = scopedUserId(me, studentId);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: id },
    select: { classId: true },
  });
  const classIds = enrollments.map((enrollment) => enrollment.classId);
  return prisma.assignment.findMany({
    where: { subject: { classId: { in: classIds } } },
    include: {
      subject: { select: { name: true, code: true } },
      submissions: {
        where: { studentId: id },
        select: { content: true, marksObtained: true, feedback: true },
      },
    },
    orderBy: { deadline: "asc" },
    take: 50,
  });
}

export async function submitAssignment(assignmentId: string, studentId: string, content: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const parsed = submitAssignmentSchema.parse({ assignmentId, studentId, content });
  const id = scopedUserId(me, parsed.studentId);

  const assignment = await prisma.assignment.findUnique({
    where: { id: parsed.assignmentId },
    select: { id: true, subject: { select: { classId: true } } },
  });
  if (!assignment) throw new Error("Assignment not found");

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId: id, classId: assignment.subject.classId },
  });
  if (!enrollment) throw new Error("Forbidden");

  const prior = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId: parsed.assignmentId, studentId: id } },
    select: { marksObtained: true },
  });
  if (prior?.marksObtained != null) throw new Error("Already graded");

  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: parsed.assignmentId, studentId: id } },
    update: { content: parsed.content },
    create: { assignmentId: parsed.assignmentId, studentId: id, content: parsed.content },
  });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
}

export async function getStudentGrades(studentId: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const id = scopedUserId(me, studentId);
  const [grades, examResults] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId: id },
      include: { subject: { select: { name: true, code: true } } },
    }),
    prisma.examSubmission.findMany({
      where: { studentId: id, exam: { isPublished: true } },
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
