import { z } from "zod";
export const statusSchema = z.enum(["PRESENT", "ABSENT", "LATE"]);
export const bulkMarkSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  date: z.date(),
  markedById: z.string().min(1),
  rows: z.array(z.object({ studentId: z.string().min(1), status: statusSchema })).min(1),
});
