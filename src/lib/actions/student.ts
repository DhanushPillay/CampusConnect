"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStudentDashboard(studentId: string) {
  const [enrollments, attendance, grades, fees] = await Promise.all([
    prisma.enrollment.count({ where: { studentId } }),
    prisma.attendance.findMany({ where: { studentId }, select: { status: true }, take: 500 }),
    prisma.grade.findMany({ where: { studentId } }),
    prisma.feeInvoice.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { studentId, status: "UNPAID" },
    }),
  ]);
  const present = attendance.filter((a) => a.status !== "ABSENT").length;
  const pct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
  const avg =
    grades.length > 0
      ? grades.reduce((s, g) => s + g.marksObtained / g.totalMarks, 0) / grades.length
      : 0;
  return {
    subjects: enrollments,
    attendancePct: pct,
    avgPct: Math.round(avg * 100),
    pendingFees: fees._sum.amount ?? 0,
    pendingCount: fees._count,
  };
}

export async function getStudentAttendance(studentId: string) {
  const records = await prisma.attendance.findMany({
    where: { studentId },
    include: { subject: { select: { name: true, code: true } } },
    orderBy: { date: "desc" },
    take: 60,
  });
  const bySubject = new Map<string, { total: number; present: number; name: string }>();
  for (const r of records) {
    const k = r.subject.code;
    const cur = bySubject.get(k) ?? { total: 0, present: 0, name: r.subject.name };
    cur.total += 1;
    if (r.status !== "ABSENT") cur.present += 1;
    bySubject.set(k, cur);
  }
  const perSubject: { code: string; total: number; present: number; name: string; pct: number }[] = [];
  bySubject.forEach((v, code) => {
    perSubject.push({ code, ...v, pct: v.total ? Math.round((v.present / v.total) * 100) : 0 });
  });
  return {
    records,
    perSubject,
  };
}

export async function getStudentAssignments(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);
  const assignments = await prisma.assignment.findMany({
    where: { subject: { classId: { in: classIds } } },
    include: {
      subject: { select: { name: true, code: true } },
      submissions: {
        where: { studentId },
        select: { content: true, marksObtained: true, feedback: true },
      },
    },
    orderBy: { deadline: "asc" },
    take: 50,
  });
  return assignments;
}

export async function submitAssignment(assignmentId: string, studentId: string, content: string) {
  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    update: { content },
    create: { assignmentId, studentId, content },
  });
  revalidatePath("/student/assignments");
  revalidatePath("/student");
}

export async function getStudentGrades(studentId: string) {
  const [grades, examResults] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId },
      include: { subject: { select: { name: true, code: true } } },
    }),
    prisma.examSubmission.findMany({
      where: { studentId, exam: { isPublished: true } },
      include: {
        exam: {
          select: {
            name: true,
            totalMarks: true,
            subject: { select: { name: true, code: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);
  return { grades, examResults };
}

export async function getStudentTimetable(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  return prisma.timetable.findMany({
    where: { classId: { in: enrollments.map((e) => e.classId) } },
    include: { subject: true, teacher: { select: { name: true } }, class: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function getStudentFees(studentId: string) {
  return prisma.feeInvoice.findMany({
    where: { studentId },
    include: { feeStructure: true, payments: { orderBy: { paidAt: "desc" } } },
    orderBy: { dueDate: "asc" },
  });
}

export async function payFee(invoiceId: string, amount: number, method: string) {
  if (!invoiceId || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount");
  }
  const invoice = await prisma.feeInvoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { select: { amount: true } } },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") throw new Error("Invoice already paid");
  const paidSoFar = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = invoice.amount - paidSoFar;
  if (amount > remaining) throw new Error("Amount exceeds remaining balance");
  await prisma.feePayment.create({
    data: { invoiceId, amount, method: method || "CASH" },
  });
  const fullyPaid = paidSoFar + amount >= invoice.amount;
  await prisma.feeInvoice.update({
    where: { id: invoiceId },
    data: { status: fullyPaid ? "PAID" : "PARTIAL" },
  });
  revalidatePath("/student/fees");
  revalidatePath("/student");
  revalidatePath("/admin/fees");
}

export async function getStudentExams(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  return prisma.exam.findMany({
    where: {
      isPublished: true,
      subject: { classId: { in: enrollments.map((e) => e.classId) } },
    },
    include: { subject: { select: { name: true } }, submissions: { where: { studentId } } },
  });
}

export async function submitExam(examId: string, studentId: string, answers: number[]) {
  const questions = await prisma.question.findMany({ where: { examId } });
  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctOption) score += q.marks;
  });
  await prisma.examSubmission.upsert({
    where: { examId_studentId: { examId, studentId } },
    update: { answers: JSON.stringify(answers), score },
    create: { examId, studentId, answers: JSON.stringify(answers), score },
  });
  revalidatePath("/student/exams");
  revalidatePath("/student");
  return score;
}
