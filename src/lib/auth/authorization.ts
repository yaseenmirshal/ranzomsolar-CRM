import { auth } from "@/auth";
import { UserRole } from "@/lib/auth/roles";
import { db } from "@/prisma/db";

export async function getActiveUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return db.orm.public.User
    .where({ id: userId, active: true })
    .select("id", "name", "email", "role")
    .first();
}

export async function requireUser() {
  const user = await getActiveUser();
  if (!user) throw new Error("Authentication required.");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("You do not have permission to perform this action.");
  return user;
}
