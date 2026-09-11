"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function letterFor(pct: number) {
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export async function getTeacherDashboard(teacherId: string) {
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

export async function getTeacherSubjects(teacherId: string) {
  return prisma.subject.findMany({
    where: { teacherId },
    include: {
      class: true,
      _count: { select: { assignments: true, exams: true } },
    },
  });
}

export async function getTeacherTimetable(teacherId: string) {
  return prisma.timetable.findMany({
    where: { teacherId },
    include: { class: true, subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function getTodayAttendance(teacherId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.attendance.findMany({
    where: { markedById: teacherId, date: { gte: start } },
    include: { student: { select: { name: true } }, subject: true },
    take: 50,
  });
}

export async function getAttendanceHistory(
  teacherId: string,
  classId?: string,
  from?: Date,
  to?: Date
) {
  const gte = from ? new Date(from) : undefined;
  if (gte) gte.setHours(0, 0, 0, 0);
  const lte = to ? new Date(to) : undefined;
  if (lte) lte.setHours(23, 59, 59, 999);
  return prisma.attendance.findMany({
    where: {
      markedById: teacherId,
      ...(classId ? { classId } : {}),
      ...(gte || lte ? { date: { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } } : {}),
    },
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
    take: 200,
  });
}

export async function bulkMarkAttendance(input: {
  classId: string;
  subjectId: string;
  date: Date;
  markedById: string;
  rows: { studentId: string; status: string }[];
}) {
  const day = new Date(input.date);
  day.setHours(0, 0, 0, 0);
  for (const r of input.rows) {
    await prisma.attendance.upsert({
      where: {
        studentId_subjectId_date: { studentId: r.studentId, subjectId: input.subjectId, date: day },
      },
      update: { status: r.status, markedById: input.markedById },
      create: {
        studentId: r.studentId,
        classId: input.classId,
        subjectId: input.subjectId,
        date: day,
        status: r.status,
        markedById: input.markedById,
      },
    });
  }
  revalidatePath("/teacher/attendance");
}

export async function getTeacherAssignments(teacherId: string) {
  return prisma.assignment.findMany({
    where: { teacherId },
    include: { subject: true, _count: { select: { submissions: true } } },
    orderBy: { deadline: "asc" },
  });
}

export async function createAssignment(input: {
  title: string;
  description: string;
  subjectId: string;
  teacherId: string;
  deadline: Date;
  maxMarks: number;
}) {
  await prisma.assignment.create({ data: input });
  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
}

export async function getPendingSubmissions(teacherId: string) {
  return prisma.submission.findMany({
    where: { assignment: { teacherId }, marksObtained: null },
    include: {
      assignment: { select: { title: true, maxMarks: true } },
      student: { select: { name: true } },
    },
    take: 25,
  });
}

export async function gradeSubmission(id: string, marks: number, feedback: string, graderId: string) {
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: { select: { subjectId: true, maxMarks: true } } },
  });
  if (!sub) throw new Error("Submission not found");
  const max = sub.assignment.maxMarks;
  const safe = Math.max(0, Math.min(Number.isFinite(marks) ? Math.round(marks) : 0, max));
  await prisma.submission.update({
    where: { id },
    data: { marksObtained: safe, feedback, gradedById: graderId },
  });
  const pct = max > 0 ? (safe / max) * 100 : 0;
  await prisma.grade.upsert({
    where: { studentId_subjectId: { studentId: sub.studentId, subjectId: sub.assignment.subjectId } },
    update: { marksObtained: safe, totalMarks: max, grade: letterFor(pct) },
    create: {
      studentId: sub.studentId,
      subjectId: sub.assignment.subjectId,
      marksObtained: safe,
      totalMarks: max,
      grade: letterFor(pct),
    },
  });
  revalidatePath("/teacher/assignments");
  revalidatePath("/student/assignments");
  revalidatePath("/student/grades");
  revalidatePath("/student");
}

export async function getTeacherExams(teacherId: string) {
  return prisma.exam.findMany({
    where: { createdById: teacherId },
    include: {
      subject: true,
      questions: true,
      submissions: { include: { student: { select: { id: true, name: true } } } },
      _count: { select: { questions: true, submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExamAttempts(examId: string, teacherId: string) {
  return prisma.examSubmission.findMany({
    where: { examId, exam: { createdById: teacherId } },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getExamQuestions(examId: string) {
  return prisma.question.findMany({ where: { examId } });
}

export async function createExam(input: {
  name: string;
  subjectId: string;
  totalMarks: number;
  duration: number;
  createdById: string;
}) {
  const exam = await prisma.exam.create({ data: input });
  revalidatePath("/teacher/exams");
  return exam.id;
}

export async function addQuestion(input: {
  examId: string;
  questionText: string;
  options: string[];
  correctOption: number;
  marks: number;
}) {
  await prisma.question.create({
    data: {
      examId: input.examId,
      questionText: input.questionText,
      options: JSON.stringify(input.options),
      correctOption: input.correctOption,
      marks: input.marks,
    },
  });
  revalidatePath("/teacher/exams");
}

export async function updateQuestion(
  id: string,
  data: { questionText?: string; options?: string[]; correctOption?: number; marks?: number }
) {
  await prisma.question.update({
    where: { id },
    data: {
      ...(data.questionText !== undefined ? { questionText: data.questionText } : {}),
      ...(data.options !== undefined ? { options: JSON.stringify(data.options) } : {}),
      ...(data.correctOption !== undefined ? { correctOption: data.correctOption } : {}),
      ...(data.marks !== undefined ? { marks: data.marks } : {}),
    },
  });
  revalidatePath("/teacher/exams");
}

export async function deleteQuestion(id: string) {
  await prisma.question.delete({ where: { id } });
  revalidatePath("/teacher/exams");
}

export async function publishExam(id: string) {
  await prisma.exam.update({ where: { id }, data: { isPublished: true } });
  revalidatePath("/teacher/exams");
  revalidatePath("/student/exams");
  revalidatePath("/student");
}

export async function getClassRoster(classId: string) {
  const [cls, enrollments, attendance, subjects] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.enrollment.findMany({
      where: { classId },
      include: { student: { select: { id: true, name: true, email: true } } },
    }),
    prisma.attendance.findMany({ where: { classId }, select: { studentId: true, status: true } }),
    prisma.subject.findMany({ where: { classId }, select: { id: true } }),
  ]);
  const grades = await prisma.grade.findMany({
    where: {
      subjectId: { in: subjects.map((s) => s.id) },
      studentId: { in: enrollments.map((e) => e.studentId) },
    },
    select: { studentId: true, marksObtained: true, totalMarks: true },
  });
  const attByStudent = new Map<string, { total: number; present: number }>();
  for (const a of attendance) {
    const cur = attByStudent.get(a.studentId) ?? { total: 0, present: 0 };
    cur.total += 1;
    if (a.status !== "ABSENT") cur.present += 1;
    attByStudent.set(a.studentId, cur);
  }
  const gradesByStudent = new Map<string, { sum: number; n: number }>();
  for (const g of grades) {
    if (!g.totalMarks) continue;
    const cur = gradesByStudent.get(g.studentId) ?? { sum: 0, n: 0 };
    cur.sum += g.marksObtained / g.totalMarks;
    cur.n += 1;
    gradesByStudent.set(g.studentId, cur);
  }
  const students = enrollments.map((e) => {
    const att = attByStudent.get(e.studentId) ?? { total: 0, present: 0 };
    const gr = gradesByStudent.get(e.studentId);
    return {
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      present: att.present,
      total: att.total,
      attendancePct: att.total ? Math.round((att.present / att.total) * 100) : 0,
      avgPct: gr && gr.n ? Math.round((gr.sum / gr.n) * 100) : 0,
      gradesCount: gr?.n ?? 0,
    };
  });
  return { class: cls, students };
}
