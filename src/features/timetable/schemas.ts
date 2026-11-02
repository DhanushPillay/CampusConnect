import { z } from "zod";

export const daySchema = z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]);
export const timeSchema = z.string().trim().regex(/^\d{1,2}:\d{2}$/, "use HH:MM");

export const entrySchema = z
  .object({
    dayOfWeek: daySchema,
    startTime: timeSchema,
    endTime: timeSchema,
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    teacherId: z.string().min(1),
    room: z.string().trim().optional(),
  })
  .refine((value) => value.startTime < value.endTime, "end must be after start");

export type TimetableEntryInput = z.infer<typeof entrySchema>;
