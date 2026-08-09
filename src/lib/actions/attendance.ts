"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAttendanceRecords(filters: {
  subjectId?: string
  classId?: string
  studentId?: string
  teacherId?: string
  date?: Date
  startDate?: Date
  endDate?: Date
}) {
  // If teacherId is provided, first get their subjects
  let subjectFilter: Record<string, any> = filters.subjectId ? { subjectId: filters.subjectId } : {}
  if (filters.teacherId && !filters.subjectId) {
    const teacherSubjects = await prisma.subject.findMany({
      where: { teacherId: filters.teacherId },
      select: { id: true },
    })
    subjectFilter = { subjectId: { in: teacherSubjects.map((s) => s.id) } }
  }

  return prisma.attendance.findMany({
    where: {
      ...subjectFilter,
      ...(filters.classId ? { classId: filters.classId } : {}),
      ...(filters.studentId ? { studentId: filters.studentId } : {}),
      ...(filters.date
        ? {
            date: {
              gte: new Date(filters.date.setHours(0, 0, 0, 0)),
              lt: new Date(filters.date.setHours(23, 59, 59, 999)),
            },
          }
        : {}),
      ...(filters.startDate && filters.endDate
        ? {
            date: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }
        : {}),
    },
    include: {
      student: true,
      subject: true,
      class: true,
      markedBy: true,
    },
    orderBy: { date: "desc" },
  })
}

export async function markAttendance(data: {
  studentId: string
  classId: string
  subjectId: string
  date: Date
  status: string
  markedById?: string
}) {
  const existing = await prisma.attendance.findFirst({
    where: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      date: {
        gte: new Date(data.date.setHours(0, 0, 0, 0)),
        lt: new Date(data.date.setHours(23, 59, 59, 999)),
      },
    },
  })

  if (existing) {
    const updated = await prisma.attendance.update({
      where: { id: existing.id },
      data: { status: data.status, markedById: data.markedById },
    })
    revalidatePath("/teacher/attendance")
    revalidatePath("/student/attendance")
    return updated
  }

  const record = await prisma.attendance.create({ data })
  revalidatePath("/teacher/attendance")
  revalidatePath("/student/attendance")
  return record
}

export async function bulkMarkAttendance(
  records: Array<{
    studentId: string
    classId: string
    subjectId: string
    date: Date
    status: string
    markedById?: string
  }>
) {
  for (const record of records) {
    await markAttendance(record)
  }
}

export async function getStudentAttendanceSummary(studentId: string) {
  const records = await prisma.attendance.groupBy({
    by: ["subjectId"],
    where: { studentId },
    _count: { status: true },
  })

  const summary = await Promise.all(
    records.map(async (r) => {
      const subject = await prisma.subject.findUnique({
        where: { id: r.subjectId },
      })
      const total = await prisma.attendance.count({
        where: { studentId, subjectId: r.subjectId },
      })
      const present = await prisma.attendance.count({
        where: { studentId, subjectId: r.subjectId, status: "PRESENT" },
      })
      return {
        subjectId: r.subjectId,
        subjectName: subject?.name || "Unknown",
        total,
        present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      }
    })
  )

  return summary
}
