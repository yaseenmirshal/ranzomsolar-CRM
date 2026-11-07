"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownToLine, ArrowUpFromLine, CalendarClock, ClipboardCheck, FileText, HardHat, MoreHorizontal,
  Package, Pencil, PhoneCall, Plus, ShoppingCart, Trash2, Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatINR, formatPhone } from "@/lib/format";
import { newId, useDataStore } from "@/store/data-store";
import type { OperationalModule } from "./operational-modules";
import {
  CAPACITIES, ROOF_TYPES, SOLAR_TYPES,
  type Contact, type FollowUp, type InstallationProject, type InventoryItem, type Order, type Quotation, type SiteSurvey,
} from "@/types";

type TableRecord = Record<string, string | number | undefined> & { id: string };
type Field = {
  key: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "time" | "number" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
};
type Column = { key: string; label: string; format?: "date" | "money" | "phone" | "status" };

const today = () => new Date().toISOString().slice(0, 10);
const optionList = (values: readonly string[]) => values.map((value) => ({ value, label: value }));
const choices = (values: string[]) => values.map((value) => ({ value, label: value }));
const text = (value: string | number | undefined) => value === undefined ? "" : String(value);
const inventoryCategories: InventoryItem["category"][] = [
  "Solar Panels", "Inverters", "Batteries", "Mounting Structures", "Cables", "Electrical Components", "Other Materials",
];

function getFields(module: OperationalModule, data: ReturnType<typeof useDataStore.getState>): Field[] {
  const enquiryOptions = data.enquiries.map((item) => ({ value: item.id, label: `${item.name} · ${item.place}` }));
  const quotationOptions = data.quotations.map((item) => ({ value: item.id, label: `${item.number} · ${item.customer}` }));
  const orderOptions = data.orders.map((item) => ({ value: item.id, label: `${item.number} · ${item.customer}` }));
  const teamOptions = choices(data.team.map((item) => item.name));
  switch (module) {
    case "contacts": return [
      { key: "name", label: "Contact name", required: true },
      { key: "phone", label: "Phone", type: "tel", required: true },
      { key: "email", label: "Email", type: "email" },
      { key: "role", label: "Role", type: "select", options: optionList(["Lead", "Follow up"]), required: true },
      { key: "enquiryId", label: "Customer / enquiry", type: "select", options: enquiryOptions, required: true },
    ];
    case "follow-ups": return [
      { key: "enquiryId", label: "Customer / enquiry", type: "select", options: enquiryOptions, required: true },
      { key: "date", label: "Follow-up date", type: "date", required: true },
      { key: "time", label: "Time", type: "time", required: true },
      { key: "type", label: "Channel", type: "select", options: optionList(["Call", "WhatsApp", "Site Visit", "Email", "Meeting"]), required: true },
      { key: "assignedTo", label: "Assigned to", type: "select", options: teamOptions, required: true },
      { key: "status", label: "Status", type: "select", options: optionList(["Pending", "Completed", "Rescheduled"]), required: true },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "outcome", label: "Outcome", type: "textarea" },
      { key: "nextAction", label: "Next action" },
    ];
    case "site-surveys": return [
      { key: "enquiryId", label: "Customer / enquiry", type: "select", options: enquiryOptions, required: true },
      { key: "date", label: "Survey date", type: "date", required: true },
      { key: "surveyor", label: "Surveyor", type: "select", options: teamOptions, required: true },
      { key: "location", label: "Location", required: true },
      { key: "roofType", label: "Roof type", type: "select", options: optionList(ROOF_TYPES), required: true },
      { key: "feasibility", label: "Feasibility", type: "select", options: optionList(["Pending", "Feasible", "Feasible with changes", "Not feasible"]), required: true },
      { key: "status", label: "Status", type: "select", options: optionList(["Scheduled", "Completed", "Cancelled"]), required: true },
      { key: "notes", label: "Survey notes", type: "textarea" },
    ];
    case "quotations": return [
      { key: "enquiryId", label: "Customer / enquiry", type: "select", options: enquiryOptions, required: true },
      { key: "solarType", label: "Solar type", type: "select", options: optionList(SOLAR_TYPES), required: true },
      { key: "capacity", label: "System capacity", type: "select", options: optionList(CAPACITIES), required: true },
      { key: "panelPrice", label: "Solar panels (INR)", type: "number", min: 0, required: true },
      { key: "inverterPrice", label: "Inverter & balance of system (INR)", type: "number", min: 0, required: true },
      { key: "installationCharges", label: "Installation charges (INR)", type: "number", min: 0, required: true },
      { key: "otherCosts", label: "Other costs (INR)", type: "number", min: 0, required: true },
      { key: "discount", label: "Discount (INR)", type: "number", min: 0, required: true },
      { key: "taxPercent", label: "Tax (%)", type: "number", min: 0, required: true },
      { key: "status", label: "Status", type: "select", options: optionList(["Draft", "Sent", "Accepted", "Rejected", "Expired"]), required: true },
      { key: "validUntil", label: "Valid until", type: "date", required: true },
      { key: "paymentTerms", label: "Payment terms", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
    ];
    case "orders": return [
      { key: "quotationId", label: "Quotation", type: "select", options: quotationOptions, required: true },
      { key: "orderDate", label: "Order date", type: "date", required: true },
      { key: "expectedInstallation", label: "Expected installation", type: "date" },
      { key: "advance", label: "Advance received (INR)", type: "number", min: 0, required: true },
      { key: "paymentStatus", label: "Payment status", type: "select", options: optionList(["Unpaid", "Partially Paid", "Paid"]), required: true },
    ];
    case "installations": return [
      { key: "orderId", label: "Sales order", type: "select", options: orderOptions, required: true },
      { key: "team", label: "Installation team", required: true },
      { key: "startDate", label: "Start date", type: "date", required: true },
      { key: "endDate", label: "Target completion", type: "date" },
      { key: "stage", label: "Project stage", type: "select", options: optionList(["Planning", "Material Dispatch", "Installing", "Commissioning", "Completed"]), required: true },
      { key: "equipment", label: "Equipment", type: "textarea" },
    ];
    case "inventory": return [
      { key: "name", label: "Item name", required: true },
      { key: "sku", label: "SKU", required: true },
      { key: "category", label: "Category", type: "select", options: optionList(inventoryCategories), required: true },
      { key: "brand", label: "Brand", required: true },
      { key: "model", label: "Model", required: true },
      { key: "quantity", label: "On hand", type: "number", min: 0, required: true },
      { key: "unit", label: "Unit", required: true },
      { key: "purchasePrice", label: "Purchase price (INR)", type: "number", min: 0, required: true },
      { key: "lowStockThreshold", label: "Low-stock threshold", type: "number", min: 0, required: true },
    ];
  }
}

function getRows(module: OperationalModule, data: ReturnType<typeof useDataStore.getState>): TableRecord[] {
  const enquiryName = (id: string) => data.enquiries.find((item) => item.id === id)?.name ?? "Unknown enquiry";
  const quotationTotal = (item: Quotation) => Math.round(
    (item.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) +
      item.installationCharges + item.otherCosts - item.discount) * (1 + item.taxPercent / 100),
  );
  switch (module) {
    case "contacts": return data.contacts.map((item) => ({
      id: item.id, name: item.name, phone: item.phone, email: item.email, role: item.role,
      customer: enquiryName(item.enquiryId), enquiryId: item.enquiryId, lastContacted: item.lastContacted,
    }));
    case "follow-ups": return data.followUps.map((item) => ({
      id: item.id, customer: item.customer, contactNo: item.contactNo, date: item.date, time: item.time,
      type: item.type, assignedTo: item.assignedTo, status: item.status, notes: item.notes, outcome: item.outcome,
      nextAction: item.nextAction, enquiryId: item.enquiryId,
    }));
    case "site-surveys": return data.surveys.map((item) => ({
      id: item.id, customer: item.customer, location: item.location, date: item.date, surveyor: item.surveyor,
      roofType: item.roofType, feasibility: item.feasibility, status: item.status, notes: item.notes, enquiryId: item.enquiryId,
    }));
    case "quotations": return data.quotations.map((item) => ({
      id: item.id, number: item.number, customer: item.customer, capacity: item.capacity, solarType: item.solarType,
      total: quotationTotal(item), validUntil: item.validUntil, status: item.status, enquiryId: item.enquiryId,
      panelPrice: item.lines[0]?.unitPrice ?? 0, inverterPrice: item.lines[1]?.unitPrice ?? 0,
      installationCharges: item.installationCharges, otherCosts: item.otherCosts, discount: item.discount, taxPercent: item.taxPercent,
    }));
    case "orders": return data.orders.map((item) => ({
      id: item.id, number: item.number, customer: item.customer, orderDate: item.orderDate, value: item.value,
      advance: item.advance, balance: Math.max(0, item.value - item.advance), paymentStatus: item.paymentStatus,
      expectedInstallation: item.expectedInstallation, quotationId: item.quotationId, enquiryId: item.enquiryId,
    }));
    case "installations": return data.installations.map((item) => ({
      id: item.id, name: item.name, customer: item.customer, team: item.team, capacity: item.capacity,
      stage: item.stage, startDate: item.startDate, endDate: item.endDate,
      checklist: `${item.checklist.filter((entry) => entry.done).length}/${item.checklist.length}`,
      orderId: item.orderId, enquiryId: item.enquiryId,
    }));
    case "inventory": return data.inventory.map((item) => ({
      id: item.id, name: item.name, sku: item.sku, category: item.category, brand: item.brand,
      model: item.model, quantity: item.quantity, unit: item.unit, purchasePrice: item.purchasePrice,
      lowStockThreshold: item.lowStockThreshold,
      stockStatus: item.quantity <= item.lowStockThreshold ? "Low stock" : "In stock",
    }));
  }
}

function getColumns(module: OperationalModule): Column[] {
  switch (module) {
    case "contacts": return [
      { key: "name", label: "Contact" }, { key: "phone", label: "Phone", format: "phone" },
      { key: "email", label: "Email" }, { key: "customer", label: "Customer" },
      { key: "role", label: "Role", format: "status" }, { key: "lastContacted", label: "Last contacted", format: "date" },
    ];
    case "follow-ups": return [
      { key: "customer", label: "Customer" }, { key: "date", label: "Date", format: "date" },
      { key: "time", label: "Time" }, { key: "type", label: "Channel" }, { key: "assignedTo", label: "Assigned to" },
      { key: "status", label: "Status", format: "status" }, { key: "nextAction", label: "Next action" },
    ];
    case "site-surveys": return [
      { key: "customer", label: "Customer" }, { key: "location", label: "Location" },
      { key: "date", label: "Survey date", format: "date" }, { key: "surveyor", label: "Surveyor" },
      { key: "roofType", label: "Roof" }, { key: "feasibility", label: "Feasibility", format: "status" },
      { key: "status", label: "Status", format: "status" },
    ];
    case "quotations": return [
      { key: "number", label: "Quotation #" }, { key: "customer", label: "Customer" },
      { key: "capacity", label: "Capacity" }, { key: "solarType", label: "System" },
      { key: "total", label: "Total", format: "money" }, { key: "validUntil", label: "Valid until", format: "date" },
      { key: "status", label: "Status", format: "status" },
    ];
    case "orders": return [
      { key: "number", label: "Order #" }, { key: "customer", label: "Customer" },
      { key: "orderDate", label: "Order date", format: "date" }, { key: "value", label: "Order value", format: "money" },
      { key: "advance", label: "Advance", format: "money" }, { key: "balance", label: "Balance", format: "money" },
      { key: "paymentStatus", label: "Payment", format: "status" }, { key: "expectedInstallation", label: "Installation", format: "date" },
    ];
    case "installations": return [
      { key: "name", label: "Project" }, { key: "customer", label: "Customer" },
      { key: "capacity", label: "Capacity" }, { key: "team", label: "Team" },
      { key: "stage", label: "Stage", format: "status" }, { key: "checklist", label: "Checklist" },
      { key: "startDate", label: "Start date", format: "date" },
    ];
    case "inventory": return [
      { key: "name", label: "Item" }, { key: "sku", label: "SKU" }, { key: "category", label: "Category" },
      { key: "brand", label: "Brand" }, { key: "quantity", label: "On hand" }, { key: "unit", label: "Unit" },
      { key: "purchasePrice", label: "Unit cost", format: "money" },
      { key: "stockStatus", label: "Stock", format: "status" },
    ];
  }
}

function defaultForm(module: OperationalModule, data: ReturnType<typeof useDataStore.getState>): Record<string, string> {
  const firstEnquiry = data.enquiries[0];
  const firstQuotation = data.quotations[0];
  const firstOrder = data.orders[0];
  const commonEnquiry = firstEnquiry?.id ?? "";
  switch (module) {
    case "contacts": return { name: "", phone: "", email: "", role: "Lead", enquiryId: commonEnquiry };
    case "follow-ups": return {
      enquiryId: commonEnquiry, date: today(), time: "09:00", type: "Call",
      assignedTo: data.team[0]?.name ?? "", status: "Pending", notes: "", outcome: "", nextAction: "",
    };
    case "site-surveys": return {
      enquiryId: commonEnquiry, date: today(), surveyor: data.team.find((member) => member.role === "Site Surveyor")?.name ?? "",
      location: firstEnquiry?.place ?? "", roofType: firstEnquiry?.roofType ?? "Flat", feasibility: "Pending",
      status: "Scheduled", notes: "",
    };
    case "quotations": return {
      enquiryId: commonEnquiry, solarType: firstEnquiry?.solarType ?? "On-Grid",
      capacity: firstEnquiry?.systemCapacity ?? "5 KW",
      panelPrice: String((Number.parseInt(firstEnquiry?.systemCapacity ?? "5", 10) || 5) * 24000),
      inverterPrice: String((Number.parseInt(firstEnquiry?.systemCapacity ?? "5", 10) || 5) * 17000),
      installationCharges: String((Number.parseInt(firstEnquiry?.systemCapacity ?? "5", 10) || 5) * 4000),
      otherCosts: "0", discount: "0", taxPercent: "8.9", status: "Draft",
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      paymentTerms: "30% advance, 60% on delivery, 10% after commissioning", notes: "",
    };
    case "orders": return {
      quotationId: firstQuotation?.id ?? "", orderDate: today(),
      expectedInstallation: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      advance: "0", paymentStatus: "Unpaid",
    };
    case "installations": return {
      orderId: firstOrder?.id ?? "", team: "Team Alpha", startDate: today(),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      stage: "Planning", equipment: "",
    };
    case "inventory": return {
      name: "", sku: "", category: "Solar Panels", brand: "", model: "", quantity: "0",
      unit: "pcs", purchasePrice: "0", lowStockThreshold: "0",
    };
  }
}

function moduleIntro(module: OperationalModule) {
  const copy: Record<OperationalModule, string> = {
    contacts: "People connected to customer enquiries, with direct contact details and relationship context.",
    "follow-ups": "A working queue for customer calls, visits and other next steps across the sales pipeline.",
    "site-surveys": "Schedule and track rooftop assessments, feasibility and survey outcomes.",
    quotations: "Prepare customer proposals and track their validity and decision status.",
    orders: "Confirmed customer orders, payment progress and installation dates.",
    installations: "Project delivery stages, assigned teams and checklist progress.",
    inventory: "Stock on hand, unit costs and items at or below their reorder threshold.",
  };
  return copy[module];
}

function recordLabel(module: OperationalModule) {
  const labels: Record<OperationalModule, string> = {
    contacts: "contact", "follow-ups": "follow-up", "site-surveys": "site survey",
    quotations: "quotation", orders: "order", installations: "installation", inventory: "inventory item",
  };
  return labels[module];
}

export function OperationalModuleView({ module, title }: { module: OperationalModule; title: string }) {
  const data = useDataStore();
  const hydrate = useDataStore((state) => state.hydrate);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<TableRecord | null>(null);
  const [movementItem, setMovementItem] = useState<TableRecord | null>(null);
  const [movementType, setMovementType] = useState<"In" | "Out">("In");
  const [movementQuantity, setMovementQuantity] = useState("1");
  const [movementNote, setMovementNote] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<InstallationProject["checklist"]>([]);
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [savingMovement, setSavingMovement] = useState(false);

  useEffect(() => { void hydrate().catch(() => toast.error("Could not load CRM records.")); }, [hydrate]);

  const rows = getRows(module, data);
  const fields = getFields(module, data);
  const activeRows = (() => {
    if (filter === "All") return rows;
    if (module === "inventory") return rows.filter((row) => row.stockStatus === filter);
    const statusKey = module === "orders" ? "paymentStatus" : module === "installations" ? "stage" : module === "contacts" ? "role" : "status";
    return rows.filter((row) => row[statusKey] === filter);
  })();

  const filters = (() => {
    const key = module === "inventory" ? "stockStatus" : module === "orders" ? "paymentStatus" :
      module === "installations" ? "stage" : module === "contacts" ? "role" : "status";
    return ["All", ...new Set(rows.map((row) => text(row[key])).filter(Boolean))];
  })();

  const columns: ColumnDef<TableRecord, unknown>[] = [
    ...getColumns(module).map((column) => ({
      accessorKey: column.key,
      header: column.label,
      cell: ({ row }: { row: { original: TableRecord } }) => {
        const value = row.original[column.key];
        if (column.format === "date") return formatDate(text(value), "dd MMM yyyy");
        if (column.format === "money") return formatINR(Number(value ?? 0));
        if (column.format === "phone") return formatPhone(text(value));
        if (column.format === "status") return <StatusBadge value={text(value)} />;
        return text(value) || "—";
      },
    })),
    {
      id: "actions", enableSorting: false, enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${text(row.original.name ?? row.original.customer ?? row.original.number)}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => beginEdit(row.original)}><Pencil />Edit</DropdownMenuItem>
              {module === "inventory" && (
                <DropdownMenuItem onSelect={() => {
                  setMovementItem(row.original);
                  setMovementType("In");
                  setMovementQuantity("1");
                  setMovementNote("");
                }}>
                  <ArrowDownToLine />Record stock movement
                </DropdownMenuItem>
              )}
              <DropdownMenuItem destructive onSelect={() => setDeleting(row.original)}><Trash2 />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  function beginCreate() {
    setEditingId(null);
    setForm(defaultForm(module, data));
    setChecklist(module === "installations" ? defaultChecklist() : []);
    setDialogOpen(true);
  }

  function beginEdit(row: TableRecord) {
    setEditingId(row.id);
    const initial = defaultForm(module, data);
    for (const field of fields) initial[field.key] = text(row[field.key]);
    setForm(initial);
    setChecklist(data.installations.find((item) => item.id === row.id)?.checklist ?? []);
    setDialogOpen(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = fields.find((field) => field.required && !form[field.key]?.trim());
    if (missing) {
      toast.error(`${missing.label} is required.`);
      return;
    }
    setSaving(true);
    try {
      await saveRecord(module, form, editingId, data, checklist);
      setDialogOpen(false);
      toast.success(`${recordLabel(module)} ${editingId ? "updated" : "created"}.`);
    } catch (error) {
      console.error(`Failed to save ${module} record`, error);
      toast.error(`Could not save this ${recordLabel(module)}. Please try again.`);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await data.remove(collectionFor(module), deleting.id);
      setDeleting(null);
      toast.success(`${recordLabel(module)} deleted.`);
    } catch (error) {
      console.error(`Failed to delete ${module} record`, error);
      toast.error(`Could not delete this ${recordLabel(module)}.`);
    }
  }

  async function recordStockMovement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!movementItem) return;
    const item = data.inventory.find((candidate) => candidate.id === movementItem.id);
    const quantity = Number(movementQuantity);
    if (!item || !Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Enter a whole quantity greater than zero.");
      return;
    }
    if (movementType === "Out" && quantity > item.quantity) {
      toast.error(`Only ${item.quantity} ${item.unit} are currently on hand.`);
      return;
    }
    setSavingMovement(true);
    try {
      await data.patch("inventory", item.id, {
        quantity: item.quantity + (movementType === "In" ? quantity : -quantity),
      });
      await data.add("stockMovements", {
        id: newId("stock"), itemId: item.id, type: movementType, quantity,
        note: movementNote.trim(), date: today(),
      });
      setMovementItem(null);
      toast.success(`${quantity} ${item.unit} recorded as stock ${movementType.toLowerCase()}.`);
    } catch (error) {
      console.error("Failed to record stock movement", error);
      toast.error("Could not record this stock movement.");
    } finally {
      setSavingMovement(false);
    }
  }

  const exportRows = activeRows.map((row) => Object.fromEntries(getColumns(module).map((column) => [
    column.label, row[column.key] ?? "",
  ])));
  const stats = statsFor(module, rows);

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={moduleIntro(module)}
        actions={<Button onClick={beginCreate}><Plus />Add {recordLabel(module)}</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => <KpiCard key={stat.label} {...stat} />)}
      </div>
      <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label={`Filter ${title.toLowerCase()}`}>
        {filters.map((value) => {
          const count = value === "All" ? rows.length : rows.filter((row) =>
            row[module === "inventory" ? "stockStatus" : module === "orders" ? "paymentStatus" :
              module === "installations" ? "stage" : module === "contacts" ? "role" : "status"] === value,
          ).length;
          return (
            <button key={value} role="tab" aria-selected={filter === value} onClick={() => setFilter(value)}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${filter === value ? "border-brand bg-brand text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}>
              {value}<span className="ml-1.5 text-xs opacity-75">{count}</span>
            </button>
          );
        })}
      </div>
      {!data.hydrated ? <Skeleton className="h-96 rounded-xl" /> : (
        <DataTable
          data={activeRows}
          columns={columns}
          searchPlaceholder={`Search ${title.toLowerCase()}…`}
          onExport={() => downloadCsv(`${module}.csv`, exportRows)}
          emptyTitle={`No ${title.toLowerCase()} yet`}
          emptyDescription={`Add a ${recordLabel(module)} to start managing this part of your workflow.`}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} {recordLabel(module)}</DialogTitle>
            <DialogDescription>Keep the record details current for your team.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={`space-y-1.5 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                    <Label htmlFor={`record-${field.key}`}>{field.label}</Label>
                    {field.type === "select" ? (
                      <Select value={form[field.key] ?? ""} onValueChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))}>
                        <SelectTrigger id={`record-${field.key}`}><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                        <SelectContent>
                          {(field.options ?? []).map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : field.type === "textarea" ? (
                      <textarea id={`record-${field.key}`} value={form[field.key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} rows={3} className="flex min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25" />
                    ) : (
                      <Input
                        id={`record-${field.key}`}
                        type={field.type ?? "text"}
                        value={form[field.key] ?? ""}
                        min={field.min}
                        required={field.required}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
              {module === "installations" && (
                <fieldset className="mt-6 space-y-3">
                  <legend className="text-sm font-semibold">Installation checklist</legend>
                  {checklist.map((item) => (
                    <label key={item.id} htmlFor={`checklist-${item.id}`} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
                      <input
                        id={`checklist-${item.id}`}
                        type="checkbox"
                        checked={item.done}
                        onChange={(event) => setChecklist((current) => current.map((entry) =>
                          entry.id === item.id ? { ...entry, done: event.target.checked } : entry,
                        ))}
                        className="size-4 accent-[var(--brand)]"
                      />
                      <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.label}</span>
                    </label>
                  ))}
                </fieldset>
              )}
              {module === "quotations" && <p className="mt-4 text-xs text-muted-foreground">New quotations start with a capacity-based price estimate. Review and adjust each amount before saving.</p>}
              {module === "inventory" && <p className="mt-4 text-xs text-muted-foreground">Items at or below the threshold are flagged as low stock. Use the quantity field to correct the current on-hand balance.</p>}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : `Add ${recordLabel(module)}`}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!movementItem} onOpenChange={(open) => !open && setMovementItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record stock movement</DialogTitle>
            <DialogDescription>
              {text(movementItem?.name)} · {text(movementItem?.quantity)} {text(movementItem?.unit)} on hand
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={recordStockMovement}>
            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="movement-type">Movement</Label>
                <Select value={movementType} onValueChange={(value) => setMovementType(value as "In" | "Out")}>
                  <SelectTrigger id="movement-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In"><span className="inline-flex items-center gap-2"><ArrowDownToLine className="size-4" />Stock in</span></SelectItem>
                    <SelectItem value="Out"><span className="inline-flex items-center gap-2"><ArrowUpFromLine className="size-4" />Stock out</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="movement-quantity">Quantity</Label>
                <Input id="movement-quantity" type="number" min="1" step="1" value={movementQuantity} required onChange={(event) => setMovementQuantity(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="movement-note">Reason / reference</Label>
                <Input id="movement-note" value={movementNote} onChange={(event) => setMovementNote(event.target.value)} placeholder="Supplier delivery, installation issue…" />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMovementItem(null)}>Cancel</Button>
              <Button type="submit" disabled={savingMovement}>{savingMovement ? "Saving…" : "Record movement"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${recordLabel(module)}?`}
        description="This record will be permanently removed from this workspace. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function collectionFor(module: OperationalModule) {
  switch (module) {
    case "contacts": return "contacts";
    case "follow-ups": return "followUps";
    case "site-surveys": return "surveys";
    case "quotations": return "quotations";
    case "orders": return "orders";
    case "installations": return "installations";
    case "inventory": return "inventory";
  }
}

function nextDocumentNumber(items: { number: string }[], prefix: string) {
  const highest = items.reduce((max, item) => {
    const match = item.number.match(/(\d+)$/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  return `${prefix}-${new Date().getFullYear()}-${String(highest + 1).padStart(4, "0")}`;
}

function defaultChecklist(): InstallationProject["checklist"] {
  return [
    "Material delivered", "Structure erected", "Panels mounted", "DC/AC cabling",
    "Inverter commissioning", "Grid sync", "Customer handover",
  ].map((label, index) => ({ id: newId(`check-${index}`), label, done: false }));
}

async function saveRecord(
  module: OperationalModule,
  form: Record<string, string>,
  existingId: string | null,
  data: ReturnType<typeof useDataStore.getState>,
  checklist: InstallationProject["checklist"],
) {
  const now = new Date().toISOString();
  const stamp = (id: string, createdAt = now) => ({ id, createdAt, updatedAt: now });
  const selectedEnquiry = (id: string) => data.enquiries.find((item) => item.id === id);
  const selectedQuotation = (id: string) => data.quotations.find((item) => item.id === id);
  const selectedOrder = (id: string) => data.orders.find((item) => item.id === id);
  const number = (key: string, fallback = 0) => {
    const value = Number(form[key]);
    return Number.isFinite(value) ? value : fallback;
  };
  const previous = <T extends { id: string; createdAt: string }>(items: T[]) => items.find((item) => item.id === existingId);
  const id = existingId ?? newId(module.slice(0, 3));

  switch (module) {
    case "contacts": {
      const old = previous(data.contacts);
      const enquiry = selectedEnquiry(form.enquiryId);
      if (!enquiry) throw new Error("Select an existing enquiry for this contact.");
      const item: Contact = {
        ...stamp(id, old?.createdAt), name: form.name.trim(), phone: form.phone.trim(),
        email: form.email.trim() || undefined, role: form.role as Contact["role"],
        enquiryId: enquiry.id, lastContacted: old?.lastContacted,
      };
      if (existingId) await data.patch("contacts", id, item);
      else await data.add("contacts", item);
      return;
    }
    case "follow-ups": {
      const old = previous(data.followUps);
      const enquiry = selectedEnquiry(form.enquiryId);
      if (!enquiry) throw new Error("Select an existing enquiry for this follow-up.");
      const item: FollowUp = {
        ...stamp(id, old?.createdAt), enquiryId: enquiry.id, customer: enquiry.name, contactNo: enquiry.contactNo,
        date: form.date, time: form.time, assignedTo: form.assignedTo, type: form.type as FollowUp["type"],
        notes: form.notes.trim(), outcome: form.outcome.trim() || undefined, nextAction: form.nextAction.trim() || undefined,
        status: form.status as FollowUp["status"],
      };
      if (existingId) await data.patch("followUps", id, item);
      else await data.add("followUps", item);
      return;
    }
    case "site-surveys": {
      const old = previous(data.surveys);
      const enquiry = selectedEnquiry(form.enquiryId);
      if (!enquiry) throw new Error("Select an existing enquiry for this survey.");
      const item: SiteSurvey = {
        ...stamp(id, old?.createdAt), enquiryId: enquiry.id, customer: enquiry.name, date: form.date,
        surveyor: form.surveyor, location: form.location.trim(), category: enquiry.category,
        roofType: form.roofType as SiteSurvey["roofType"], roofCondition: old?.roofCondition ?? "Good",
        roofAreaSqFt: old?.roofAreaSqFt, electricityConnection: old?.electricityConnection ?? "Single phase",
        sanctionedLoadKw: old?.sanctionedLoadKw, requiredCapacity: enquiry.systemCapacity,
        shading: old?.shading ?? "Not recorded", electricityBill: old?.electricityBill, photos: old?.photos ?? [],
        notes: form.notes.trim(), feasibility: form.feasibility as SiteSurvey["feasibility"],
        status: form.status as SiteSurvey["status"],
      };
      if (existingId) await data.patch("surveys", id, item);
      else await data.add("surveys", item);
      return;
    }
    case "quotations": {
      const old = previous(data.quotations);
      const enquiry = selectedEnquiry(form.enquiryId);
      if (!enquiry) throw new Error("Select an existing enquiry for this quotation.");
      const capacity = form.capacity as Quotation["capacity"];
      const kw = Number.parseInt(capacity, 10) || 5;
      const lines = old?.lines.map((line) => ({ ...line })) ?? [
        { id: newId("line"), description: "Solar panels", quantity: 1, unitPrice: number("panelPrice", kw * 24000) },
        { id: newId("line"), description: "Inverter and balance of system", quantity: 1, unitPrice: number("inverterPrice", kw * 17000) },
      ];
      if (old) {
        lines[0] = { ...lines[0], unitPrice: number("panelPrice", lines[0].unitPrice) };
        if (lines[1]) lines[1] = { ...lines[1], unitPrice: number("inverterPrice", lines[1].unitPrice) };
      }
      const item: Quotation = {
        ...stamp(id, old?.createdAt), number: old?.number ?? nextDocumentNumber(data.quotations, "RSQ"),
        enquiryId: enquiry.id, customer: enquiry.name, solarType: form.solarType as Quotation["solarType"],
        capacity, panelDetails: old?.panelDetails ?? `${kw} KW solar panel system`,
        inverterDetails: old?.inverterDetails ?? `${kw} KW solar inverter`,
        batteryDetails: old?.batteryDetails, mountingStructure: old?.mountingStructure ?? "Standard rooftop mounting structure",
        lines, installationCharges: number("installationCharges", old?.installationCharges ?? kw * 4000),
        otherCosts: number("otherCosts", old?.otherCosts ?? 0),
        discount: number("discount", old?.discount ?? 0), taxPercent: number("taxPercent", old?.taxPercent ?? 8.9),
        validUntil: form.validUntil,
        paymentTerms: form.paymentTerms.trim(), notes: form.notes.trim() || undefined,
        status: form.status as Quotation["status"],
      };
      if (existingId) await data.patch("quotations", id, item);
      else await data.add("quotations", item);
      return;
    }
    case "orders": {
      const old = previous(data.orders);
      const quotation = selectedQuotation(form.quotationId);
      if (!quotation) throw new Error("Select an existing quotation for this order.");
      const quotationTotal = Math.round(
        (quotation.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) +
          quotation.installationCharges + quotation.otherCosts - quotation.discount) * (1 + quotation.taxPercent / 100),
      );
      const item: Order = {
        ...stamp(id, old?.createdAt), number: old?.number ?? nextDocumentNumber(data.orders, "RSO"),
        quotationId: quotation.id, enquiryId: quotation.enquiryId, customer: quotation.customer,
        orderDate: form.orderDate, value: old?.value ?? quotationTotal, advance: number("advance", old?.advance ?? 0),
        paymentStatus: form.paymentStatus as Order["paymentStatus"],
        expectedInstallation: form.expectedInstallation || undefined,
      };
      if (existingId) await data.patch("orders", id, item);
      else await data.add("orders", item);
      return;
    }
    case "installations": {
      const old = previous(data.installations);
      const order = selectedOrder(form.orderId);
      if (!order) throw new Error("Select an existing sales order for this installation.");
      const enquiry = selectedEnquiry(order.enquiryId);
      const item: InstallationProject = {
        ...stamp(id, old?.createdAt), name: old?.name ?? `${enquiry?.systemCapacity ?? "Solar"} installation — ${order.customer}`,
        orderId: order.id, enquiryId: order.enquiryId, customer: order.customer, team: form.team,
        startDate: form.startDate, endDate: form.endDate || undefined,
        capacity: old?.capacity ?? enquiry?.systemCapacity ?? "5 KW", equipment: form.equipment.trim(),
        checklist: checklist.length ? checklist : old?.checklist ?? defaultChecklist(),
        stage: form.stage as InstallationProject["stage"], photos: old?.photos ?? [],
        completionDate: form.stage === "Completed" ? old?.completionDate ?? today() : undefined,
      };
      if (existingId) await data.patch("installations", id, item);
      else await data.add("installations", item);
      return;
    }
    case "inventory": {
      const old = previous(data.inventory);
      const item: InventoryItem = {
        ...stamp(id, old?.createdAt), name: form.name.trim(), sku: form.sku.trim(),
        category: form.category as InventoryItem["category"], brand: form.brand.trim(), model: form.model.trim(),
        quantity: number("quantity"), unit: form.unit.trim(), purchasePrice: number("purchasePrice"),
        lowStockThreshold: number("lowStockThreshold"),
      };
      if (existingId) await data.patch("inventory", id, item);
      else await data.add("inventory", item);
      return;
    }
  }
}

function statsFor(module: OperationalModule, rows: TableRecord[]) {
  const count = (key: string, value: string) => rows.filter((row) => row[key] === value).length;
  const specs: Record<OperationalModule, { label: string; value: number; icon: typeof Users; hint: string; format?: (value: number) => string }[]> = {
    contacts: [
      { label: "Total contacts", value: rows.length, icon: Users, hint: "Linked to enquiries" },
      { label: "Lead contacts", value: count("role", "Lead"), icon: PhoneCall, hint: "Potential customers" },
      { label: "Follow-up contacts", value: count("role", "Follow up"), icon: CalendarClock, hint: "Require continued engagement" },
    ],
    "follow-ups": [
      { label: "Total follow-ups", value: rows.length, icon: PhoneCall, hint: "All scheduled activity" },
      { label: "Pending", value: count("status", "Pending"), icon: CalendarClock, hint: "Awaiting completion" },
      { label: "Completed", value: count("status", "Completed"), icon: ClipboardCheck, hint: "Logged outcomes" },
    ],
    "site-surveys": [
      { label: "Total surveys", value: rows.length, icon: ClipboardCheck, hint: "Scheduled and completed" },
      { label: "Scheduled", value: count("status", "Scheduled"), icon: CalendarClock, hint: "Upcoming site visits" },
      { label: "Feasible", value: count("feasibility", "Feasible") + count("feasibility", "Feasible with changes"), icon: HardHat, hint: "Suitable for solar" },
    ],
    quotations: [
      { label: "Total quotations", value: rows.length, icon: FileText, hint: "Customer proposals" },
      { label: "Awaiting response", value: count("status", "Sent"), icon: CalendarClock, hint: "Sent to customers" },
      { label: "Accepted", value: count("status", "Accepted"), icon: ClipboardCheck, hint: "Ready for order" },
    ],
    orders: [
      { label: "Total orders", value: rows.length, icon: ShoppingCart, hint: "Confirmed sales" },
      { label: "Partially paid", value: count("paymentStatus", "Partially Paid"), icon: FileText, hint: "Payment in progress" },
      { label: "Order value", value: rows.reduce((sum, row) => sum + Number(row.value ?? 0), 0), icon: Package, hint: "Total value", format: formatINR },
    ],
    installations: [
      { label: "Total projects", value: rows.length, icon: HardHat, hint: "Installation pipeline" },
      { label: "In progress", value: count("stage", "Installing") + count("stage", "Commissioning"), icon: ClipboardCheck, hint: "On site or commissioning" },
      { label: "Completed", value: count("stage", "Completed"), icon: Users, hint: "Handed over" },
    ],
    inventory: [
      { label: "Stock items", value: rows.length, icon: Package, hint: "Tracked products" },
      { label: "Low stock", value: count("stockStatus", "Low stock"), icon: ClipboardCheck, hint: "At or below threshold" },
      { label: "Stock value", value: rows.reduce((sum, row) => sum + Number(row.quantity ?? 0) * Number(row.purchasePrice ?? 0), 0), icon: ShoppingCart, hint: "At purchase cost", format: formatINR },
    ],
  };
  return specs[module];
}
