"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTimetableEntries(filters?: {
  classId?: string
  teacherId?: string
  dayOfWeek?: string
}) {
  return prisma.timetable.findMany({
    where: {
      ...(filters?.classId ? { classId: filters.classId } : {}),
      ...(filters?.teacherId ? { teacherId: filters.teacherId } : {}),
      ...(filters?.dayOfWeek ? { dayOfWeek: filters.dayOfWeek } : {}),
    },
    include: {
      class: true,
      subject: true,
      teacher: true,
      classroom: true,
    },
    orderBy: { startTime: "asc" },
  })
}

export async function createTimetableEntry(data: {
  classId: string
  subjectId: string
  teacherId: string
  dayOfWeek: string
  startTime: Date
  endTime: Date
  classroomId?: string
  campusId: string
}) {
  const entry = await prisma.timetable.create({ data })
  revalidatePath("/admin/timetable")
  revalidatePath("/teacher/timetable")
  revalidatePath("/student/timetable")
  return entry
}

export async function deleteTimetableEntry(id: string) {
  await prisma.timetable.delete({ where: { id } })
  revalidatePath("/admin/timetable")
  revalidatePath("/teacher/timetable")
  revalidatePath("/student/timetable")
}

export async function getWeeklySchedule(classId: string) {
  const entries = await prisma.timetable.findMany({
    where: { classId },
    include: {
      subject: true,
      teacher: true,
      classroom: true,
    },
    orderBy: { startTime: "asc" },
  })

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  const schedule: Record<string, typeof entries> = {}
  for (const day of days) {
    schedule[day] = entries.filter((e) => e.dayOfWeek === day)
  }
  return schedule
}
