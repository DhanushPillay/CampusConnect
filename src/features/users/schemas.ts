import { z } from "zod";
export const roleSchema = z.enum(["ADMIN", "TEACHER", "STUDENT"]);
export const createUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  role: roleSchema,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
