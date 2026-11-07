import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
  throw new Error("Set DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME before running this script.");
}
if (ADMIN_PASSWORD.length < 12) {
  throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
}

const prisma = new PrismaClient();
try {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await hash(ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email },
    create: { name: ADMIN_NAME.trim(), email, passwordHash, role: UserRole.SUPER_ADMIN },
    update: { name: ADMIN_NAME.trim(), passwordHash, role: UserRole.SUPER_ADMIN, active: true },
  });
  console.log(`Administrator account ready for ${email}.`);
} finally {
  await prisma.$disconnect();
}
