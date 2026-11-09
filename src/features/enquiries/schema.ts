import { z } from "zod";
import { CAPACITIES, CATEGORIES, DCR_TYPES, ENQUIRY_STATUSES, INVERTER_BRANDS, PANEL_BRANDS, PIPELINE_STAGES, ROOF_TYPES, SOLAR_TYPES } from "@/types";

const phone = z.string().trim().min(7, "Enter a valid phone number").max(24, "Enter a valid phone number").refine((value) => {
  const normalized = value.replace(/[().\s-]/g, "");
  const digits = normalized.replace(/\D/g, "");
  return /^\+?\d+$/.test(normalized) && digits.length >= 7 && digits.length <= 15;
}, "Enter a valid phone number");
const money = z.string().trim().refine((v) => v === "" || (/^\d+(\.\d+)?$/.test(v) && Number(v) >= 0), "Enter a valid amount in ₹");
const opt = <T extends readonly [string, ...string[]]>(vals: T) => z.union([z.enum(vals), z.literal("")]);

export const enquirySchema = z.object({
  // 1. Customer
  name: z.string().trim().min(2, "Customer name is required"),
  category: z.enum(CATEGORIES),
  status: z.enum(ENQUIRY_STATUSES),
  stage: z.enum(PIPELINE_STAGES),
  assignedTo: z.string().min(1, "Assign a team member"),
  source: z.string().trim(),
  // 2. Contact
  contactNo: phone,
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address")]),
  // 3. Location and delivery
  place: z.string().trim().min(2, "Place is required"),
  roofType: opt(ROOF_TYPES),
  // 4. Products and services
  solarType: opt(SOLAR_TYPES),
  systemCapacity: opt(CAPACITIES),
  dcrType: opt(DCR_TYPES),
  panelBrand: opt(PANEL_BRANDS),
  inverterBrand: opt(INVERTER_BRANDS),
  workDescription: z.string().trim(),
  // 5. Referral
  referral: z.string().trim(),
  referralContact: z.union([z.literal(""), phone]),
  // 6. Financial
  quoted: money,
  cashReceived: money,
  startDate: z.string(),
  nextFollowUp: z.string(),
  // 7. Documentation
  documentation: z.boolean(),
  documents: z.array(z.string()),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;

export const emptyEnquiry = (assignedTo: string): EnquiryFormValues => ({
  name: "", category: "Individual", status: "Lead", stage: "New", assignedTo, source: "Website",
  contactNo: "", email: "", place: "", roofType: "", solarType: "", systemCapacity: "", dcrType: "", panelBrand: "", inverterBrand: "",
  workDescription: "", referral: "", referralContact: "", quoted: "", cashReceived: "", startDate: "", nextFollowUp: "", documentation: false, documents: [],
});
