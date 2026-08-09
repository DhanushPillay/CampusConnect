"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSubjects(classId?: string) {
  return prisma.subject.findMany({
    where: classId ? { classId } : {},
    include: {
      class: true,
      teacher: true,
      _count: { select: { assignments: true, exams: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSubjectById(id: string) {
  return prisma.subject.findUnique({
    where: { id },
    include: { class: true, teacher: true, assignments: true, exams: true },
  })
}

export async function createSubject(data: {
  name: string
  code: string
  classId: string
  teacherId?: string
}) {
  const subject = await prisma.subject.create({ data })
  revalidatePath("/admin/subjects")
  return subject
}

export async function updateSubject(
  id: string,
  data: { name?: string; code?: string; teacherId?: string }
) {
  const subject = await prisma.subject.update({ where: { id }, data })
  revalidatePath("/admin/subjects")
  return subject
}

export async function deleteSubject(id: string) {
  await prisma.subject.delete({ where: { id } })
  revalidatePath("/admin/subjects")
}

export async function getSubjectsByTeacher(teacherId: string) {
  return prisma.subject.findMany({
    where: { teacherId },
    include: {
      class: true,
      _count: { select: { assignments: true, exams: true } },
    },
  })
}
