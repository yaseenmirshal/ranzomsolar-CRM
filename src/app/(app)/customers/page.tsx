import type { Metadata } from "next";
import { CustomersView } from "@/features/customers/customers-view";
import { getActiveCustomers } from "@/features/customers/data";
import { requireUser } from "@/lib/auth/authorization";
import { UserRole, type UserRole as UserRoleType } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const user = await requireUser();
  const customers = await getActiveCustomers();
  const canManage = new Set<UserRoleType>([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES]).has(user.role);
  const canArchive = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;

  return <CustomersView initialCustomers={customers} canManage={canManage} canArchive={canArchive} />;
}
