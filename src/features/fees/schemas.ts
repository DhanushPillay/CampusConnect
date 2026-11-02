import { z } from "zod";

export const amountSchema = z.number().finite().positive();
const dateInput = z.union([z.date(), z.string().min(1)]);

export const feeStructureSchema = z.object({
  name: z.string().trim().min(1),
  amount: amountSchema,
  classId: z.string().min(1),
  dueDate: dateInput,
});

export const paymentMethodSchema = z.enum(["CASH", "UPI", "CARD", "NETBANKING"]);

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: amountSchema,
  method: paymentMethodSchema.default("CASH"),
});

export const createInvoiceSchema = z.object({
  studentId: z.string().min(1),
  feeStructureId: z.string().min(1),
  amount: amountSchema,
  dueDate: dateInput,
});
