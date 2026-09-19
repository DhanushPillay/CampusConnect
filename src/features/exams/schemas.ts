import { z } from "zod";
export const createExamSchema = z.object({
  name: z.string().trim().min(1),
  subjectId: z.string().min(1),
  totalMarks: z.number().int().min(1),
  duration: z.number().int().min(1),
  createdById: z.string().min(1),
});
export const questionSchema = z.object({
  examId: z.string().min(1),
  questionText: z.string().trim().min(1),
  options: z.array(z.string()).min(2),
  correctOption: z.number().int().min(0),
  marks: z.number().int().min(1),
});
