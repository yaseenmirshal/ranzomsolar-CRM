import { z } from "zod";
import { CAPACITIES, CATEGORIES, DCR_TYPES, ENQUIRY_STATUSES, INVERTER_BRANDS, PANEL_BRANDS, PIPELINE_STAGES, ROOF_TYPES, SOLAR_TYPES } from "@/types";

const phone = z.string().trim().min(1, "Phone number is required").refine((v) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "").replace(/^\+/, "")) || /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10)), "Enter a valid 10-digit Indian mobile number");
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
  // 3. Property & location
  place: z.string().trim().min(2, "Place is required"),
  roofType: opt(ROOF_TYPES),
  // 4. Solar requirements
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
  name: "", category: "Residential", status: "Lead", stage: "New", assignedTo, source: "Walk-in",
  contactNo: "", email: "", place: "", roofType: "", solarType: "", systemCapacity: "", dcrType: "", panelBrand: "", inverterBrand: "",
  workDescription: "", referral: "", referralContact: "", quoted: "", cashReceived: "", startDate: "", nextFollowUp: "", documentation: false, documents: [],
});
