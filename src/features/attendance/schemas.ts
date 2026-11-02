import { z } from "zod";

export const statusSchema = z.enum(["PRESENT", "ABSENT", "LATE"]);

const dateInput = z.union([z.date(), z.string().min(1)]);

export const bulkMarkSchema = z
  .object({
    classId: z.string().min(1),
    subjectId: z.string().min(1),
    date: dateInput,
    markedById: z.string().min(1),
    rows: z
      .array(
        z.object({
          studentId: z.string().min(1),
          status: statusSchema,
        })
      )
      .min(1),
  })
  .refine(
    (value) => new Set(value.rows.map((row) => row.studentId)).size === value.rows.length,
    "duplicate student in attendance rows"
  );
