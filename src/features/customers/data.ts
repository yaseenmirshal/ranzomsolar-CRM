import { db } from "@/prisma/db";
import type { CustomerListItem } from "./types";

type CustomerWithFinancials = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  district: string | null;
  category: CustomerListItem["category"];
  createdAt: Date;
  orders: { projectCount: number; projectValue: string | null };
  invoices: { outstandingBalance: string | null };
};

export function toCustomerListItem(customer: CustomerWithFinancials): CustomerListItem {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    district: customer.district,
    category: customer.category,
    projects: customer.orders.projectCount,
    projectValue: customer.orders.projectValue ?? "0.00",
    outstandingBalance: customer.invoices.outstandingBalance ?? "0.00",
    createdAt: customer.createdAt.toISOString(),
  };
}

export async function getActiveCustomers() {
  const customers = await db.orm.public.Customer
    .include("orders", (orders) =>
      orders.combine({
        projectCount: orders.count(),
        projectValue: orders.sum("orderValue"),
      }),
    )
    .include("invoices", (invoices) =>
      invoices.combine({ outstandingBalance: invoices.sum("balanceDue") }),
    )
    .where({ status: "ACTIVE" })
    .orderBy([(customer) => customer.createdAt.desc(), (customer) => customer.name.asc()])
    .all();

  return customers.map(toCustomerListItem);
}
