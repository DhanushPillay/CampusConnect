"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getFeeStructures(campusId?: string) {
  return prisma.feeStructure.findMany({
    where: campusId ? { campusId } : {},
    include: {
      class: true,
      semester: true,
      _count: { select: { invoices: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getFeeInvoices(filters?: {
  studentId?: string
  classId?: string
  status?: string
}) {
  return prisma.feeInvoice.findMany({
    where: {
      ...(filters?.studentId ? { studentId: filters.studentId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: {
      student: true,
      feeStructure: { include: { class: true, semester: true } },
      payments: true,
    },
    orderBy: { dueDate: "asc" },
  })
}

export async function createFeeStructure(data: {
  name: string
  amount: number
  campusId: string
  classId: string
  semesterId: string
  dueDate?: Date
}) {
  const fee = await prisma.feeStructure.create({ data })
  revalidatePath("/admin/fees")
  return fee
}

export async function generateInvoices(feeStructureId: string, studentIds: string[]) {
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
  })
  if (!feeStructure) throw new Error("Fee structure not found")

  const invoices = await Promise.all(
    studentIds.map((studentId) =>
      prisma.feeInvoice.create({
        data: {
          studentId,
          feeStructureId,
          amount: feeStructure.amount,
          dueDate: feeStructure.dueDate || new Date(),
        },
      })
    )
  )
  revalidatePath("/admin/fees")
  revalidatePath("/student/fees")
  return invoices
}

export async function recordPayment(
  invoiceId: string,
  data: {
    amount: number
    paymentMethod?: string
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
  }
) {
  const payment = await prisma.feePayment.create({
    data: {
      invoiceId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
      status: "COMPLETED",
      paidAt: new Date(),
    },
  })

  const totalPaid = await prisma.feePayment.aggregate({
    where: { invoiceId },
    _sum: { amount: true },
  })

  const invoice = await prisma.feeInvoice.findUnique({ where: { id: invoiceId } })
  if (invoice && (totalPaid._sum.amount || 0) >= invoice.amount) {
    await prisma.feeInvoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    })
  } else {
    await prisma.feeInvoice.update({
      where: { id: invoiceId },
      data: { status: "PARTIAL" },
    })
  }

  revalidatePath("/admin/fees")
  revalidatePath("/student/fees")
  return payment
}

export async function getStudentFees(studentId: string) {
  return prisma.feeInvoice.findMany({
    where: { studentId },
    include: {
      feeStructure: true,
      payments: true,
    },
    orderBy: { dueDate: "asc" },
  })
}
