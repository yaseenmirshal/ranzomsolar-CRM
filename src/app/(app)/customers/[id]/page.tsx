import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CustomerDetailView } from "@/features/customers/customer-detail";
import { requireUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Customer profile" };

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, status: "ACTIVE" },
    include: {
      enquiries: {
        orderBy: { createdAt: "desc" },
        select: { id: true, siNo: true, status: true, stage: true, createdAt: true, quotedAmount: true, workDescription: true },
      },
      followUps: {
        orderBy: { date: "desc" },
        select: { id: true, title: true, date: true, status: true, outcome: true },
      },
      surveys: {
        orderBy: { scheduledAt: "desc" },
        select: { id: true, surveyNumber: true, scheduledAt: true, status: true, feasibility: true, proposedCapacityKw: true },
      },
      quotations: {
        orderBy: { createdAt: "desc" },
        select: { id: true, number: true, createdAt: true, status: true, totalAmount: true, customerPayable: true },
      },
      orders: {
        orderBy: { orderDate: "desc" },
        select: { id: true, number: true, orderDate: true, status: true, orderValue: true, advanceReceived: true },
      },
      installations: {
        orderBy: { createdAt: "desc" },
        select: { id: true, installationNumber: true, scheduledAt: true, status: true, capacityKw: true, progressPercent: true },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
        select: { id: true, number: true, issueDate: true, dueDate: true, status: true, totalAmount: true, balanceDue: true },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        select: { id: true, referenceNumber: true, paymentDate: true, method: true, amount: true, status: true },
      },
      serviceRequests: {
        orderBy: { reportedAt: "desc" },
        select: { id: true, number: true, reportedAt: true, status: true, priority: true, description: true },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        select: { id: true, fileName: true, contentType: true, sizeBytes: true, createdAt: true },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, kind: true, text: true, createdAt: true },
      },
    },
  });

  if (!customer) notFound();
  return <CustomerDetailView customer={customer} />;
}
