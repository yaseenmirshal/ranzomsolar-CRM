"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Users, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatINR, formatPhone } from "@/lib/format";
import { archiveCustomer, saveCustomer } from "./actions";
import { customerSchema, type CustomerInput } from "./schema";
import type { CustomerListItem } from "./types";

const emptyCustomer: CustomerInput = {
  name: "",
  phone: "",
  email: "",
  address: "",
  district: "",
  category: "RESIDENTIAL",
};

export function CustomersView({
  initialCustomers,
  canManage,
  canArchive,
}: {
  initialCustomers: CustomerListItem[];
  canManage: boolean;
  canArchive: boolean;
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [editing, setEditing] = useState<CustomerListItem | null>(null);
  const [archiving, setArchiving] = useState<CustomerListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CustomerInput>(emptyCustomer);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | CustomerInput["category"]>("ALL");
  const visibleCustomers = useMemo(
    () => categoryFilter === "ALL" ? customers : customers.filter((customer) => customer.category === categoryFilter),
    [categoryFilter, customers],
  );

  const columns = useMemo<ColumnDef<CustomerListItem, unknown>[]>(() => [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <Link
          href={`/customers/${row.original.id}`}
          className="font-medium hover:text-brand"
          onClick={(event) => event.stopPropagation()}
        >
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => formatPhone(row.original.phone) },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
    { accessorKey: "district",     header: "Region", cell: ({ row }) => row.original.district ?? "—" },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <StatusBadge value={row.original.category === "RESIDENTIAL" ? "Individual" : "Organization"} />,
    },
    { accessorKey: "projects", header: "Projects" },
    {
      accessorKey: "projectValue",
      header: "Project value",
      cell: ({ row }) => formatINR(Number(row.original.projectValue)),
    },
    {
      accessorKey: "outstandingBalance",
      header: "Outstanding",
      cell: ({ row }) => formatINR(Number(row.original.outstandingBalance)),
    },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => !canManage && !canArchive ? null : (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canManage && <DropdownMenuItem onSelect={() => beginEdit(row.original)}><Pencil />Edit</DropdownMenuItem>}
              {canArchive && <DropdownMenuItem destructive onSelect={() => setArchiving(row.original)}><Archive />Archive</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [canArchive, canManage]);

  function beginEdit(customer: CustomerListItem) {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? "",
      address: customer.address ?? "",
      district: customer.district ?? "",
      category: customer.category,
    });
    setFormError("");
    setDialogOpen(true);
  }

  function beginCreate() {
    setEditing(null);
    setForm(emptyCustomer);
    setFormError("");
    setDialogOpen(true);
  }

  async function submitCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the customer details.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const result = await saveCustomer(parsed.data, editing?.id);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setCustomers((current) => editing
        ? current.map((customer) => customer.id === result.customer.id ? result.customer : customer)
        : [result.customer, ...current]);
      setDialogOpen(false);
      toast.success(editing ? "Customer updated." : "Customer added.");
    } catch {
      setFormError("The customer could not be saved. Check your connection and try again.");
      toast.error("Could not save customer.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmArchive() {
    if (!archiving) return;
    try {
      const result = await archiveCustomer(archiving.id);
      if (!result.success) {
        toast.error(result.error ?? "Could not archive customer.");
        return;
      }
      setCustomers((current) => current.filter((customer) => customer.id !== archiving.id));
      toast.success("Customer archived.");
    } catch {
      toast.error("Could not archive customer. Check your connection and try again.");
    }
  }

  const individuals = customers.filter((customer) => customer.category === "RESIDENTIAL").length;
  const organizations = customers.length - individuals;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description="A central record of people and organizations your business works with."
        actions={canManage ? <Button onClick={beginCreate}><Plus />Add customer</Button> : undefined}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Active customers" value={customers.length} icon={Users} hint="Current records" />
        <KpiCard label="Individuals" value={individuals} icon={Users} hint="Personal customers" />
        <KpiCard label="Organizations" value={organizations} icon={Users} hint="Business accounts" />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter customers by category">
        {([
          ["ALL", "All", customers.length],
          ["RESIDENTIAL", "Individuals", individuals],
          ["COMMERCIAL", "Organizations", organizations],
        ] as const).map(([value, label, count]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={categoryFilter === value ? "default" : "outline"}
            aria-pressed={categoryFilter === value}
            onClick={() => setCategoryFilter(value)}
          >
            {label}<span className="opacity-75">{count}</span>
          </Button>
        ))}
      </div>

      <DataTable
        data={visibleCustomers}
        columns={columns}
        searchPlaceholder="Search name, phone, email, district…"
        emptyTitle="No customers yet"
        emptyDescription="Add a customer to start building their project history."
        onExport={() => downloadCsv("customers.csv", visibleCustomers.map((customer) => ({
          Name: customer.name,
          Phone: customer.phone,
          Email: customer.email ?? "",
          Address: customer.address ?? "",
          Region: customer.district ?? "",
          Category: customer.category === "RESIDENTIAL" ? "Individual" : "Organization",
          Projects: customer.projects,
          "Project Value (INR)": customer.projectValue,
          "Outstanding (INR)": customer.outstandingBalance,
          "Created At": customer.createdAt,
        })))}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit customer" : "Add customer"}</DialogTitle>
            <DialogDescription>Keep contact details accurate to avoid duplicate customer records.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCustomer}>
            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer-name">Full name / business name</Label>
                <Input id="customer-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={160} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer-phone">Phone number</Label>
                <Input id="customer-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required autoComplete="tel" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer-email">Email</Label>
                <Input id="customer-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customer-category">Category</Label>
                  <select id="customer-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value === "COMMERCIAL" ? "COMMERCIAL" : "RESIDENTIAL" })} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
                      <option value="RESIDENTIAL">Individual</option>
                      <option value="COMMERCIAL">Organization</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customer-district">Region</Label>
                  <Input id="customer-district" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} maxLength={100} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer-address">Address</Label>
                <textarea id="customer-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} maxLength={500} className="min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
              </div>
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editing ? "Save changes" : "Add customer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!archiving}
        onOpenChange={(open) => !open && setArchiving(null)}
        title="Archive customer?"
        description={`${archiving?.name ?? "This customer"} will be hidden from the active list. Related financial records will be preserved.`}
        confirmLabel="Archive customer"
        onConfirm={() => { void confirmArchive(); }}
      />

    </div>
  );
}
