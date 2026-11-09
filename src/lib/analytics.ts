import { eachMonthOfInterval, format, parseISO, startOfMonth, subMonths, isSameMonth, isBefore, isToday, startOfDay } from "date-fns";
import type { Enquiry, FollowUp, InstallationProject, Invoice, Order, Payment, Quotation, SiteSurvey } from "@/types";

export interface Dataset {
  enquiries: Enquiry[]; followUps: FollowUp[]; surveys: SiteSurvey[]; quotations: Quotation[];
  orders: Order[]; installations: InstallationProject[]; invoices: Invoice[]; payments: Payment[];
}

export function quotationTotal(q: Quotation): number {
  const sub = q.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) + q.installationCharges + q.otherCosts - q.discount;
  return Math.round(Math.max(0, sub) * (1 + q.taxPercent / 100));
}

export const invoicePaid = (invoiceId: string, payments: Payment[]) => payments.filter((p) => p.invoiceId === invoiceId).reduce((s, p) => s + p.amount, 0);

export function kpis(d: Dataset) {
  const today = startOfDay(new Date());
  const pendingFollowUps = d.followUps.filter((f) => f.status === "Pending");
  const outstanding = d.invoices.reduce((s, v) => s + Math.max(0, v.amount - invoicePaid(v.id, d.payments)), 0);
  return {
    totalEnquiries: d.enquiries.length,
    newEnquiries: d.enquiries.filter((e) => e.stage === "New" || (e.status === "Lead" && Date.now() - parseISO(e.createdAt).getTime() < 30 * 864e5)).length,
    followUpsDue: pendingFollowUps.filter((f) => isToday(parseISO(f.date)) || isBefore(parseISO(f.date), today)).length,
    surveys: d.surveys.length,
    quotationsSent: d.quotations.filter((q) => q.status === "Sent" || q.status === "Accepted").length,
    confirmedOrders: d.orders.length,
    activeInstallations: d.installations.filter((i) => i.stage !== "Completed").length,
    revenue: d.payments.reduce((s, p) => s + p.amount, 0),
    outstanding,
  };
}

export function monthlySeries(d: Dataset, months = 6) {
  const end = startOfMonth(new Date());
  return eachMonthOfInterval({ start: subMonths(end, months - 1), end }).map((m) => ({
    month: format(m, "MMM"),
    enquiries: d.enquiries.filter((e) => isSameMonth(parseISO(e.createdAt), m)).length,
    revenue: d.payments.filter((p) => isSameMonth(parseISO(p.date), m)).reduce((s, p) => s + p.amount, 0),
    orders: d.orders.filter((o) => isSameMonth(parseISO(o.orderDate), m)).length,
  }));
}

export function funnel(d: Dataset) {
  const followedUp = new Set(d.surveys.map((s) => s.enquiryId)).size;
  const quoted = new Set(d.quotations.map((q) => q.enquiryId)).size;
  const ordered = new Set(d.orders.map((o) => o.enquiryId)).size;
  const completed = d.installations.filter((i) => i.stage === "Completed").length;
  return [
    { stage: "Leads", value: d.enquiries.length },
    { stage: "Followed up", value: followedUp },
    { stage: "Proposals", value: quoted },
    { stage: "Orders", value: ordered },
    { stage: "Projects", value: completed },
  ];
}

export function countBy<T>(items: T[], pick: (t: T) => string | undefined) {
  const map = new Map<string, number>();
  items.forEach((i) => { const k = pick(i); if (k) map.set(k, (map.get(k) ?? 0) + 1); });
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function teamPerformance(d: Dataset, team: { name: string }[]) {
  return team.map((t) => ({
    name: t.name,
    enquiries: d.enquiries.filter((e) => e.assignedTo === t.name).length,
    followUps: d.followUps.filter((f) => f.assignedTo === t.name && f.status === "Completed").length,
    pending: d.followUps.filter((f) => f.assignedTo === t.name && f.status === "Pending").length,
  }));
}
