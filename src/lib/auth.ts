import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export type SessionUser = { id: string; role: string };

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireUser(allowed?: string[]): Promise<SessionUser> {
  const session = await getSession();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) throw new Error("Unauthorized");

  // Re-check on every action so deactivation and role changes take effect
  // without waiting for the JWT to expire.
  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isActive: true, role: true },
  });
  if (!current?.isActive) throw new Error("Unauthorized");
  if (allowed && !allowed.includes(current.role)) throw new Error("Forbidden");
  return { id: user.id, role: current.role };
}

/**
 * Returns the user id an action is allowed to read or write.
 * Admins may act on any id; everyone else is pinned to their own session.
 */
export function scopedUserId(me: SessionUser, requestedId?: string): string {
  if (me.role === "ADMIN") return requestedId || me.id;
  if (!requestedId || requestedId !== me.id) throw new Error("Forbidden");
  return me.id;
}

export async function hashPassword(plain: string) {
  return await bcrypt.hash(plain, 10);
}
