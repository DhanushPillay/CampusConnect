import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().trim().min(1),
  subjectId: z.string().min(1),
  totalMarks: z.number().int().min(1),
  duration: z.number().int().min(1),
  createdById: z.string().min(1),
});

export const questionSchema = z
  .object({
    examId: z.string().min(1),
    questionText: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).min(2),
    correctOption: z.number().int().min(0),
    marks: z.number().int().min(1),
  })
  .refine((value) => value.correctOption < value.options.length, "correct option out of range");

export const questionUpdateSchema = z.object({
  questionText: z.string().trim().min(1).optional(),
  options: z.array(z.string().trim().min(1)).min(2).optional(),
  correctOption: z.number().int().min(0).optional(),
  marks: z.number().int().min(1).optional(),
});

export const answersSchema = z.record(z.string().min(1), z.number().int().min(0));

export const submitExamSchema = z.object({
  examId: z.string().min(1),
  studentId: z.string().min(1),
  answers: answersSchema,
});
