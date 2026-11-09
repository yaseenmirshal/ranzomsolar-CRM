import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CustomerDetailView } from "@/features/customers/customer-detail";
import { requireUser } from "@/lib/auth/authorization";
import { db } from "@/prisma/db";

export const metadata: Metadata = { title: "Customer profile" };

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const customer = await db.orm.public.Customer
    .where({ id, status: "ACTIVE" })
    .include("enquiries", (items) =>
      items
        .select("id", "siNo", "status", "stage", "createdAt", "quotedAmount", "workDescription")
        .orderBy((item) => item.createdAt.desc()),
    )
    .include("followUps", (items) =>
      items
        .select("id", "title", "date", "status", "outcome")
        .orderBy((item) => item.date.desc()),
    )
    .include("surveys", (items) =>
      items
        .select("id", "surveyNumber", "scheduledAt", "status", "feasibility", "proposedCapacityKw")
        .orderBy((item) => item.scheduledAt.desc()),
    )
    .include("quotations", (items) =>
      items
        .select("id", "number", "createdAt", "status", "totalAmount", "customerPayable")
        .orderBy((item) => item.createdAt.desc()),
    )
    .include("orders", (items) =>
      items
        .select("id", "number", "orderDate", "status", "orderValue", "advanceReceived")
        .orderBy((item) => item.orderDate.desc()),
    )
    .include("installations", (items) =>
      items
        .select("id", "installationNumber", "scheduledAt", "status", "capacityKw", "progressPercent")
        .orderBy((item) => item.createdAt.desc()),
    )
    .include("invoices", (items) =>
      items
        .select("id", "number", "issueDate", "dueDate", "status", "totalAmount", "balanceDue")
        .orderBy((item) => item.issueDate.desc()),
    )
    .include("payments", (items) =>
      items
        .select("id", "referenceNumber", "paymentDate", "method", "amount", "status")
        .orderBy((item) => item.paymentDate.desc()),
    )
    .include("serviceRequests", (items) =>
      items
        .select("id", "number", "reportedAt", "status", "priority", "description")
        .orderBy((item) => item.reportedAt.desc()),
    )
    .include("documents", (items) =>
      items
        .select("id", "fileName", "contentType", "sizeBytes", "createdAt")
        .orderBy((item) => item.createdAt.desc()),
    )
    .include("activities", (items) =>
      items
        .select("id", "kind", "text", "createdAt")
        .orderBy((item) => item.createdAt.desc())
        .limit(20),
    )
    .first();

  if (!customer) notFound();
  return <CustomerDetailView customer={customer} />;
}
