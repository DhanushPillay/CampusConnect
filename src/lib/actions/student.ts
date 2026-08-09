"use server"

import { prisma } from "@/lib/prisma"

export async function getStudentClasses(studentId: string) {
  return prisma.studentClass.findMany({
    where: { studentId },
    include: {
      class: {
        include: {
          subjects: {
            include: {
              teacher: true,
              _count: { select: { assignments: true, exams: true } },
            },
          },
          department: true,
        },
      },
    },
  })
}

export async function getStudentAssignments(studentId: string) {
  const enrollments = await prisma.studentClass.findMany({
    where: { studentId },
    include: {
      class: {
        include: {
          subjects: true,
        },
      },
    },
  })

  const subjectIds = enrollments.flatMap((e) => e.class.subjects.map((s) => s.id))

  return prisma.assignment.findMany({
    where: { subjectId: { in: subjectIds } },
    include: {
      subject: { include: { class: true } },
      teacher: true,
      submissions: { where: { studentId }, take: 1 },
    },
    orderBy: { deadline: "asc" },
  })
}

export async function getStudentExams(studentId: string) {
  const enrollments = await prisma.studentClass.findMany({
    where: { studentId },
    include: {
      class: {
        include: { subjects: true },
      },
    },
  })

  const subjectIds = enrollments.flatMap((e) => e.class.subjects.map((s) => s.id))

  return prisma.exam.findMany({
    where: { subjectId: { in: subjectIds }, isPublished: true },
    include: {
      subject: { include: { class: true } },
      createdBy: true,
      submissions: { where: { studentId }, take: 1 },
    },
    orderBy: { startTime: "asc" },
  })
}
