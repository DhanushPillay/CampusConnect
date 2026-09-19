import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import bcrypt from "bcryptjs";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireUser(allowed?: string[]) {
  const session = await getSession();
  const user = session?.user as { id: string; role: string } | undefined;
  if (!user?.id) throw new Error("Unauthorized");
  if (allowed && !allowed.includes(user.role)) throw new Error("Forbidden");
  return user;
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}
