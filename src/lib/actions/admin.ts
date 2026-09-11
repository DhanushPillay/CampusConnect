"use server";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  const [users, classes, subjects, pendingFees] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.feeInvoice.aggregate({
      _sum: { amount: true },
      where: { status: "UNPAID" },
    }),
  ]);
  return {
    users,
    classes,
    subjects,
    pendingFees: pendingFees._sum.amount ?? 0,
  };
}

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { name: "asc" },
    take: 100,
  });
}

export async function toggleUserActive(id: string) {
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return;
  await prisma.user.update({ where: { id }, data: { isActive: !u.isActive } });
  revalidatePath("/admin/users");
}

export async function getClasses() {
  return prisma.class.findMany({
    include: { department: true, _count: { select: { enrollments: true, subjects: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createClass(name: string, section: string, departmentId: string) {
  await prisma.class.create({ data: { name, section, departmentId } });
  revalidatePath("/admin/classes");
}

export async function getSubjects() {
  return prisma.subject.findMany({
    include: { class: true, teacher: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getTimetable() {
  return prisma.timetable.findMany({
    include: { class: true, subject: true, teacher: { select: { name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    take: 100,
  });
}

export async function getFeeOverview() {
  const [invoices, paid] = await Promise.all([
    prisma.feeInvoice.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "UNPAID" },
    }),
    prisma.feePayment.aggregate({ _sum: { amount: true } }),
  ]);
  return {
    pending: invoices._sum.amount ?? 0,
    pendingCount: invoices._count,
    collected: paid._sum.amount ?? 0,
  };
}

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function getStudentUsers() {
  return prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}

export async function getTeacherUsers() {
  return prisma.user.findMany({
    where: { role: "TEACHER" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}

export async function getClassesWithStudents() {
  return prisma.class.findMany({
    include: {
      department: true,
      _count: { select: { enrollments: true, subjects: true } },
      enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getFeeStructures() {
  return prisma.feeStructure.findMany({
    include: { class: { select: { name: true, section: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeeInvoices() {
  return prisma.feeInvoice.findMany({
    include: {
      student: { select: { name: true, email: true } },
      feeStructure: { select: { name: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function createUser(name: string, email: string, password: string, role: string) {
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
  await prisma.enrollment.deleteMany({ where: { studentId, classId } });
  revalidatePath("/admin/classes");
  revalidatePath("/student");
  revalidatePath("/student/timetable");
}

export async function createSubject(name: string, code: string, classId: string) {
  const cleanCode = code.trim().toUpperCase();
  const existing = await prisma.subject.findUnique({ where: { code: cleanCode } });
  if (existing) throw new Error("Subject code already exists");
  await prisma.subject.create({ data: { name: name.trim(), code: cleanCode, classId } });
  revalidatePath("/admin/subjects");
  revalidatePath("/teacher/subjects");
}

export async function assignTeacher(subjectId: string, teacherId: string) {
  await prisma.subject.update({ where: { id: subjectId }, data: { teacherId } });
  revalidatePath("/admin/subjects");
  revalidatePath("/teacher/subjects");
  revalidatePath("/teacher/timetable");
}

export async function createTimetableEntry(
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  classId: string,
  subjectId: string,
  teacherId: string,
  room?: string
) {
  await prisma.timetable.create({
    data: {
      dayOfWeek,
      startTime,
      endTime,
      classId,
      subjectId,
      teacherId,
      room: room?.trim() || null,
    },
  });
  revalidatePath("/admin/timetable");
  revalidatePath("/teacher/timetable");
  revalidatePath("/student/timetable");
}

export async function deleteTimetableEntry(id: string) {
  await prisma.timetable.delete({ where: { id } });
  revalidatePath("/admin/timetable");
  revalidatePath("/teacher/timetable");
  revalidatePath("/student/timetable");
}

export async function createFeeStructure(
  name: string,
  amount: number,
  classId: string,
  dueDate: string | Date
) {
  const due = new Date(dueDate);
  const structure = await prisma.feeStructure.create({
    data: { name: name.trim(), amount, classId, dueDate: due },
  });
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    select: { studentId: true },
  });
  if (enrollments.length > 0) {
    await prisma.feeInvoice.createMany({
      data: enrollments.map((e) => ({
        studentId: e.studentId,
        feeStructureId: structure.id,
        amount,
        dueDate: due,
        status: "UNPAID",
      })),
    });
  }
  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
}

export async function createFeeInvoice(
  studentId: string,
  feeStructureId: string,
  amount: number,
  dueDate: string | Date
) {
  await prisma.feeInvoice.create({
    data: { studentId, feeStructureId, amount, dueDate: new Date(dueDate), status: "UNPAID" },
  });
  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
}

export async function recordFeePayment(invoiceId: string, amount: number, method: string) {
  await prisma.feePayment.create({ data: { invoiceId, amount, method } });
  const [invoice, agg] = await Promise.all([
    prisma.feeInvoice.findUnique({ where: { id: invoiceId } }),
    prisma.feePayment.aggregate({ _sum: { amount: true }, where: { invoiceId } }),
  ]);
  if (invoice && (agg._sum.amount ?? 0) >= invoice.amount) {
    await prisma.feeInvoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });
  }
  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
}
