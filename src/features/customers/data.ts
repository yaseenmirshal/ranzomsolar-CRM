import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CustomerListItem } from "./types";

export const customerFinancials = {
  orders: { select: { orderValue: true } },
  invoices: { select: { balanceDue: true } },
} as const;

export type CustomerWithFinancials = Prisma.CustomerGetPayload<{
  include: typeof customerFinancials;
}>;

export function toCustomerListItem(customer: CustomerWithFinancials): CustomerListItem {
  const projectValue = customer.orders.reduce(
    (total, order) => total.plus(order.orderValue),
    new Prisma.Decimal(0),
  );
  const outstandingBalance = customer.invoices.reduce(
    (total, invoice) => total.plus(invoice.balanceDue),
    new Prisma.Decimal(0),
  );

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    district: customer.district,
    category: customer.category,
    projects: customer.orders.length,
    projectValue: projectValue.toFixed(2),
    outstandingBalance: outstandingBalance.toFixed(2),
    createdAt: customer.createdAt.toISOString(),
  };
}

export async function getActiveCustomers() {
  const customers = await prisma.customer.findMany({
    where: { status: "ACTIVE" },
    include: customerFinancials,
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });
  return customers.map(toCustomerListItem);
}
