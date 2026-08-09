"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAssignments(filters?: {
  subjectId?: string
  teacherId?: string
  studentId?: string
}) {
  return prisma.assignment.findMany({
    where: {
      ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters?.teacherId ? { teacherId: filters.teacherId } : {}),
    },
    include: {
      subject: { include: { class: true } },
      teacher: true,
      _count: { select: { submissions: true } },
      submissions: filters?.studentId
        ? { where: { studentId: filters.studentId }, take: 1 }
        : false,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAssignmentById(id: string) {
  return prisma.assignment.findUnique({
    where: { id },
    include: {
      subject: { include: { class: true } },
      teacher: true,
      submissions: { include: { student: true, gradedBy: true } },
    },
  })
}

export async function createAssignment(data: {
  title: string
  description?: string
  subjectId: string
  teacherId: string
  deadline: Date
  maxMarks: number
}) {
  const assignment = await prisma.assignment.create({ data })
  revalidatePath("/teacher/assignments")
  revalidatePath("/student/assignments")
  return assignment
}

export async function updateAssignment(
  id: string,
  data: { title?: string; description?: string; deadline?: Date; maxMarks?: number }
) {
  const assignment = await prisma.assignment.update({ where: { id }, data })
  revalidatePath("/teacher/assignments")
  revalidatePath("/student/assignments")
  return assignment
}

export async function deleteAssignment(id: string) {
  await prisma.assignment.delete({ where: { id } })
  revalidatePath("/teacher/assignments")
  revalidatePath("/student/assignments")
}

export async function submitAssignment(data: {
  assignmentId: string
  studentId: string
  fileUrl?: string
}) {
  const submission = await prisma.submission.create({ data })
  revalidatePath("/teacher/assignments")
  revalidatePath("/student/assignments")
  return submission
}

export async function gradeSubmission(
  id: string,
  data: {
    marksObtained: number
    feedback?: string
    gradedById: string
  }
) {
  const submission = await prisma.submission.update({
    where: { id },
    data: {
      marksObtained: data.marksObtained,
      feedback: data.feedback,
      gradedById: data.gradedById,
      gradedAt: new Date(),
    },
  })
  revalidatePath("/teacher/assignments")
  revalidatePath("/student/assignments")
  return submission
}
