import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CalendarClock, FileText, HardHat, Receipt, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatINR, formatPhone } from "@/lib/format";

type CustomerDetails = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  district: string | null;
  category: string;
  createdAt: Date;
  enquiries: { id: string; siNo: number; status: string; stage: string; createdAt: Date; quotedAmount: { toString(): string } | null; workDescription: string | null }[];
  followUps: { id: string; title: string; date: Date; status: string; outcome: string | null }[];
  surveys: { id: string; surveyNumber: string; scheduledAt: Date; status: string; feasibility: string; proposedCapacityKw: { toString(): string } | null }[];
  quotations: { id: string; number: string; createdAt: Date; status: string; totalAmount: { toString(): string }; customerPayable: { toString(): string } }[];
  orders: { id: string; number: string; orderDate: Date; status: string; orderValue: { toString(): string }; advanceReceived: { toString(): string } }[];
  installations: { id: string; installationNumber: string; scheduledAt: Date | null; status: string; capacityKw: { toString(): string }; progressPercent: number }[];
  invoices: { id: string; number: string; issueDate: Date; dueDate: Date; status: string; totalAmount: { toString(): string }; balanceDue: { toString(): string } }[];
  payments: { id: string; referenceNumber: string; paymentDate: Date; method: string; amount: { toString(): string }; status: string }[];
  serviceRequests: { id: string; number: string; reportedAt: Date; status: string; priority: string; description: string }[];
  documents: { id: string; fileName: string; contentType: string; sizeBytes: number; createdAt: Date }[];
  activities: { id: string; kind: string; text: string; createdAt: Date }[];
};

function RecordSection({
  title,
  icon: Icon,
  entries,
}: {
  title: string;
  icon: typeof FileText;
  entries: { id: string; title: string; detail: string; status?: string; date?: Date | null }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="size-4 text-brand" />{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          <ul className="divide-y">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">{entry.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {entry.status && <StatusBadge value={entry.status.replaceAll("_", " ")} />}
                  {entry.date && <span className="text-xs text-muted-foreground">{formatDate(entry.date.toISOString())}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CustomerDetailView({ customer }: { customer: CustomerDetails }) {
  const category = customer.category === "RESIDENTIAL" ? "Individual" : "Organization";
  const sections = [
    {
      title: "Leads",
      icon: BriefcaseBusiness,
      entries: customer.enquiries.map((item) => ({
        id: item.id,
        title: `Lead #${item.siNo}`,
        detail: item.workDescription ?? "Customer opportunity",
        status: item.stage,
        date: item.createdAt,
      })),
    },
    {
      title: "Follow-ups",
      icon: CalendarClock,
      entries: customer.followUps.map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.outcome ?? "No outcome recorded",
        status: item.status,
        date: item.date,
      })),
    },
    {
      title: "Tasks",
      icon: HardHat,
      entries: customer.surveys.map((item) => ({
        id: item.id,
        title: item.surveyNumber,
        detail: item.feasibility.replaceAll("_", " "),
        status: item.status,
        date: item.scheduledAt,
      })),
    },
    {
      title: "Proposals",
      icon: FileText,
      entries: customer.quotations.map((item) => ({
        id: item.id,
        title: item.number,
        detail: `Customer payable ${formatINR(Number(item.customerPayable.toString()))}`,
        status: item.status,
        date: item.createdAt,
      })),
    },
    {
      title: "Orders",
      icon: BriefcaseBusiness,
      entries: customer.orders.map((item) => ({
        id: item.id,
        title: item.number,
        detail: `Value ${formatINR(Number(item.orderValue.toString()))} · advance ${formatINR(Number(item.advanceReceived.toString()))}`,
        status: item.status,
        date: item.orderDate,
      })),
    },
    {
      title: "Projects",
      icon: HardHat,
      entries: customer.installations.map((item) => ({
        id: item.id,
        title: item.installationNumber,
        detail: `${item.progressPercent}% complete`,
        status: item.status,
        date: item.scheduledAt,
      })),
    },
    {
      title: "Invoices",
      icon: Receipt,
      entries: customer.invoices.map((item) => ({
        id: item.id,
        title: item.number,
        detail: `${formatINR(Number(item.totalAmount.toString()))} · balance ${formatINR(Number(item.balanceDue.toString()))}`,
        status: item.status,
        date: item.issueDate,
      })),
    },
    {
      title: "Payments",
      icon: Receipt,
      entries: customer.payments.map((item) => ({
        id: item.id,
        title: item.referenceNumber,
        detail: `${formatINR(Number(item.amount.toString()))} · ${item.method.replaceAll("_", " ")}`,
        status: item.status,
        date: item.paymentDate,
      })),
    },
    {
      title: "Support cases",
      icon: Wrench,
      entries: customer.serviceRequests.map((item) => ({
        id: item.id,
        title: item.number,
        detail: `${item.priority} · ${item.description}`,
        status: item.status,
        date: item.reportedAt,
      })),
    },
    {
      title: "Documents",
      icon: FileText,
      entries: customer.documents.map((item) => ({
        id: item.id,
        title: item.fileName,
        detail: `${item.contentType} · ${Math.ceil(item.sizeBytes / 1024)} KB`,
        date: item.createdAt,
      })),
    },
    {
      title: "Activity",
      icon: CalendarClock,
      entries: customer.activities.map((item) => ({
        id: item.id,
        title: item.text,
        detail: item.kind.replaceAll("_", " "),
        date: item.createdAt,
      })),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={customer.name}
        description={`${category} customer · Added ${formatDate(customer.createdAt.toISOString())}`}
        actions={<Button asChild variant="outline"><Link href="/customers"><ArrowLeft />Back to customers</Link></Button>}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Customer information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><p className="text-muted-foreground">Phone</p><p className="mt-1 font-medium">{formatPhone(customer.phone)}</p></div>
          <div><p className="text-muted-foreground">Email</p><p className="mt-1 font-medium">{customer.email ?? "—"}</p></div>
          <div><p className="text-muted-foreground">District</p><p className="mt-1 font-medium">{customer.district ?? "—"}</p></div>
          <div className="sm:col-span-2 lg:col-span-3"><p className="text-muted-foreground">Address</p><p className="mt-1 font-medium">{customer.address ?? "—"}</p></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Enquiries" value={customer.enquiries.length} icon={BriefcaseBusiness} />
        <KpiCard label="Proposals" value={customer.quotations.length} icon={FileText} />
        <KpiCard label="Orders" value={customer.orders.length} icon={BriefcaseBusiness} />
        <KpiCard label="Service requests" value={customer.serviceRequests.length} icon={Wrench} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {sections.map((section) => <RecordSection key={section.title} {...section} />)}
      </div>
    </div>
  );
}
