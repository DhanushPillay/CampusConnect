"use server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function getAdminStats() {
  await requireUser(["ADMIN"]);
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

export async function getTeacherDashboard(teacherId: string) {
  await requireUser(["TEACHER","ADMIN"]);
  const [subjects, assignments, pendingSubs, todayAttendance] = await Promise.all([
    prisma.subject.count({ where: { teacherId } }),
    prisma.assignment.count({ where: { teacherId } }),
    prisma.submission.count({
      where: { assignment: { teacherId }, marksObtained: null },
    }),
    prisma.attendance.count({
      where: {
        markedById: teacherId,
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);
  return { subjects, assignments, pendingSubs, todayAttendance };
}

export async function getStudentDashboard(studentId: string) {
  await requireUser(["STUDENT","ADMIN"]);
  const [enrollments, attGroups, grades, fees] = await Promise.all([
    prisma.enrollment.count({ where: { studentId } }),
    prisma.attendance.groupBy({ by: ["status"], where: { studentId }, _count: true }),
    prisma.grade.findMany({ where: { studentId }, select: { marksObtained: true, totalMarks: true } }),
    prisma.feeInvoice.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { studentId, status: "UNPAID" },
    }),
  ]);
  const total = attGroups.reduce((s, g) => s + g._count, 0);
  const present = attGroups.filter((g) => g.status !== "ABSENT").reduce((s, g) => s + g._count, 0);
  const pct = total ? Math.round((present / total) * 100) : 0;
  const avg =
    grades.length > 0
      ? grades.reduce((s, g) => s + (g.totalMarks ? g.marksObtained / g.totalMarks : 0), 0) / grades.length
      : 0;
  return {
    subjects: enrollments,
    attendancePct: pct,
    avgPct: Math.round(avg * 100),
    pendingFees: fees._sum.amount ?? 0,
    pendingCount: fees._count,
  };
}
