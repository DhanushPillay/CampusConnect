import { z } from "zod";
export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string(),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  deadline: z.date(),
  maxMarks: z.number().int().min(1),
});
export const gradeSchema = z.object({
  id: z.string().min(1),
  marks: z.number().min(0),
  feedback: z.string(),
  graderId: z.string().min(1),
});
