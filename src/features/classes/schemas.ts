import { z } from "zod";
export const createClassSchema = z.object({
  name: z.string().trim().min(1),
  section: z.string().trim().min(1),
  departmentId: z.string().min(1),
});
export const createSubjectSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1).toUpperCase(),
  classId: z.string().min(1),
});
export const assignTeacherSchema = z.object({
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
});
