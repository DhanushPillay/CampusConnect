import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import bcrypt from "bcryptjs";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}
