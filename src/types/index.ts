/** Typed models for the generic Ranzom CRM workspace. */

export const CATEGORIES = ["Individual", "Organization"] as const;
export const SOLAR_TYPES = ["Product", "Service", "Subscription", "Other"] as const;
export const CAPACITIES = ["Starter", "Standard", "Growth", "Enterprise"] as const;
export const ROOF_TYPES = ["Remote", "On-site", "Hybrid"] as const;
export const DCR_TYPES = ["Basic", "Standard", "Premium"] as const;
export const PANEL_BRANDS = ["Core", "Plus", "Complete"] as const;
export const INVERTER_BRANDS = ["One-time", "Monthly", "Annual"] as const;
export const ENQUIRY_STATUSES = ["Lead", "In-Progress", "Paused", "Completed"] as const;
export const CONTACT_ROLES = ["Lead", "Customer"] as const;
export const PIPELINE_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Follow-up Required",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Closed",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type SolarType = (typeof SOLAR_TYPES)[number];
export type Capacity = (typeof CAPACITIES)[number];
export type RoofType = (typeof ROOF_TYPES)[number];
export type DcrType = (typeof DCR_TYPES)[number];
export type PanelBrand = (typeof PANEL_BRANDS)[number];
export type InverterBrand = (typeof INVERTER_BRANDS)[number];
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type ContactRole = (typeof CONTACT_ROLES)[number];
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface BaseEntity {
  id: string;
  createdAt: string; // ISO
  updatedAt: string;
}

export interface Enquiry extends BaseEntity {
  siNo: number;
  name: string;
  contactNo: string;
  email?: string;
  place: string;
  category: Category;
  solarType?: SolarType;
  systemCapacity?: Capacity;
  roofType?: RoofType;
  dcrType?: DcrType;
  panelBrand?: PanelBrand;
  inverterBrand?: InverterBrand;
  referral?: string;
  referralContact?: string;
  quoted?: number;
  cashReceived?: number;
  documentation?: boolean;
  documents: string[];
  startDate?: string;
  status: EnquiryStatus;
  stage: PipelineStage;
  workDescription?: string;
  assignedTo: string;
  nextFollowUp?: string;
  source: string;
}

export interface Contact extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  role: ContactRole;
  lastContacted?: string;
  enquiryId: string; // Associated Company/Customer
}

export type FollowUpType = "Call" | "Email" | "Meeting" | "Video call" | "Other";
export type FollowUpStatus = "Pending" | "Completed" | "Rescheduled";

export interface FollowUp extends BaseEntity {
  enquiryId: string;
  customer: string;
  contactNo: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  assignedTo: string;
  type: FollowUpType;
  notes: string;
  outcome?: string;
  nextAction?: string;
  status: FollowUpStatus;
}

export type SurveyStatus = "Scheduled" | "Completed" | "Cancelled";
export type Feasibility = "On track" | "Needs follow-up" | "Blocked" | "Pending";

export interface SiteSurvey extends BaseEntity {
  enquiryId: string;
  customer: string;
  date: string;
  surveyor: string;
  location: string;
  category: Category;
  roofType: RoofType;
  roofCondition: "Good" | "Fair" | "Needs repair";
  roofAreaSqFt?: number;
  electricityConnection: "Single phase" | "Three phase";
  sanctionedLoadKw?: number;
  requiredCapacity?: Capacity;
  shading: string;
  electricityBill?: number;
  photos: string[];
  notes: string;
  feasibility: Feasibility;
  status: SurveyStatus;
}

export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";

export interface QuotationLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation extends BaseEntity {
  number: string;
  enquiryId: string;
  customer: string;
  solarType: SolarType;
  capacity: Capacity;
  panelDetails: string;
  inverterDetails: string;
  batteryDetails?: string;
  mountingStructure: string;
  lines: QuotationLine[];
  installationCharges: number;
  otherCosts: number;
  discount: number;
  taxPercent: number;
  validUntil: string;
  paymentTerms: string;
  notes?: string;
  status: QuotationStatus;
}

export type PaymentStatus = "Unpaid" | "Partially Paid" | "Paid";

export interface Order extends BaseEntity {
  number: string;
  quotationId: string;
  enquiryId: string;
  customer: string;
  orderDate: string;
  value: number;
  advance: number;
  paymentStatus: PaymentStatus;
  expectedInstallation?: string;
}

export type ProjectStage = "Planning" | "In Progress" | "On Hold" | "Completed";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface InstallationProject extends BaseEntity {
  name: string;
  orderId: string;
  enquiryId: string;
  customer: string;
  team: string;
  startDate: string;
  endDate?: string;
  capacity: Capacity;
  equipment: string;
  checklist: ChecklistItem[];
  stage: ProjectStage;
  photos: string[];
  completionDate?: string;
}

export type InventoryCategory =
  | "Products"
  | "Supplies"
  | "Equipment"
  | "Services"
  | "Software"
  | "Office"
  | "Other";

export interface InventoryItem extends BaseEntity {
  name: string;
  sku: string;
  category: InventoryCategory;
  brand: string;
  model: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  lowStockThreshold: number;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: "In" | "Out";
  quantity: number;
  note: string;
  date: string;
}

export type InvoiceStatus = "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue";

export interface Invoice extends BaseEntity {
  number: string;
  orderId?: string;
  enquiryId: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  notes?: string;
}

export type PaymentMode = "UPI" | "Bank Transfer" | "Cash" | "Cheque" | "Card";

export interface Payment extends BaseEntity {
  receiptNo: string;
  invoiceId: string;
  customer: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  reference?: string;
}

export type ServicePriority = "Low" | "Medium" | "High" | "Urgent";
export type ServiceStatus = "Open" | "Scheduled" | "In Progress" | "Resolved";

export interface ServiceRequest extends BaseEntity {
  number: string;
  enquiryId: string;
  customer: string;
  installationRef: string;
  product: string;
  warrantyUntil: string;
  issue: string;
  priority: ServicePriority;
  technician: string;
  visitDate?: string;
  resolution?: string;
  status: ServiceStatus;
}

export interface ActivityEntry {
  id: string;
  enquiryId?: string;
  text: string;
  at: string;
  kind: "enquiry" | "followup" | "survey" | "quotation" | "order" | "install" | "payment" | "service";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
}
