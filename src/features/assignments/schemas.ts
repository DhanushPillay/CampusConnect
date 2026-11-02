import { z } from "zod";

const dateInput = z.union([z.date(), z.string().min(1)]);

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().max(5000).default(""),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  deadline: dateInput,
  maxMarks: z.number().int().min(1),
});

export const gradeSchema = z.object({
  id: z.string().min(1),
  marks: z.number().finite().min(0),
  feedback: z.string().max(2000).default(""),
  graderId: z.string().min(1),
});

export const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  studentId: z.string().min(1),
  content: z.string().trim().min(1).max(10000),
});
