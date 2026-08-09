"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getGrades(filters?: {
  studentId?: string
  subjectId?: string
  semesterId?: string
}) {
  return prisma.grade.findMany({
    where: {
      ...(filters?.studentId ? { studentId: filters.studentId } : {}),
      ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters?.semesterId ? { semesterId: filters.semesterId } : {}),
    },
    include: {
      student: true,
      subject: { include: { class: true } },
      semester: { include: { academicYear: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getStudentGradeSummary(studentId: string) {
  const grades = await prisma.grade.findMany({
    where: { studentId },
    include: {
      subject: true,
      semester: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const semesterMap = new Map<
    string,
    { name: string; grades: typeof grades; cgpa: number | null }
  >()

  for (const grade of grades) {
    const key = grade.semesterId
    if (!semesterMap.has(key)) {
      semesterMap.set(key, {
        name: grade.semester.name,
        grades: [],
        cgpa: grade.cgpa,
      })
    }
    semesterMap.get(key)!.grades.push(grade)
  }

  return Array.from(semesterMap.values())
}

export async function upsertGrade(data: {
  studentId: string
  subjectId: string
  semesterId: string
  marksObtained?: number
  totalMarks?: number
  grade?: string
  cgpa?: number
}) {
  const existing = await prisma.grade.findFirst({
    where: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      semesterId: data.semesterId,
    },
  })

  if (existing) {
    const updated = await prisma.grade.update({
      where: { id: existing.id },
      data,
    })
    revalidatePath("/admin/grades")
    revalidatePath("/student/grades")
    return updated
  }

  const grade = await prisma.grade.create({ data })
  revalidatePath("/admin/grades")
  revalidatePath("/student/grades")
  return grade
}

export async function deleteGrade(id: string) {
  await prisma.grade.delete({ where: { id } })
  revalidatePath("/admin/grades")
  revalidatePath("/student/grades")
}
