"use server";

import prisma from "@/lib/prisma";
import { hashPassword, requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createUserSchema } from "./schemas";

export async function getUsers() {
  await requireUser(["ADMIN"]);
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { name: "asc" },
    take: 500,
  });
}

export async function toggleUserActive(id: string) {
  const me = await requireUser(["ADMIN"]);
  if (id === me.id) throw new Error("You cannot deactivate your own account");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;

  if (user.role === "ADMIN" && user.isActive) {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (activeAdmins <= 1) throw new Error("At least one active admin is required");
  }

  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  revalidatePath("/admin/users");
}

export async function createUser(name: string, email: string, password: string, role: string) {
  await requireUser(["ADMIN"]);
  const input = createUserSchema.parse({ name, email, password, role });

  try {
    const hashed = await hashPassword(input.password);
    await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashed, role: input.role },
    });
  } catch (error) {
    if (isUniqueError(error)) throw new Error("Email already in use");
    throw error;
  }
  revalidatePath("/admin/users");
}

export async function enrollStudent(studentId: string, classId: string) {
  await requireUser(["ADMIN"]);
  const [student, cls] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId }, select: { role: true, isActive: true } }),
    prisma.class.findUnique({ where: { id: classId }, select: { id: true } }),
  ]);
  if (student?.role !== "STUDENT" || !student.isActive) throw new Error("Student not found");
  if (!cls) throw new Error("Class not found");

  try {
    await prisma.enrollment.create({ data: { studentId, classId } });
  } catch (error) {
    if (!isUniqueError(error)) throw error;
  }

  revalidatePath("/admin/classes");
  revalidatePath("/student");
  revalidatePath("/student/timetable");
  revalidatePath("/student/attendance");
  revalidatePath("/student/assignments");
  revalidatePath("/student/exams");
  revalidatePath("/student/fees");
}

export async function unenrollStudent(studentId: string, classId: string) {
  await requireUser(["ADMIN"]);
  await prisma.enrollment.deleteMany({ where: { studentId, classId } });
  revalidatePath("/admin/classes");
  revalidatePath("/student");
  revalidatePath("/student/timetable");
  revalidatePath("/student/attendance");
  revalidatePath("/student/assignments");
  revalidatePath("/student/exams");
  revalidatePath("/student/fees");
}

export async function getStudentUsers() {
  await requireUser(["ADMIN"]);
  return prisma.user.findMany({
    where: { role: "STUDENT", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 500,
  });
}

export async function getTeacherUsers() {
  await requireUser(["ADMIN"]);
  return prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}

function isUniqueError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
