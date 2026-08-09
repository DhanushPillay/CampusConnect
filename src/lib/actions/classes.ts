"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getClasses(campusId?: string) {
  return prisma.class.findMany({
    where: campusId ? { campusId } : {},
    include: {
      department: true,
      campus: true,
      _count: { select: { studentClasses: true, subjects: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getClassById(id: string) {
  return prisma.class.findUnique({
    where: { id },
    include: {
      department: true,
      campus: true,
      subjects: true,
      studentClasses: { include: { student: true } },
    },
  })
}

export async function createClass(data: {
  name: string
  section?: string
  departmentId: string
  campusId: string
  academicYearId?: string
}) {
  const cls = await prisma.class.create({ data })
  revalidatePath("/admin/classes")
  return cls
}

export async function updateClass(
  id: string,
  data: { name?: string; section?: string; departmentId?: string }
) {
  const cls = await prisma.class.update({ where: { id }, data })
  revalidatePath("/admin/classes")
  return cls
}

export async function deleteClass(id: string) {
  await prisma.class.delete({ where: { id } })
  revalidatePath("/admin/classes")
}

export async function enrollStudent(classId: string, studentId: string) {
  const enrollment = await prisma.studentClass.create({
    data: { classId, studentId },
  })
  revalidatePath("/admin/classes")
  return enrollment
}

export async function unenrollStudent(classId: string, studentId: string) {
  await prisma.studentClass.deleteMany({
    where: { classId, studentId },
  })
  revalidatePath("/admin/classes")
}
