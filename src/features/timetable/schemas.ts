import { z } from "zod";
export const daySchema = z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]);
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, "use HH:MM");
export const entrySchema = z.object({
  dayOfWeek: daySchema,
  startTime: hhmm,
  endTime: hhmm,
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
}).refine((v) => v.startTime < v.endTime, "end must be after start");
export type TimetableEntryInput = z.infer<typeof entrySchema>;
