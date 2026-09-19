"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getFeeOverview() {
  await requireUser(["ADMIN"]);
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

export async function getFeeStructures() {
  await requireUser(["ADMIN"]);
  return prisma.feeStructure.findMany({
    include: { class: { select: { name: true, section: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeeInvoices() {
  await requireUser(["ADMIN"]);
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

export async function createFeeStructure(
  name: string,
  amount: number,
  classId: string,
  dueDate: string | Date
) {
  await requireUser(["ADMIN"]);
  const due = new Date(dueDate);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    select: { studentId: true },
  });
  await prisma.$transaction(async (tx) => {
    const structure = await tx.feeStructure.create({
      data: { name: name.trim(), amount, classId, dueDate: due },
    });
    if (enrollments.length > 0) {
      await tx.feeInvoice.createMany({
        data: enrollments.map((e) => ({
          studentId: e.studentId,
          feeStructureId: structure.id,
          amount,
          dueDate: due,
          status: "UNPAID",
        })),
      });
    }
  });
  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
}

export async function createFeeInvoice(
  studentId: string,
  feeStructureId: string,
  amount: number,
  dueDate: string | Date
) {
  await requireUser(["ADMIN"]);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");
  const dup = await prisma.feeInvoice.findFirst({ where: { studentId, feeStructureId } });
  if (dup) throw new Error("Invoice already exists");
  await prisma.feeInvoice.create({
    data: { studentId, feeStructureId, amount, dueDate: new Date(dueDate), status: "UNPAID" },
  });
  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
}

export async function recordFeePayment(invoiceId: string, amount: number, method: string) {
  await requireUser(["ADMIN"]);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid payment amount");
  const inv = await prisma.feeInvoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, amount: true },
  });
  if (!inv) throw new Error("Invoice not found");
  await prisma.$transaction(async (tx) => {
    const agg = await tx.feePayment.aggregate({ _sum: { amount: true }, where: { invoiceId } });
    const paid = agg._sum.amount ?? 0;
    if (paid + amount > inv.amount) throw new Error("Amount exceeds remaining balance");
    await tx.feePayment.create({ data: { invoiceId, amount, method: method || "CASH" } });
    await tx.feeInvoice.update({
      where: { id: invoiceId },
      data: { status: paid + amount >= inv.amount ? "PAID" : "PARTIAL" },
    });
  });
  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
}

export async function getStudentFees(studentId: string) {
  await requireUser(["STUDENT","ADMIN"]);
  return prisma.feeInvoice.findMany({
    where: { studentId },
    include: { feeStructure: true, payments: { orderBy: { paidAt: "desc" } } },
    orderBy: { dueDate: "asc" },
  });
}

export async function payFee(invoiceId: string, amount: number, method: string) {
  const caller = await requireUser(["STUDENT", "ADMIN"]);
  if (!invoiceId || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount");
  }
  const invoice = await prisma.feeInvoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, amount: true, status: true, studentId: true },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (caller.role !== "ADMIN" && invoice.studentId !== caller.id) throw new Error("Forbidden");
  if (invoice.status === "PAID") throw new Error("Invoice already paid");
  await prisma.$transaction(async (tx) => {
    const agg = await tx.feePayment.aggregate({ _sum: { amount: true }, where: { invoiceId } });
    const paidSoFar = agg._sum.amount ?? 0;
    if (amount > invoice.amount - paidSoFar) throw new Error("Amount exceeds remaining balance");
    await tx.feePayment.create({ data: { invoiceId, amount, method: method || "CASH" } });
    await tx.feeInvoice.update({
      where: { id: invoiceId },
      data: { status: paidSoFar + amount >= invoice.amount ? "PAID" : "PARTIAL" },
    });
  });
  revalidatePath("/student/fees");
  revalidatePath("/student");
  revalidatePath("/admin/fees");
}
