import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getActiveUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user?.active) return null;
  return user;
}

export async function requireUser() {
  const user = await getActiveUser();
  if (!user) throw new AuthorizationError(401, "Authentication required.");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthorizationError(403, "You are not allowed to perform this action.");
  return user;
}
