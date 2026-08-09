"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getExams(filters?: {
  subjectId?: string
  teacherId?: string
}) {
  return prisma.exam.findMany({
    where: {
      ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters?.teacherId ? { createdById: filters.teacherId } : {}),
    },
    include: {
      subject: { include: { class: true } },
      createdBy: true,
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getExamById(id: string) {
  return prisma.exam.findUnique({
    where: { id },
    include: {
      subject: { include: { class: true } },
      createdBy: true,
      questions: true,
      submissions: { include: { student: true } },
    },
  })
}

export async function createExam(data: {
  name: string
  type: string
  subjectId: string
  totalMarks: number
  mcqMarks?: number
  subjectiveMarks?: number
  duration: number
  startTime?: Date
  createdById: string
}) {
  const exam = await prisma.exam.create({ data })
  revalidatePath("/teacher/exams")
  return exam
}

export async function updateExam(
  id: string,
  data: {
    name?: string
    isPublished?: boolean
    startTime?: Date
  }
) {
  const exam = await prisma.exam.update({ where: { id }, data })
  revalidatePath("/teacher/exams")
  return exam
}

export async function deleteExam(id: string) {
  await prisma.exam.delete({ where: { id } })
  revalidatePath("/teacher/exams")
}

export async function addExamQuestion(data: {
  examId: string
  questionText: string
  options: string
  correctOption: number
  marks: number
}) {
  const question = await prisma.examQuestion.create({ data })
  revalidatePath("/teacher/exams")
  return question
}

export async function submitExam(data: {
  examId: string
  studentId: string
  answers?: string
  score?: number
}) {
  const submission = await prisma.examSubmission.create({ data })
  revalidatePath("/student/assignments")
  return submission
}
