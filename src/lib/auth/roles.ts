export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SALES: "SALES",
  SURVEYOR: "SURVEYOR",
  INSTALLATION: "INSTALLATION",
  ACCOUNTS: "ACCOUNTS",
  SUPPORT: "SUPPORT",
  VIEWER: "VIEWER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
