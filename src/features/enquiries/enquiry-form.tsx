"use client";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { FormField, FormSection } from "@/components/shared/form-field";
import { newId, useDataStore } from "@/store/data-store";
import { formatPhone } from "@/lib/format";
import { CAPACITIES, CATEGORIES, DCR_TYPES, ENQUIRY_STATUSES, INVERTER_BRANDS, PANEL_BRANDS, PIPELINE_STAGES, ROOF_TYPES, SOLAR_TYPES, type Enquiry } from "@/types";
import { emptyEnquiry, enquirySchema, type EnquiryFormValues } from "./schema";

const NONE = "__none__";
const SOURCES = ["Walk-in", "Referral", "Instagram", "Facebook", "Website", "Google Search", "Existing Customer", "Other"];

function SelectField({ id, value, onChange, options, placeholder = "Select…", invalid }: { id: string; value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string; invalid?: boolean }) {
  return (
    <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger id={id} aria-invalid={invalid}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}><span className="text-muted-foreground">{placeholder}</span></SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

const toValues = (e: Enquiry): EnquiryFormValues => ({
  name: e.name, category: e.category, status: e.status, stage: e.stage, assignedTo: e.assignedTo, source: e.source,
  contactNo: e.contactNo, email: e.email ?? "", place: e.place, roofType: e.roofType ?? "", solarType: e.solarType ?? "",
  systemCapacity: e.systemCapacity ?? "", dcrType: e.dcrType ?? "", panelBrand: e.panelBrand ?? "", inverterBrand: e.inverterBrand ?? "",
  workDescription: e.workDescription ?? "", referral: e.referral ?? "", referralContact: e.referralContact ?? "",
  quoted: e.quoted ? String(e.quoted) : "", cashReceived: e.cashReceived ? String(e.cashReceived) : "",
  startDate: e.startDate ?? "", nextFollowUp: e.nextFollowUp ?? "", documentation: !!e.documentation, documents: e.documents,
});

export function EnquiryFormDialog({ open, onOpenChange, enquiry }: { open: boolean; onOpenChange: (o: boolean) => void; enquiry?: Enquiry }) {
  const team = useDataStore((s) => s.team);
  const enquiries = useDataStore((s) => s.enquiries);
  const add = useDataStore((s) => s.add);
  const patch = useDataStore((s) => s.patch);

  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    values: enquiry ? toValues(enquiry) : emptyEnquiry(team[0]?.name ?? ""),
  });
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = form;
  const referral = useWatch({ control, name: "referral" });
  const quoted = useWatch({ control, name: "quoted" });
  const err = (k: keyof EnquiryFormValues) => errors[k]?.message as string | undefined;

  const onSubmit = handleSubmit(async (v) => {
    const now = new Date().toISOString();
    const contactNo = v.contactNo.trim();
    const body = {
      name: v.name, category: v.category, status: v.status, stage: v.stage, assignedTo: v.assignedTo, source: v.source,
      contactNo, email: v.email || undefined, place: v.place,
      roofType: v.roofType || undefined, solarType: v.solarType || undefined, systemCapacity: v.systemCapacity || undefined,
      dcrType: v.dcrType || undefined, panelBrand: v.panelBrand || undefined, inverterBrand: v.inverterBrand || undefined,
      workDescription: v.workDescription || undefined, referral: v.referral || undefined,
      referralContact: v.referralContact.trim() || undefined,
      quoted: v.quoted ? Number(v.quoted) : undefined, cashReceived: v.cashReceived ? Number(v.cashReceived) : 0,
      startDate: v.startDate || undefined, nextFollowUp: v.nextFollowUp || undefined, documentation: v.documentation, documents: v.documents,
    };
    if (enquiry) {
      await patch("enquiries", enquiry.id, body);
      toast.success("Enquiry updated", { description: v.name });
    } else {
      const siNo = Math.max(1000, ...enquiries.map((e) => e.siNo)) + 1;
      await add("enquiries", { ...body, id: newId("enq"), siNo, createdAt: now, updatedAt: now });
      await add("activity", { id: newId("act"), text: `New enquiry added: ${v.name}`, at: now, kind: "enquiry" });
      toast.success("Enquiry created", { description: `${v.name} · SI #${siNo}` });
    }
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{enquiry ? `Edit enquiry · SI #${enquiry.siNo}` : "Add enquiry"}</DialogTitle>
          <DialogDescription>Only name, phone and place are required. Everything else can be filled in later.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogBody className="space-y-7">
            <FormSection title="1. Customer details">
              <FormField id="name" label="Customer name" required error={err("name")}><Input id="name" aria-invalid={!!errors.name} {...register("name")} /></FormField>
              <FormField id="category" label="Category">
                <Controller control={control} name="category" render={({ field }) => <SelectField id="category" value={field.value} onChange={field.onChange} options={CATEGORIES} />} />
              </FormField>
              <FormField id="status" label="Status" hint="Existing lifecycle: Lead, In-Progress, Paused, Completed.">
                <Controller control={control} name="status" render={({ field }) => <SelectField id="status" value={field.value} onChange={field.onChange} options={ENQUIRY_STATUSES} />} />
              </FormField>
              <FormField id="stage" label="Pipeline stage" hint="Optional configurable stage.">
                <Controller control={control} name="stage" render={({ field }) => <SelectField id="stage" value={field.value} onChange={field.onChange} options={PIPELINE_STAGES} />} />
              </FormField>
              <FormField id="assignedTo" label="Assigned to" error={err("assignedTo")}>
                <Controller control={control} name="assignedTo" render={({ field }) => <SelectField id="assignedTo" value={field.value} onChange={field.onChange} options={team.map((t) => t.name)} />} />
              </FormField>
              <FormField id="source" label="Lead source">
                <Controller control={control} name="source" render={({ field }) => <SelectField id="source" value={field.value} onChange={field.onChange} options={SOURCES} />} />
              </FormField>
            </FormSection>

            <FormSection title="2. Contact details">
              <FormField id="contactNo" label="Phone number" required error={err("contactNo")} hint="Include country code for international numbers.">
                <Input id="contactNo" inputMode="tel" placeholder="+1 555 123 4567" aria-invalid={!!errors.contactNo} {...register("contactNo", { onBlur: (e) => { e.target.value = formatPhone(e.target.value); } })} />
              </FormField>
              <FormField id="email" label="Email" error={err("email")}><Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} /></FormField>
            </FormSection>

            <FormSection title="3. Address & delivery preference">
              <FormField id="place" label="Location" required error={err("place")}><Input id="place" placeholder="City, region or service area" aria-invalid={!!errors.place} {...register("place")} /></FormField>
              <FormField id="roofType" label="Delivery mode">
                <Controller control={control} name="roofType" render={({ field }) => <SelectField id="roofType" value={field.value} onChange={field.onChange} options={ROOF_TYPES} />} />
              </FormField>
            </FormSection>

            <FormSection title="4. Products & services" description="Capture the offering, package and requirements discussed with the customer.">
              <FormField id="solarType" label="Offering"><Controller control={control} name="solarType" render={({ field }) => <SelectField id="solarType" value={field.value ?? ""} onChange={field.onChange} options={SOLAR_TYPES} />} /></FormField>
              <FormField id="systemCapacity" label="Plan tier"><Controller control={control} name="systemCapacity" render={({ field }) => <SelectField id="systemCapacity" value={field.value ?? ""} onChange={field.onChange} options={CAPACITIES} />} /></FormField>
              <FormField id="dcrType" label="Service level"><Controller control={control} name="dcrType" render={({ field }) => <SelectField id="dcrType" value={field.value ?? ""} onChange={field.onChange} options={DCR_TYPES} />} /></FormField>
              <FormField id="panelBrand" label="Package"><Controller control={control} name="panelBrand" render={({ field }) => <SelectField id="panelBrand" value={field.value ?? ""} onChange={field.onChange} options={PANEL_BRANDS} />} /></FormField>
              <FormField id="inverterBrand" label="Billing cycle"><Controller control={control} name="inverterBrand" render={({ field }) => <SelectField id="inverterBrand" value={field.value ?? ""} onChange={field.onChange} options={INVERTER_BRANDS} />} /></FormField>
              <FormField id="workDescription" label="Requirements / notes" className="sm:col-span-2"><Textarea id="workDescription" {...register("workDescription")} /></FormField>
            </FormSection>

            <FormSection title="5. Referral information">
              <FormField id="referral" label="Referral" hint="Who referred this customer?"><Input id="referral" {...register("referral")} /></FormField>
              {referral?.trim() && <FormField id="referralContact" label="Referral contact" error={err("referralContact")}><Input id="referralContact" inputMode="tel" aria-invalid={!!errors.referralContact} {...register("referralContact")} /></FormField>}
            </FormSection>

            <FormSection title="6. Financial information" description="Amounts in Indian Rupees (₹).">
              <FormField id="quoted" label="Quoted (₹)" error={err("quoted")}><Input id="quoted" inputMode="decimal" aria-invalid={!!errors.quoted} {...register("quoted")} /></FormField>
              {quoted?.trim() && <FormField id="cashReceived" label="Cash received (₹)" error={err("cashReceived")}><Input id="cashReceived" inputMode="decimal" aria-invalid={!!errors.cashReceived} {...register("cashReceived")} /></FormField>}
              <FormField id="startDate" label="Start date"><Input id="startDate" type="date" {...register("startDate")} /></FormField>
              <FormField id="nextFollowUp" label="Next follow-up"><Input id="nextFollowUp" type="date" {...register("nextFollowUp")} /></FormField>
            </FormSection>

            <FormSection title="7. Documentation">
              <div className="flex items-center gap-2 sm:col-span-2">
                <Controller control={control} name="documentation" render={({ field }) => <Checkbox id="documentation" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />} />
                <label htmlFor="documentation" className="text-sm">Documentation completed</label>
              </div>
              <div className="sm:col-span-2"><Controller control={control} name="documents" render={({ field }) => <FileDropzone value={field.value} onChange={field.onChange} />} /></div>
            </FormSection>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{enquiry ? "Save changes" : "Create enquiry"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
