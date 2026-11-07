"use server";

import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "./schema";
import { customerFinancials, toCustomerListItem } from "./data";
import type { CustomerListItem } from "./types";

export type CustomerActionResult =
  | { success: true; customer: CustomerListItem }
  | { success: false; error: string };

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function saveCustomer(input: unknown, customerId?: string): Promise<CustomerActionResult> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Check the customer details." };

  await requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES);
  const values = parsed.data;
  const actor = await requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES);
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
    const customer = await prisma.$transaction(async (transaction) => {
      if (customerId) {
        const existing = await transaction.customer.findFirst({
          where: { id: customerId, status: "ACTIVE" },
          select: { id: true, name: true, phone: true },
        });
        if (!existing) return null;

        const updateResult = await transaction.customer.updateMany({
          where: { id: customerId, status: "ACTIVE" },
          data,
        });
        if (updateResult.count === 0) return null;

        const updated = await transaction.customer.findUnique({
          where: { id: customerId },
          include: customerFinancials,
        });
        if (!updated) return null;
        await transaction.auditLog.create({
          data: {
            userId: actor.id,
            action: "customer.updated",
            entityType: "Customer",
            entityId: customerId,
            before: { name: existing.name, phone: existing.phone },
            after: { name: updated.name, phone: updated.phone },
          },
        });
        return updated;
      }

      const created = await transaction.customer.create({ data, include: customerFinancials });
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          action: "customer.created",
          entityType: "Customer",
          entityId: created.id,
          after: { name: created.name, phone: created.phone },
        },
      });
      return created;
    });

    if (!customer) return { success: false, error: "Customer not found or already archived." };
    revalidatePath("/customers");
    revalidatePath(`/customers/${customer.id}`);
    return { success: true, customer: toCustomerListItem(customer) };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "A customer with this name and phone number already exists." };
    }
    throw error;
  }
}

export async function archiveCustomer(customerId: string): Promise<{ success: boolean; error?: string }> {
  const actor = await requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN);
  const archived = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.customer.findFirst({
      where: { id: customerId, status: "ACTIVE" },
      select: { id: true, name: true },
    });
    if (!existing) return false;

    const updateResult = await transaction.customer.updateMany({
      where: { id: customerId, status: "ACTIVE" },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });
    if (updateResult.count === 0) return false;
    await transaction.auditLog.create({
      data: {
        userId: actor.id,
        action: "customer.archived",
        entityType: "Customer",
        entityId: customerId,
        before: { name: existing.name },
      },
    });
    return true;
  });
  if (!archived) return { success: false, error: "Customer not found or already archived." };
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
