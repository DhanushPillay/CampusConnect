"use server";

import prisma from "@/lib/prisma";
import { requireUser, scopedUserId } from "@/lib/auth";
import { todayStart } from "@/lib/date";
import { remainingAmount } from "@/lib/fees";

export async function getAdminStats() {
  await requireUser(["ADMIN"]);
  const [users, classes, subjects, invoices] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.feeInvoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
      select: { amount: true, payments: { select: { amount: true } } },
    }),
  ]);
  return {
    users,
    classes,
    subjects,
    pendingFees: invoices.reduce((sum, invoice) => sum + remainingAmount(invoice), 0),
  };
}

export async function getTeacherDashboard(teacherId: string) {
  const me = await requireUser(["TEACHER", "ADMIN"]);
  const id = scopedUserId(me, teacherId);
  const [subjects, assignments, pendingSubs, todayAttendance] = await Promise.all([
    prisma.subject.count({ where: { teacherId: id } }),
    prisma.assignment.count({ where: { teacherId: id } }),
    prisma.submission.count({
      where: { assignment: { teacherId: id }, marksObtained: null },
    }),
    prisma.attendance.count({
      where: { markedById: id, date: { gte: todayStart() } },
    }),
  ]);
  return { subjects, assignments, pendingSubs, todayAttendance };
}

export async function getStudentDashboard(studentId: string) {
  const me = await requireUser(["STUDENT", "ADMIN"]);
  const id = scopedUserId(me, studentId);
  const [enrollments, attGroups, grades, invoices] = await Promise.all([
    prisma.enrollment.count({ where: { studentId: id } }),
    prisma.attendance.groupBy({ by: ["status"], where: { studentId: id }, _count: true }),
    prisma.grade.findMany({
      where: { studentId: id },
      select: { marksObtained: true, totalMarks: true },
    }),
    prisma.feeInvoice.findMany({
      where: { studentId: id, status: { in: ["UNPAID", "PARTIAL"] } },
      select: { amount: true, payments: { select: { amount: true } } },
    }),
  ]);

  const total = attGroups.reduce((sum, group) => sum + group._count, 0);
  const present = attGroups
    .filter((group) => group.status !== "ABSENT")
    .reduce((sum, group) => sum + group._count, 0);
  const pct = total ? Math.round((present / total) * 100) : 0;
  const avg =
    grades.length > 0
      ? grades.reduce(
          (sum, grade) => sum + (grade.totalMarks ? grade.marksObtained / grade.totalMarks : 0),
          0
        ) / grades.length
      : 0;

  return {
    subjects: enrollments,
    attendancePct: pct,
    avgPct: Math.round(avg * 100),
    pendingFees: invoices.reduce((sum, invoice) => sum + remainingAmount(invoice), 0),
    pendingCount: invoices.length,
  };
}
