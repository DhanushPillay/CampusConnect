"use server";

import prisma from "@/lib/prisma";
import { hashPassword, requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  await requireUser(["ADMIN"]);
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { name: "asc" },
    take: 100,
  });
}

export async function toggleUserActive(id: string) {
  await requireUser(["ADMIN"]);
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return;
  await prisma.user.update({ where: { id }, data: { isActive: !u.isActive } });
  revalidatePath("/admin/users");
}

export async function createUser(name: string, email: string, password: string, role: string) {
  await requireUser(["ADMIN"]);
  if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) throw new Error("Invalid role");
  if (!password || password.length < 6) throw new Error("Password too short");
  const cleanEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) throw new Error("Email already in use");
  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: { name: name.trim(), email: cleanEmail, password: hashed, role },
  });
  revalidatePath("/admin/users");
}

export async function enrollStudent(studentId: string, classId: string) {
  await requireUser(["ADMIN"]);
  const existing = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId, classId } },
  });
  if (existing) return;
  await prisma.enrollment.create({ data: { studentId, classId } });
  revalidatePath("/admin/classes");
  revalidatePath("/student");
  revalidatePath("/student/timetable");
}

export async function unenrollStudent(studentId: string, classId: string) {
  await requireUser(["ADMIN"]);
  await prisma.enrollment.deleteMany({ where: { studentId, classId } });
  revalidatePath("/admin/classes");
  revalidatePath("/student");
  revalidatePath("/student/timetable");
}

export async function getStudentUsers() {
  await requireUser(["ADMIN"]);
  return prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}

export async function getTeacherUsers() {
  await requireUser(["ADMIN"]);
  return prisma.user.findMany({
    where: { role: "TEACHER" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}
