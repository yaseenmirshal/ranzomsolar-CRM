"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
import { UserRole } from "@/lib/auth/roles";
import { db } from "@/prisma/db";
import { customerSchema } from "./schema";
import { toCustomerListItem } from "./data";
import type { CustomerListItem } from "./types";

export type CustomerActionResult =
  | { success: true; customer: CustomerListItem }
  | { success: false; error: string };

function hasSqlState(error: unknown, sqlState: string): boolean {
  let current = error;
  for (let depth = 0; depth < 8 && current instanceof Error; depth += 1) {
    if ("sqlState" in current && current.sqlState === sqlState) return true;
    current = current.cause;
  }
  return false;
}

export async function saveCustomer(input: unknown, customerId?: string): Promise<CustomerActionResult> {
  const actor = await requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES);
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Check the customer details." };

  const values = parsed.data;
  const phoneNormalized = values.phone.replace(/\D/g, "").slice(-10);
  const nameNormalized = values.name.toLocaleLowerCase("en").replace(/\s+/g, " ").trim();
  const data = {
    name: values.name,
    nameNormalized,
    phone: values.phone.trim(),
    phoneNormalized,
    email: values.email || null,
    address: values.address || null,
    district: values.district || null,
    category: values.category,
  };

  try {
    const customer = await db.transaction(async (transaction) => {
      if (customerId) {
        const existing = await transaction.orm.public.Customer
          .where({ id: customerId, status: "ACTIVE" })
          .select("id", "name", "phone")
          .first();
        if (!existing) return null;

        const updates = await transaction.orm.public.Customer
          .where({ id: customerId, status: "ACTIVE" })
          .update(data);
        if (!updates) return null;

        const updated = await transaction.orm.public.Customer
          .where({ id: customerId })
          .include("orders", (orders) =>
            orders.combine({
              projectCount: orders.count(),
              projectValue: orders.sum("orderValue"),
            }),
          )
          .include("invoices", (invoices) =>
            invoices.combine({ outstandingBalance: invoices.sum("balanceDue") }),
          )
          .first();
        if (!updated) return null;
        await transaction.orm.public.AuditLog.create({
          id: randomUUID(),
          userId: actor.id,
          action: "customer.updated",
          entityType: "Customer",
          entityId: customerId,
          before: { name: existing.name, phone: existing.phone },
          after: { name: updated.name, phone: updated.phone },
        });
        return updated;
      }

      const created = await transaction.orm.public.Customer
        .include("orders", (orders) =>
          orders.combine({
            projectCount: orders.count(),
            projectValue: orders.sum("orderValue"),
          }),
        )
        .include("invoices", (invoices) =>
          invoices.combine({ outstandingBalance: invoices.sum("balanceDue") }),
        )
        .create({ id: randomUUID(), ...data });
      await transaction.orm.public.AuditLog.create({
        id: randomUUID(),
        userId: actor.id,
        action: "customer.created",
        entityType: "Customer",
        entityId: created.id,
        after: { name: created.name, phone: created.phone },
      });
      return created;
    });

    if (!customer) return { success: false, error: "Customer not found or already archived." };
    revalidatePath("/customers");
    revalidatePath(`/customers/${customer.id}`);
    return { success: true, customer: toCustomerListItem(customer) };
  } catch (error) {
    if (hasSqlState(error, "23505")) {
      return { success: false, error: "A customer with this name and phone number already exists." };
    }
    throw error;
  }
}

export async function archiveCustomer(customerId: string): Promise<{ success: boolean; error?: string }> {
  const actor = await requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN);
  const archived = await db.transaction(async (transaction) => {
    const existing = await transaction.orm.public.Customer
      .where({ id: customerId, status: "ACTIVE" })
      .select("id", "name")
      .first();
    if (!existing) return false;

    const updates = await transaction.orm.public.Customer
      .where({ id: customerId, status: "ACTIVE" })
      .update({ status: "ARCHIVED", archivedAt: new Date() });
    if (!updates) return false;
    await transaction.orm.public.AuditLog.create({
      id: randomUUID(),
      userId: actor.id,
      action: "customer.archived",
      entityType: "Customer",
      entityId: customerId,
      before: { name: existing.name },
    });
    return true;
  });
  if (!archived) return { success: false, error: "Customer not found or already archived." };
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
