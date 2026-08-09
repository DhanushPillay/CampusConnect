"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCampuses() {
  return prisma.campus.findMany({
    include: {
      _count: { select: { users: true, departments: true, classes: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCampusById(id: string) {
  return prisma.campus.findUnique({
    where: { id },
    include: {
      users: true,
      departments: true,
      classes: true,
    },
  })
}

export async function createCampus(data: {
  name: string
  address?: string
  phone?: string
  email?: string
}) {
  const campus = await prisma.campus.create({ data })
  revalidatePath("/admin/campuses")
  return campus
}

export async function updateCampus(
  id: string,
  data: {
    name?: string
    address?: string
    phone?: string
    email?: string
  }
) {
  const campus = await prisma.campus.update({ where: { id }, data })
  revalidatePath("/admin/campuses")
  return campus
}

export async function deleteCampus(id: string) {
  await prisma.campus.delete({ where: { id } })
  revalidatePath("/admin/campuses")
}
