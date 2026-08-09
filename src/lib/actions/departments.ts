"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDepartments(campusId?: string) {
  return prisma.department.findMany({
    where: campusId ? { campusId } : {},
    include: {
      campus: true,
      _count: { select: { classes: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: { campus: true, classes: true },
  })
}

export async function createDepartment(data: {
  name: string
  campusId: string
}) {
  const dept = await prisma.department.create({ data })
  revalidatePath("/admin/departments")
  return dept
}

export async function updateDepartment(id: string, data: { name?: string }) {
  const dept = await prisma.department.update({ where: { id }, data })
  revalidatePath("/admin/departments")
  return dept
}

export async function deleteDepartment(id: string) {
  await prisma.department.delete({ where: { id } })
  revalidatePath("/admin/departments")
}
