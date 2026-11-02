"use server";

import prisma from "@/lib/prisma";
import { requireUser, scopedUserId } from "@/lib/auth";
import { dateOnly } from "@/lib/date";
import { paidAmount, remainingAmount } from "@/lib/fees";
import { revalidatePath } from "next/cache";
import {
  createInvoiceSchema,
  feeStructureSchema,
  paymentSchema,
} from "./schemas";

export async function getFeeOverview() {
  await requireUser(["ADMIN"]);
  const [invoices, collected] = await Promise.all([
    prisma.feeInvoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
      select: { amount: true, payments: { select: { amount: true } } },
    }),
    prisma.feePayment.aggregate({ _sum: { amount: true } }),
  ]);
  return {
    pending: invoices.reduce((sum, invoice) => sum + remainingAmount(invoice), 0),
    pendingCount: invoices.length,
    collected: collected._sum.amount ?? 0,
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
    take: 500,
  });
}

export async function createFeeStructure(name: string, amount: number, classId: string, dueDate: string | Date) {
  await requireUser(["ADMIN"]);
  const parsed = feeStructureSchema.parse({ name, amount, classId, dueDate });
  const cls = await prisma.class.findUnique({ where: { id: parsed.classId }, select: { id: true } });
  if (!cls) throw new Error("Class not found");
  const due = dateOnly(parsed.dueDate);

  await prisma.$transaction(async (tx) => {
    const structure = await tx.feeStructure.create({
      data: { name: parsed.name, amount: parsed.amount, classId: parsed.classId, dueDate: due },
    });
    const enrollments = await tx.enrollment.findMany({
      where: { classId: parsed.classId },
      select: { studentId: true },
    });
    if (enrollments.length > 0) {
      await tx.feeInvoice.createMany({
        data: enrollments.map((enrollment) => ({
          studentId: enrollment.studentId,
          feeStructureId: structure.id,
          amount: parsed.amount,
          dueDate: due,
          status: "UNPAID",
        })),
      });
    }
  });

  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
  revalidatePath("/student");
}

export async function createFeeInvoice(
  studentId: string,
  feeStructureId: string,
  amount: number,
  dueDate: string | Date
) {
  await requireUser(["ADMIN"]);
  const parsed = createInvoiceSchema.parse({ studentId, feeStructureId, amount, dueDate });

  const [student, structure] = await Promise.all([
    prisma.user.findUnique({ where: { id: parsed.studentId }, select: { role: true } }),
    prisma.feeStructure.findUnique({
      where: { id: parsed.feeStructureId },
      select: { classId: true },
    }),
  ]);
  if (student?.role !== "STUDENT") throw new Error("Student not found");
  if (!structure) throw new Error("Fee structure not found");

  const enrolled = await prisma.enrollment.findFirst({
    where: { studentId: parsed.studentId, classId: structure.classId },
    select: { id: true },
  });
  if (!enrolled) throw new Error("Student is not enrolled in this fee structure's class");

  // The unique index enforces this too; the pre-check keeps the common case
  // sane if the integrity migration has not been applied yet.
  const existing = await prisma.feeInvoice.findUnique({
    where: {
      studentId_feeStructureId: {
        studentId: parsed.studentId,
        feeStructureId: parsed.feeStructureId,
      },
    },
    select: { id: true },
  });
  if (existing) throw new Error("Invoice already exists");

  try {
    await prisma.feeInvoice.create({
      data: {
        studentId: parsed.studentId,
        feeStructureId: parsed.feeStructureId,
        amount: parsed.amount,
        dueDate: dateOnly(parsed.dueDate),
        status: "UNPAID",
      },
    });
  } catch (error) {
    if (isUniqueError(error)) throw new Error("Invoice already exists");
    throw error;
  }

  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
  revalidatePath("/student");
}

export async function recordFeePayment(invoiceId: string, amount: number, method: string) {
  await requireUser(["ADMIN"]);
  const payment = paymentSchema.parse({ invoiceId, amount, method });

  await prisma.$transaction(
    async (tx) => {
      const invoice = await tx.feeInvoice.findUnique({
        where: { id: payment.invoiceId },
        select: {
          amount: true,
          status: true,
          payments: { select: { amount: true } },
        },
      });
      if (!invoice) throw new Error("Invoice not found");
      if (invoice.status === "PAID") throw new Error("Invoice already paid");

      const paid = paidAmount(invoice);
      if (payment.amount > invoice.amount - paid) throw new Error("Amount exceeds remaining balance");

      await tx.feePayment.create({
        data: { invoiceId: payment.invoiceId, amount: payment.amount, method: payment.method },
      });
      await tx.feeInvoice.update({
        where: { id: payment.invoiceId },
        data: { status: paid + payment.amount >= invoice.amount ? "PAID" : "PARTIAL" },
      });
    },
    { isolationLevel: "Serializable" }
  );

  revalidatePath("/admin/fees");
  revalidatePath("/student/fees");
  revalidatePath("/student");
}

export async function getStudentFees(studentId: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const id = scopedUserId(me, studentId);
  return prisma.feeInvoice.findMany({
    where: { studentId: id },
    include: { feeStructure: true, payments: { orderBy: { paidAt: "desc" } } },
    orderBy: { dueDate: "asc" },
  });
}

export async function payFee(invoiceId: string, amount: number, method: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const payment = paymentSchema.parse({ invoiceId, amount, method });

  await prisma.$transaction(
    async (tx) => {
      const invoice = await tx.feeInvoice.findUnique({
        where: { id: payment.invoiceId },
        select: {
          amount: true,
          status: true,
          studentId: true,
          payments: { select: { amount: true } },
        },
      });
      if (!invoice) throw new Error("Invoice not found");
      if (me.role !== "ADMIN" && invoice.studentId !== me.id) throw new Error("Forbidden");
      if (invoice.status === "PAID") throw new Error("Invoice already paid");

      const paid = paidAmount(invoice);
      if (payment.amount > invoice.amount - paid) throw new Error("Amount exceeds remaining balance");

      await tx.feePayment.create({
        data: { invoiceId: payment.invoiceId, amount: payment.amount, method: payment.method },
      });
      await tx.feeInvoice.update({
        where: { id: payment.invoiceId },
        data: { status: paid + payment.amount >= invoice.amount ? "PAID" : "PARTIAL" },
      });
    },
    { isolationLevel: "Serializable" }
  );

  revalidatePath("/student/fees");
  revalidatePath("/student");
  revalidatePath("/admin/fees");
}

function isUniqueError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
