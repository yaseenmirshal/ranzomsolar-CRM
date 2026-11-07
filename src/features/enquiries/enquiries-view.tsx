"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Eye, KanbanSquare, MoreHorizontal, Pencil, Plus, Table2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatINR, formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/store/data-store";
import { ENQUIRY_STATUSES, type Enquiry } from "@/types";
import { EnquiryFormDialog } from "./enquiry-form";
import { EnquiryKanban } from "./enquiry-kanban";

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "new", label: "New Leads", test: (e: Enquiry) => e.stage === "New" },
  { id: "followup", label: "Follow-up Required", test: (e: Enquiry) => e.stage === "Follow-up Required" },
  { id: "survey", label: "Site Survey Pending", test: (e: Enquiry) => e.stage === "Site Survey Pending" },
  { id: "quote", label: "Quotation Pending", test: (e: Enquiry) => e.stage === "Quotation Pending" },
  { id: "progress", label: "In Progress", test: (e: Enquiry) => e.status === "In-Progress" },
  { id: "paused", label: "Paused", test: (e: Enquiry) => e.status === "Paused" },
  { id: "completed", label: "Completed", test: (e: Enquiry) => e.status === "Completed" },
] as const;

export function EnquiriesView() {
  const router = useRouter();
  const params = useSearchParams();
  const { enquiries, hydrated, remove } = useDataStore();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Enquiry | undefined>();
  const [deleting, setDeleting] = useState<Enquiry | undefined>();

  useEffect(() => {
    if (params.get("new") === "1") { setEditing(undefined); setFormOpen(true); router.replace("/enquiries"); }
  }, [params, router]);

  const active = FILTERS.find((f) => f.id === filter)!;
  const rows = useMemo(() => enquiries.filter(active.test), [enquiries, active]);

  const columns = useMemo<ColumnDef<Enquiry, unknown>[]>(() => [
    { accessorKey: "siNo", header: "SI No", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.siNo}</span> },
    { accessorKey: "name", header: "Customer", cell: ({ row }) => <Link href={`/enquiries/${row.original.id}`} className="font-medium hover:text-brand" onClick={(e) => e.stopPropagation()}>{row.original.name}</Link> },
    { accessorKey: "contactNo", header: "Phone", cell: ({ row }) => formatPhone(row.original.contactNo) },
    { accessorKey: "place", header: "Location" },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <StatusBadge value={row.original.category} /> },
    { accessorKey: "solarType", header: "Solar type", cell: ({ row }) => row.original.solarType ?? "—" },
    { accessorKey: "systemCapacity", header: "Capacity", cell: ({ row }) => row.original.systemCapacity ?? "—" },
    { accessorKey: "referral", header: "Referral", cell: ({ row }) => row.original.referral ?? "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge value={row.original.status} /> },
    { accessorKey: "assignedTo", header: "Assigned" },
    { accessorKey: "nextFollowUp", header: "Next follow-up", cell: ({ row }) => formatDate(row.original.nextFollowUp, "dd MMM") },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
    { accessorKey: "quoted", header: "Quoted", cell: ({ row }) => (row.original.quoted ? formatINR(row.original.quoted) : "—") },
    {
      id: "actions", enableSorting: false, enableHiding: false, header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push(`/enquiries/${row.original.id}`)}><Eye />View</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setEditing(row.original); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem>
              <DropdownMenuItem destructive onSelect={() => setDeleting(row.original)}><Trash2 />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [router]);

  const exportCsv = () => downloadCsv("enquiries.csv", rows.map((e) => ({
    "SI No": e.siNo, Customer: e.name, Phone: e.contactNo, Location: e.place, Category: e.category, "Solar Type": e.solarType ?? "",
    "System Capacity": e.systemCapacity ?? "", Referral: e.referral ?? "", Status: e.status, Assigned: e.assignedTo,
    "Next Follow-up": e.nextFollowUp ?? "", Created: e.createdAt.slice(0, 10), Quoted: e.quoted ?? "", "Cash Received": e.cashReceived ?? "",
  })));

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Every solar lead and customer enquiry, from first call to completion."
        actions={<>
          <div className="flex rounded-lg bg-muted p-1" role="group" aria-label="View mode">
            {([["table", Table2, "Table"], ["kanban", KanbanSquare, "Kanban"]] as const).map(([id, Icon, label]) => (
              <button key={id} onClick={() => setView(id)} aria-pressed={view === id} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium", view === id ? "bg-card shadow-sm" : "text-muted-foreground")}><Icon className="size-4" />{label}</button>
            ))}
          </div>
          <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus />Add enquiry</Button>
        </>}
      />

      <div className="scrollbar-thin mb-4 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter enquiries">
        {FILTERS.map((f) => {
          const n = enquiries.filter(f.test).length;
          return (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn("whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors", filter === f.id ? "border-brand bg-brand text-white" : "bg-card text-muted-foreground hover:text-foreground")}>
              {f.label}<span className={cn("ml-1.5 text-xs", filter === f.id ? "text-white/80" : "text-muted-foreground/70")}>{n}</span>
            </button>
          );
        })}
      </div>

      {!hydrated ? <Skeleton className="h-96 rounded-xl" /> : view === "table" ? (
        <DataTable data={rows} columns={columns} searchPlaceholder="Search name, phone, place…" onExport={exportCsv} onRowClick={(e) => router.push(`/enquiries/${e.id}`)} emptyTitle="No enquiries in this view" emptyDescription="Add a new enquiry to get started." initialHidden={{ referral: false, solarType: false, quoted: false, createdAt: false }} />
      ) : (
        <EnquiryKanban enquiries={rows} statuses={ENQUIRY_STATUSES} onEdit={(e) => { setEditing(e); setFormOpen(true); }} />
      )}

      <EnquiryFormDialog open={formOpen} onOpenChange={setFormOpen} enquiry={editing} />
      <ConfirmDialog
        open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}
        title="Delete enquiry?" description={`“${deleting?.name}” will be permanently removed from this demo workspace. This cannot be undone.`}
        onConfirm={async () => { if (deleting) { await remove("enquiries", deleting.id); toast.success("Enquiry deleted"); } }}
      />
    </>
  );
}
