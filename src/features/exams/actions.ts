"use server";

import prisma from "@/lib/prisma";
import { requireUser, scopedUserId, type SessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createExamSchema,
  questionSchema,
  questionUpdateSchema,
  submitExamSchema,
} from "./schemas";

async function ownedExam(examId: string, me: SessionUser) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, isPublished: true, createdById: true, totalMarks: true },
  });
  if (!exam) throw new Error("Exam not found");
  if (me.role !== "ADMIN" && exam.createdById !== me.id) throw new Error("Forbidden");
  if (exam.isPublished) throw new Error("Published exams cannot be edited");
  return exam;
}

async function sumQuestionMarks(examId: string, excludeId?: string) {
  const result = await prisma.question.aggregate({
    where: { examId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    _sum: { marks: true },
  });
  return result._sum.marks ?? 0;
}

export async function getTeacherExams(teacherId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  return prisma.exam.findMany({
    where: { createdById: id },
    include: {
      subject: { select: { id: true, name: true } },
      questions: {
        select: { id: true, questionText: true, options: true, correctOption: true, marks: true },
        orderBy: { id: "asc" },
      },
      submissions: {
        select: { id: true, score: true, submittedAt: true, student: { select: { id: true, name: true } } },
      },
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getExamAttempts(examId: string, teacherId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  return prisma.examSubmission.findMany({
    where: { examId, exam: { createdById: id } },
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
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const parsed = createExamSchema.parse(input);
  const createdById = scopedUserId(me, parsed.createdById);

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.subjectId },
    select: { teacherId: true },
  });
  if (!subject) throw new Error("Subject not found");
  if (subject.teacherId !== createdById) throw new Error("Teacher is not assigned to this subject");

  const exam = await prisma.exam.create({
    data: {
      name: parsed.name,
      subjectId: parsed.subjectId,
      totalMarks: parsed.totalMarks,
      duration: parsed.duration,
      createdById,
    },
  });
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
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const parsed = questionSchema.parse(input);
  const exam = await ownedExam(parsed.examId, me);

  const total = await sumQuestionMarks(parsed.examId);
  if (total + parsed.marks > exam.totalMarks) {
    throw new Error("Question marks exceed the exam total");
  }

  await prisma.question.create({
    data: {
      examId: parsed.examId,
      questionText: parsed.questionText,
      options: JSON.stringify(parsed.options),
      correctOption: parsed.correctOption,
      marks: parsed.marks,
    },
  });
  revalidatePath("/teacher/exams");
}

export async function updateQuestion(
  id: string,
  data: { questionText?: string; options?: string[]; correctOption?: number; marks?: number }
) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const parsed = questionUpdateSchema.parse(data);

  const current = await prisma.question.findUnique({
    where: { id },
    select: {
      examId: true,
      questionText: true,
      options: true,
      correctOption: true,
      marks: true,
      exam: { select: { isPublished: true, createdById: true, totalMarks: true } },
    },
  });
  if (!current) throw new Error("Question not found");
  if (me.role !== "ADMIN" && current.exam.createdById !== me.id) throw new Error("Forbidden");
  if (current.exam.isPublished) throw new Error("Published exams cannot be edited");

  const options = parsed.options ?? (JSON.parse(current.options) as string[]);
  const correctOption = parsed.correctOption ?? current.correctOption;
  const questionText = parsed.questionText ?? current.questionText;
  const marks = parsed.marks ?? current.marks;

  const finalQuestion = questionSchema.parse({
    examId: current.examId,
    questionText,
    options,
    correctOption,
    marks,
  });

  const otherMarks = await sumQuestionMarks(current.examId, id);
  if (otherMarks + finalQuestion.marks > current.exam.totalMarks) {
    throw new Error("Question marks exceed the exam total");
  }

  await prisma.question.update({
    where: { id },
    data: {
      ...(parsed.questionText !== undefined ? { questionText: finalQuestion.questionText } : {}),
      ...(parsed.options !== undefined ? { options: JSON.stringify(finalQuestion.options) } : {}),
      ...(parsed.correctOption !== undefined ? { correctOption: finalQuestion.correctOption } : {}),
      ...(parsed.marks !== undefined ? { marks: finalQuestion.marks } : {}),
    },
  });
  revalidatePath("/teacher/exams");
}

export async function deleteQuestion(id: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const question = await prisma.question.findUnique({
    where: { id },
    select: { exam: { select: { isPublished: true, createdById: true } } },
  });
  if (!question) throw new Error("Question not found");
  if (me.role !== "ADMIN" && question.exam.createdById !== me.id) throw new Error("Forbidden");
  if (question.exam.isPublished) throw new Error("Published exams cannot be edited");

  await prisma.question.delete({ where: { id } });
  revalidatePath("/teacher/exams");
}

export async function publishExam(id: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const exam = await ownedExam(id, me);
  const questions = await prisma.question.findMany({
    where: { examId: id },
    select: { marks: true },
  });
  if (questions.length === 0) throw new Error("Add at least one question before publishing");
  const total = questions.reduce((sum, question) => sum + question.marks, 0);
  if (total !== exam.totalMarks) {
    throw new Error(`Question marks (${total}) must equal the exam total (${exam.totalMarks})`);
  }

  await prisma.exam.update({ where: { id }, data: { isPublished: true } });
  revalidatePath("/teacher/exams");
  revalidatePath("/student/exams");
  revalidatePath("/student");
}

export async function getStudentExams(studentId: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const id = scopedUserId(me, studentId);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: id },
    select: { classId: true },
  });
  return prisma.exam.findMany({
    where: {
      isPublished: true,
      subject: { classId: { in: enrollments.map((enrollment) => enrollment.classId) } },
    },
    include: {
      subject: { select: { name: true } },
      submissions: { where: { studentId: id }, select: { id: true, score: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function submitExam(examId: string, studentId: string, answers: Record<string, number>) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const parsed = submitExamSchema.parse({ examId, studentId, answers });
  const id = scopedUserId(me, parsed.studentId);

  const exam = await prisma.exam.findUnique({
    where: { id: parsed.examId },
    select: {
      id: true,
      isPublished: true,
      totalMarks: true,
      subject: { select: { classId: true } },
    },
  });
  if (!exam || !exam.isPublished) throw new Error("Exam not available");

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId: id, classId: exam.subject.classId },
  });
  if (!enrollment) throw new Error("Forbidden");

  const questions = await prisma.question.findMany({
    where: { examId: parsed.examId },
    select: { id: true, options: true, correctOption: true, marks: true },
    orderBy: { id: "asc" },
  });
  if (questions.length === 0) throw new Error("Exam has no questions");
  const questionIds = new Set(questions.map((question) => question.id));
  for (const questionId of Object.keys(parsed.answers)) {
    if (!questionIds.has(questionId)) throw new Error("Answer contains an unknown question");
  }
  for (const question of questions) {
    const answer = parsed.answers[question.id];
    if (answer === undefined) throw new Error("Answer every question before submitting");
    const options = JSON.parse(question.options) as unknown;
    if (!Array.isArray(options) || answer >= options.length) {
      throw new Error("Answer contains an invalid option");
    }
  }

  let score = 0;
  for (const question of questions) {
    if (parsed.answers[question.id] === question.correctOption) score += question.marks;
  }
  score = Math.min(score, exam.totalMarks);

  try {
    await prisma.examSubmission.create({
      data: {
        examId: parsed.examId,
        studentId: id,
        answers: JSON.stringify(parsed.answers),
        score,
      },
    });
  } catch (error) {
    if (isUniqueError(error)) throw new Error("Already submitted");
    throw error;
  }

  revalidatePath("/student/exams");
  revalidatePath("/student/grades");
  revalidatePath("/student");
  return score;
}

function isUniqueError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
