"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileText, MapPin, MessageCircle, Pencil, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { quotationTotal } from "@/lib/analytics";
import { formatDate, formatINR, formatPhone, timeAgo } from "@/lib/format";
import { useDataStore } from "@/store/data-store";
import { EnquiryFormDialog } from "./enquiry-form";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-0.5 text-sm font-medium">{value || <span className="font-normal text-muted-foreground">—</span>}</dd></div>
  );
}

export function EnquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const d = useDataStore();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const e = d.enquiries.find((x) => x.id === id);

  if (!d.hydrated) return <Skeleton className="h-96 rounded-xl" />;
  if (!e) return <EmptyState title="Enquiry not found" description="It may have been deleted." action={<Button asChild><Link href="/enquiries">Back to enquiries</Link></Button>} />;

  const contacts = d.contacts.filter((c) => c.enquiryId === e.id);
  const followUps = d.followUps.filter((f) => f.enquiryId === e.id).sort((a, b) => b.date.localeCompare(a.date));
  const surveys = d.surveys.filter((s) => s.enquiryId === e.id);
  const quotes = d.quotations.filter((q) => q.enquiryId === e.id);
  const projects = d.installations.filter((p) => p.enquiryId === e.id);
  const services = d.services.filter((s) => s.enquiryId === e.id);
  const activity = d.activity.filter((a) => a.enquiryId === e.id);
  const wa = `https://wa.me/91${e.contactNo.replace(/\D/g, "").slice(-10)}`;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2"><Link href="/enquiries"><ArrowLeft />Enquiries</Link></Button>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-[22px] font-semibold tracking-tight">{e.name}</h1><StatusBadge value={e.status} /><StatusBadge value={e.category} /></div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"><span>SI #{e.siNo}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{e.place}</span><span>Stage: {e.stage}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><a href={`tel:+91${e.contactNo}`}><Phone />Call</a></Button>
          <Button asChild variant="outline" size="sm"><a href={wa} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a></Button>
          <Button variant="outline" size="sm" onClick={() => setEdit(true)}><Pencil />Edit</Button>
          <Button variant="outline" size="sm" onClick={() => setDel(true)} className="text-destructive"><Trash2 />Delete</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="followups">Follow-ups ({followUps.length})</TabsTrigger>
          <TabsTrigger value="survey">Site survey ({surveys.length})</TabsTrigger><TabsTrigger value="quotes">Quotations ({quotes.length})</TabsTrigger>
          <TabsTrigger value="project">Project</TabsTrigger><TabsTrigger value="docs">Documents</TabsTrigger><TabsTrigger value="service">Service ({services.length})</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>Customer & contact</CardTitle></CardHeader><CardContent><dl className="grid grid-cols-2 gap-4">
            <Field label="Phone" value={formatPhone(e.contactNo)} /><Field label="Email" value={e.email} /><Field label="Assigned to" value={e.assignedTo} /><Field label="Source" value={e.source} />
            <Field label="Next follow-up" value={formatDate(e.nextFollowUp)} /><Field label="Created" value={formatDate(e.createdAt)} /></dl>
            {contacts.length > 0 && <div className="mt-5 border-t pt-4"><p className="mb-2 text-xs font-medium text-muted-foreground">Contacts ({contacts.length})</p><ul className="space-y-2">{contacts.map((c) => <li key={c.id} className="flex items-center justify-between text-sm"><span>{c.name}</span><StatusBadge value={c.role} /></li>)}</ul></div>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Solar requirements</CardTitle></CardHeader><CardContent><dl className="grid grid-cols-2 gap-4">
            <Field label="Solar type" value={e.solarType} /><Field label="Capacity" value={e.systemCapacity} /><Field label="Roof type" value={e.roofType} /><Field label="DCR / NDCR" value={e.dcrType} />
            <Field label="Panel brand" value={e.panelBrand} /><Field label="Inverter brand" value={e.inverterBrand} /></dl>
            {e.workDescription && <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{e.workDescription}</p>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Referral & finance</CardTitle></CardHeader><CardContent><dl className="grid grid-cols-2 gap-4">
            <Field label="Referral" value={e.referral} /><Field label="Referral contact" value={e.referralContact ? formatPhone(e.referralContact) : undefined} />
            <Field label="Quoted" value={e.quoted ? formatINR(e.quoted) : undefined} /><Field label="Cash received" value={e.cashReceived ? formatINR(e.cashReceived) : undefined} />
            <Field label="Start date" value={formatDate(e.startDate)} /><Field label="Documentation" value={e.documentation ? "Completed" : "Pending"} /></dl></CardContent></Card>
        </TabsContent>

        <TabsContent value="followups"><Card><CardContent>{followUps.length === 0 ? <EmptyState title="No follow-ups yet" /> : (
          <ol className="relative space-y-5 border-l pl-5">{followUps.map((f) => (
            <li key={f.id} className="relative"><span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full border-2 border-card bg-brand" />
              <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-medium">{formatDate(f.date)} · {f.time}</span><StatusBadge value={f.type} tone="brand" /><StatusBadge value={f.status} /></div>
              <p className="mt-1 text-sm text-muted-foreground">{f.notes}</p>{f.outcome && <p className="mt-1 text-sm">Outcome: {f.outcome}</p>}</li>))}</ol>)}</CardContent></Card></TabsContent>

        <TabsContent value="survey"><Card><CardContent>{surveys.length === 0 ? <EmptyState title="No site survey" description="Book a survey from the Site Surveys module." action={<Button asChild size="sm"><Link href="/site-surveys?new=1">Book survey</Link></Button>} /> : surveys.map((s) => (
          <dl key={s.id} className="grid grid-cols-2 gap-4 sm:grid-cols-4"><Field label="Date" value={formatDate(s.date)} /><Field label="Surveyor" value={s.surveyor} /><Field label="Roof condition" value={s.roofCondition} /><Field label="Feasibility" value={<StatusBadge value={s.feasibility} />} /><Field label="Roof area" value={s.roofAreaSqFt ? `${s.roofAreaSqFt} sq ft` : undefined} /><Field label="Connection" value={s.electricityConnection} /><Field label="Shading" value={s.shading} /></dl>))}</CardContent></Card></TabsContent>

        <TabsContent value="quotes"><Card><CardContent>{quotes.length === 0 ? <EmptyState icon={FileText} title="No quotations" action={<Button asChild size="sm"><Link href="/quotations?new=1">Create quotation</Link></Button>} /> : (
          <ul className="divide-y">{quotes.map((q) => <li key={q.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium">{q.number}</p><p className="text-xs text-muted-foreground">{q.capacity} · valid until {formatDate(q.validUntil)}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold tabular-nums">{formatINR(quotationTotal(q))}</span><StatusBadge value={q.status} /></div></li>)}</ul>)}</CardContent></Card></TabsContent>

        <TabsContent value="project"><Card><CardContent>{projects.length === 0 ? <EmptyState title="No installation project yet" description="A project is created once a quotation is accepted and ordered." /> : projects.map((p) => <div key={p.id} className="flex items-center justify-between"><div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.team} · {p.equipment}</p></div><StatusBadge value={p.stage} /></div>)}</CardContent></Card></TabsContent>

        <TabsContent value="docs"><Card><CardContent>{e.documents.length === 0 ? <EmptyState title="No documents uploaded" description="Upload documents from the Edit form." action={<Button size="sm" variant="outline" onClick={() => setEdit(true)}>Edit enquiry</Button>} /> : <ul className="space-y-2">{e.documents.map((n, i) => <li key={i} className="flex items-center gap-2 text-sm"><FileText className="size-4 text-brand" />{n}</li>)}</ul>}</CardContent></Card></TabsContent>

        <TabsContent value="service"><Card><CardContent>{services.length === 0 ? <EmptyState title="No service history" /> : <ul className="divide-y">{services.map((s) => <li key={s.id} className="py-3 first:pt-0 last:pb-0"><div className="flex items-center justify-between"><span className="text-sm font-medium">{s.number} · {s.product}</span><StatusBadge value={s.status} /></div><p className="mt-1 text-sm text-muted-foreground">{s.issue}</p></li>)}</ul>}</CardContent></Card></TabsContent>

        <TabsContent value="activity"><Card><CardContent>{activity.length === 0 ? <EmptyState title="No recorded activity" /> : <ol className="space-y-3">{activity.map((a) => <li key={a.id} className="text-sm">{a.text} <span className="text-xs text-muted-foreground">· {timeAgo(a.at)}</span></li>)}</ol>}</CardContent></Card></TabsContent>
      </Tabs>

      <EnquiryFormDialog open={edit} onOpenChange={setEdit} enquiry={e} />
      <ConfirmDialog open={del} onOpenChange={setDel} title="Delete enquiry?" description={`“${e.name}” will be permanently removed from this demo workspace.`}
        onConfirm={async () => { await d.remove("enquiries", e.id); toast.success("Enquiry deleted"); router.push("/enquiries"); }} />
    </>
  );
}
