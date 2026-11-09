import { auth } from "@/auth";
import { UserRole } from "@/lib/auth/roles";
import { db } from "@/prisma/db";

export const isDemoMode = process.env.NODE_ENV === "development" && process.env.DEMO_MODE === "true";

export async function getActiveUser() {
  if (isDemoMode) {
    return {
      id: "local-demo-user",
      name: "Demo User",
      email: "demo@ranzom.local",
      role: UserRole.SUPER_ADMIN,
    };
  }

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
