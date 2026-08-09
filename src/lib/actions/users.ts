"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUsers(campusId?: string) {
  return prisma.user.findMany({
    where: campusId ? { campusId } : {},
    include: { campus: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { campus: true },
  })
}

export async function createUser(data: {
  email: string
  password: string
  name: string
  role: string
  campusId?: string
  phone?: string
}) {
  const user = await prisma.user.create({ data })
  revalidatePath("/admin/users")
  return user
}

export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    role?: string
    campusId?: string
    phone?: string
    isActive?: boolean
  }
) {
  const user = await prisma.user.update({ where: { id }, data })
  revalidatePath("/admin/users")
  return user
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } })
  revalidatePath("/admin/users")
}

export async function getUsersByRole(role: string, campusId?: string) {
  return prisma.user.findMany({
    where: {
      role,
      ...(campusId ? { campusId } : {}),
    },
    orderBy: { name: "asc" },
  })
}
