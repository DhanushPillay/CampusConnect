"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTeacherExams(teacherId: string) {
  await requireUser(["TEACHER","ADMIN"]);
  return prisma.exam.findMany({
    where: { createdById: teacherId },
    include: {
      subject: { select: { id: true, name: true } },
      questions: { select: { id: true, questionText: true, options: true, correctOption: true, marks: true } },
      submissions: { select: { id: true, score: true, submittedAt: true, student: { select: { id: true, name: true } } } },
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getExamAttempts(examId: string, teacherId: string) {
  await requireUser(["TEACHER","ADMIN"]);
  return prisma.examSubmission.findMany({
    where: { examId, exam: { createdById: teacherId } },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { submittedAt: "desc" },
  });
}

export async function createExam(input: {
  name: string;
  subjectId: string;
  totalMarks: number;
  duration: number;
  createdById: string;
}) {
  await requireUser(["TEACHER","ADMIN"]);
  const exam = await prisma.exam.create({ data: input });
  revalidatePath("/teacher/exams");
  return exam.id;
}

export async function addQuestion(input: {
  examId: string;
  questionText: string;
  options: string[];
  correctOption: number;
  marks: number;
}) {
  await requireUser(["TEACHER","ADMIN"]);
  await prisma.question.create({
    data: {
      examId: input.examId,
      questionText: input.questionText,
      options: JSON.stringify(input.options),
      correctOption: input.correctOption,
      marks: input.marks,
    },
  });
  revalidatePath("/teacher/exams");
}

export async function updateQuestion(
  id: string,
  data: { questionText?: string; options?: string[]; correctOption?: number; marks?: number }
) {
  await requireUser(["TEACHER","ADMIN"]);
  await prisma.question.update({
    where: { id },
    data: {
      ...(data.questionText !== undefined ? { questionText: data.questionText } : {}),
      ...(data.options !== undefined ? { options: JSON.stringify(data.options) } : {}),
      ...(data.correctOption !== undefined ? { correctOption: data.correctOption } : {}),
      ...(data.marks !== undefined ? { marks: data.marks } : {}),
    },
  });
  revalidatePath("/teacher/exams");
}

export async function deleteQuestion(id: string) {
  await requireUser(["TEACHER","ADMIN"]);
  await prisma.question.delete({ where: { id } });
  revalidatePath("/teacher/exams");
}

export async function publishExam(id: string) {
  await requireUser(["TEACHER","ADMIN"]);
  await prisma.exam.update({ where: { id }, data: { isPublished: true } });
  revalidatePath("/teacher/exams");
  revalidatePath("/student/exams");
  revalidatePath("/student");
}

export async function getStudentExams(studentId: string) {
  await requireUser(["STUDENT","ADMIN"]);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  return prisma.exam.findMany({
    where: {
      isPublished: true,
      subject: { classId: { in: enrollments.map((e) => e.classId) } },
    },
    include: {
      subject: { select: { name: true } },
      submissions: { where: { studentId }, select: { id: true, score: true } },
    },
  });
}

export async function submitExam(examId: string, studentId: string, answers: number[]) {
  const me2 = await requireUser(["STUDENT", "ADMIN"]);
  if (me2.role !== "ADMIN" && me2.id !== studentId) throw new Error("Forbidden");
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, isPublished: true, subject: { select: { classId: true } } },
  });
  if (!exam || !exam.isPublished) throw new Error("Exam not available");
  const enr2 = await prisma.enrollment.findFirst({ where: { studentId, classId: exam.subject.classId } });
  if (!enr2) throw new Error("Forbidden");
  const done = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId } },
    select: { id: true },
  });
  if (done) throw new Error("Already submitted");
  const questions = await prisma.question.findMany({
    where: { examId },
    select: { correctOption: true, marks: true },
  });
  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctOption) score += q.marks;
  });
  await prisma.examSubmission.upsert({
    where: { examId_studentId: { examId, studentId } },
    update: { answers: JSON.stringify(answers), score },
    create: { examId, studentId, answers: JSON.stringify(answers), score },
  });
  revalidatePath("/student/exams");
  revalidatePath("/student");
  return score;
}
