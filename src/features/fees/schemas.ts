import { z } from "zod";
export const amountSchema = z.number().finite().positive();
export const feeStructureSchema = z.object({
  name: z.string().trim().min(1),
  amount: amountSchema,
  classId: z.string().min(1),
  dueDate: z.date(),
});
export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: amountSchema,
  method: z.string().trim().min(1),
});
