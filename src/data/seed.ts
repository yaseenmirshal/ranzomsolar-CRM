/**
 * Fictional sample CRM data. Nothing here is real customer or company data.
 * Dates are generated relative to "today" so tasks and follow-ups stay current.
 */
import { addDays, format, subDays } from "date-fns";
import type {
  ActivityEntry, AppNotification, Capacity, Category, ChecklistItem, Contact, Enquiry, EnquiryStatus,
  FollowUp, FollowUpType, InstallationProject, InventoryItem, Invoice, Order, Payment, PipelineStage,
  Quotation, ServiceRequest, SiteSurvey, SolarType, StockMovement, TeamMember,
} from "@/types";

export interface SeedData {
  team: TeamMember[];
  enquiries: Enquiry[];
  contacts: Contact[];
  followUps: FollowUp[];
  surveys: SiteSurvey[];
  quotations: Quotation[];
  orders: Order[];
  installations: InstallationProject[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  invoices: Invoice[];
  payments: Payment[];
  services: ServiceRequest[];
  activity: ActivityEntry[];
  notifications: AppNotification[];
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString();
const day = (d: Date) => format(d, "yyyy-MM-dd");

export const TEAM: TeamMember[] = [
  { id: "t1", name: "Avery Morgan", role: "Sales Executive" },
  { id: "t2", name: "Jordan Lee", role: "Account Manager" },
  { id: "t3", name: "Taylor Reed", role: "Project Coordinator" },
  { id: "t4", name: "Casey Patel", role: "Operations Lead" },
  { id: "t5", name: "Riley Chen", role: "Finance" },
];

const NAMES = [
  "Alex Morgan", "Sam Rivera", "Jamie Chen", "Morgan Blake", "Riley Foster", "Casey Jordan",
  "Taylor Brooks", "Avery Quinn", "Cameron Ellis", "Drew Parker", "Skyler Reed", "Robin Hayes",
  "Jesse Kim", "Kendall Price", "Elliot Gray", "Parker Singh", "Reese Taylor", "Rowan Murphy",
  "Finley James", "Harper Lane", "Emerson Cole", "Dakota Bell", "Sage Turner", "Logan Wells",
];
const PLACES = ["Austin", "Toronto", "London", "Singapore", "Sydney", "Berlin", "Dublin", "Nairobi", "Mumbai", "Dubai", "Tokyo", "Amsterdam"];
const COMMERCIAL_PREFIX = ["Northstar", "Brightside", "Evergreen", "Bluebird", "Summit", "Cedar"];
const COMMERCIAL_SUFFIX = ["Consulting", "Design Studio", "Foods", "Software", "Logistics", "Wellness"];
const SOURCES = ["Referral", "Website", "LinkedIn", "Event", "Email", "Search", "Existing Customer"];
const REFERRERS = ["Alex M", "Jordan L", "Taylor R", "Casey P", "Riley C"];

const capacityFor = (cat: Category, r: number): Capacity => {
  if (cat === "Organization") return (["Standard", "Growth", "Enterprise"] as Capacity[])[Math.floor(r * 3)];
  return (["Starter", "Standard", "Growth"] as Capacity[])[Math.floor(r * 3)];
};
const tierIndex = (c: Capacity) => Math.max(1, ["Starter", "Standard", "Growth", "Enterprise"].indexOf(c) + 1);

export function buildSeed(today = new Date()): SeedData {
  const r = rng(20260);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
  const phone = () => `9${Math.floor(400000000 + r() * 599999999)}`;

  const enquiries: Enquiry[] = [];
  const lifecycle: [EnquiryStatus, PipelineStage][] = [
    ["Lead", "New"], ["Lead", "Contacted"], ["Lead", "Qualified"],
    ["In-Progress", "Follow-up Required"], ["In-Progress", "Proposal Sent"], ["In-Progress", "Negotiation"],
    ["In-Progress", "Won"], ["Paused", "Follow-up Required"], ["Completed", "Closed"],
  ];
  for (let i = 0; i < 24; i++) {
    const commercial = i % 5 === 4;
    const category: Category = commercial ? "Organization" : "Individual";
    const name = commercial ? `${pick(COMMERCIAL_PREFIX)} ${pick(COMMERCIAL_SUFFIX)}` : NAMES[i];
    const [status, stage] = lifecycle[i % lifecycle.length];
    const capacity = capacityFor(category, r());
    const tier = tierIndex(capacity);
    const quoted = status === "Lead" ? undefined : Math.round(tier * (52000 + r() * 8000) / 1000) * 1000;
    const created = subDays(today, Math.floor(r() * 150) + 2);
    const referral = r() > 0.55 ? pick(REFERRERS) : undefined;
    enquiries.push({
      id: `enq-${i + 1}`,
      siNo: 1001 + i,
      name,
      contactNo: phone(),
      email: commercial ? undefined : `${name.split(" ")[0].toLowerCase()}@example.com`,
      place: pick(PLACES),
      category,
      solarType: pick<SolarType>(["Product", "Service", "Subscription", "Other"]),
      systemCapacity: capacity,
      roofType: pick(["Remote", "On-site", "Hybrid"] as const),
      dcrType: pick(["Basic", "Standard", "Premium"] as const),
      panelBrand: pick(["Core", "Plus", "Complete"] as const),
      inverterBrand: pick(["One-time", "Monthly", "Annual"] as const),
      referral,
      referralContact: referral ? phone() : undefined,
      quoted,
      cashReceived: status === "Completed" ? quoted : status === "In-Progress" && stage !== "Proposal Sent" && quoted ? Math.round(quoted * 0.3) : 0,
      documentation: status === "Completed",
      documents: status === "Completed" ? ["Handover-pack.pdf"] : [],
      startDate: status === "Lead" ? undefined : day(addDays(created, 14)),
      status,
      stage,
      workDescription: `${pick(["Product inquiry", "Service request", "Account expansion", "New business opportunity"])} for ${category.toLowerCase()} customer.`,
      assignedTo: TEAM[i % 3].name,
      nextFollowUp: status === "Completed" ? undefined : day(addDays(today, (i % 9) - 3)),
      source: referral ? "Referral" : pick(SOURCES),
      createdAt: iso(created),
      updatedAt: iso(created),
    });
  }

  const contacts: Contact[] = enquiries.slice(0, 16).map((e, i) => ({
    id: `con-${i + 1}`,
    name: e.category === "Organization" ? `${pick(NAMES)} (Manager)` : e.name,
    phone: e.contactNo,
    email: e.email,
    role: i % 3 === 0 ? "Customer" : "Lead",
    lastContacted: day(subDays(today, i % 12)),
    enquiryId: e.id,
    createdAt: e.createdAt,
    updatedAt: e.createdAt,
  }));

  const fuTypes: FollowUpType[] = ["Call", "Email", "Meeting", "Video call", "Other"];
  const followUps: FollowUp[] = enquiries
    .filter((e) => e.nextFollowUp)
    .map((e, i) => {
      const done = i % 6 === 0;
      return {
        id: `fu-${i + 1}`,
        enquiryId: e.id,
        customer: e.name,
        contactNo: e.contactNo,
        date: e.nextFollowUp as string,
        time: `${String(9 + (i % 8)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
        assignedTo: e.assignedTo,
        type: fuTypes[i % fuTypes.length],
        notes: "Discuss requirements, timing and the best next step.",
        outcome: done ? "Customer interested, requested a proposal." : undefined,
        nextAction: done ? "Send proposal" : undefined,
        status: done ? "Completed" : "Pending",
        createdAt: e.createdAt,
        updatedAt: e.createdAt,
      } satisfies FollowUp;
    });

  const surveys: SiteSurvey[] = enquiries.slice(0, 12).map((e, i) => {
    const done = i % 3 !== 0;
    return {
      id: `sv-${i + 1}`,
      enquiryId: e.id,
      customer: e.name,
      date: day(done ? subDays(today, 3 + i) : addDays(today, 1 + (i % 5))),
      surveyor: "Taylor Reed",
      location: e.place,
      category: e.category,
      roofType: e.roofType ?? "Remote",
      roofCondition: pick(["Good", "Good", "Fair", "Needs repair"] as const),
      roofAreaSqFt: Math.round(tierIndex(e.systemCapacity ?? "Standard") * 85 + r() * 120),
      electricityConnection: e.category === "Organization" ? "Three phase" : pick(["Single phase", "Three phase"] as const),
      sanctionedLoadKw: Math.round(tierIndex(e.systemCapacity ?? "Standard") * 1.2),
      requiredCapacity: e.systemCapacity,
      shading: pick(["No special requirements", "Needs additional review", "Standard setup"]),
      electricityBill: Math.round(2500 + r() * 9000),
      photos: [],
      notes: "Sample task notes. Requirements reviewed and next steps recorded.",
      feasibility: done ? pick(["On track", "On track", "Needs follow-up"] as const) : "Pending",
      status: done ? "Completed" : "Scheduled",
      createdAt: iso(subDays(today, 10)),
      updatedAt: iso(subDays(today, 10)),
    } satisfies SiteSurvey;
  });

  const quotations: Quotation[] = enquiries
    .filter((e) => e.quoted)
    .map((e, i) => {
      const tier = tierIndex(e.systemCapacity ?? "Standard");
      const packageCost = Math.round(tier * 24000);
      const setupCost = Math.round(tier * 9000);
      const status = e.stage === "Proposal Sent" ? "Sent" : e.status === "Paused" ? "Expired" : e.stage === "Follow-up Required" ? "Draft" : "Accepted";
      return {
        id: `qt-${i + 1}`,
        number: `RZP-2026-${String(101 + i).padStart(4, "0")}`,
        enquiryId: e.id,
        customer: e.name,
        solarType: e.solarType ?? "Service",
        capacity: e.systemCapacity ?? "Standard",
        panelDetails: `${e.solarType ?? "Service"} package`,
        inverterDetails: `${e.systemCapacity ?? "Standard"} service plan`,
        batteryDetails: undefined,
        mountingStructure: "Standard delivery plan",
        lines: [
          { id: "l1", description: "Product or service package", quantity: 1, unitPrice: packageCost },
          { id: "l2", description: "Onboarding and setup", quantity: 1, unitPrice: setupCost },
          { id: "l3", description: "Additional services", quantity: 1, unitPrice: Math.round(tier * 8000) },
        ],
        installationCharges: Math.round(tier * 4000),
        otherCosts: 5000,
        discount: 0,
        taxPercent: 8.9,
        validUntil: day(addDays(today, status === "Expired" ? -10 : 20)),
        paymentTerms: "50% at start, 50% on completion",
        notes: "Sample proposal — figures are illustrative only.",
        status,
        createdAt: iso(subDays(today, 40 - i)),
        updatedAt: iso(subDays(today, 40 - i)),
      } satisfies Quotation;
    });

  const accepted = quotations.filter((q) => q.status === "Accepted");
  const total = (q: Quotation) => {
    const sub = q.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0) + q.installationCharges + q.otherCosts - q.discount;
    return Math.round(sub * (1 + q.taxPercent / 100));
  };
  const orders: Order[] = accepted.map((q, i) => {
    const value = total(q);
    const advance = Math.round(value * 0.3);
    return {
      id: `ord-${i + 1}`,
      number: `RZO-2026-${String(201 + i).padStart(4, "0")}`,
      quotationId: q.id,
      enquiryId: q.enquiryId,
      customer: q.customer,
      orderDate: day(subDays(today, 30 - i * 2)),
      value,
      advance,
      paymentStatus: i % 3 === 0 ? "Paid" : "Partially Paid",
      expectedInstallation: day(addDays(today, 7 + i * 3)),
      createdAt: iso(subDays(today, 30 - i * 2)),
      updatedAt: iso(subDays(today, 30 - i * 2)),
    };
  });

  const checklistLabels = ["Kickoff completed", "Requirements confirmed", "Work in progress", "Quality review", "Customer review", "Final updates", "Project handoff"];
  const stages = ["Planning", "In Progress", "On Hold", "Completed"] as const;
  const installations: InstallationProject[] = orders.map((o, i) => {
    const stage = stages[i % stages.length];
    const doneCount = stage === "Completed" ? 7 : stage === "In Progress" ? 3 : stage === "On Hold" ? 1 : 0;
    const enq = enquiries.find((e) => e.id === o.enquiryId);
    const checklist: ChecklistItem[] = checklistLabels.map((label, k) => ({ id: `c${k}`, label, done: k < doneCount }));
    return {
      id: `ins-${i + 1}`,
      name: `${enq?.name ?? o.customer} project`,
      orderId: o.id,
      enquiryId: o.enquiryId,
      customer: o.customer,
      team: i % 2 ? "Team Alpha" : "Team Bravo",
      startDate: day(addDays(today, i * 2 - 8)),
      endDate: day(addDays(today, i * 2 - 4)),
      capacity: enq?.systemCapacity ?? "Standard",
      equipment: "Project resources and deliverables",
      checklist,
      stage,
      photos: [],
      completionDate: stage === "Completed" ? day(subDays(today, 4)) : undefined,
      createdAt: o.createdAt,
      updatedAt: o.createdAt,
    };
  });

  const inv = (n: number, name: string, category: InventoryItem["category"], brand: string, model: string, qty: number, unit: string, price: number, low: number): InventoryItem => ({
    id: `inv-${n}`, name, sku: `RZ-${category.slice(0, 3).toUpperCase()}-${String(n).padStart(3, "0")}`, category, brand, model,
    quantity: qty, unit, purchasePrice: price, lowStockThreshold: low, createdAt: iso(subDays(today, 90)), updatedAt: iso(subDays(today, 5)),
  });
  const inventory: InventoryItem[] = [
    inv(1, "Customer welcome kit", "Products", "Ranzom", "WELCOME-01", 120, "kits", 1800, 40),
    inv(2, "Printed brochures", "Supplies", "PaperCo", "BRO-02", 36, "packs", 800, 40),
    inv(3, "Branded notebooks", "Office", "NoteWorks", "NOTE-03", 64, "pcs", 400, 30),
    inv(4, "Demo tablet", "Equipment", "Techline", "TAB-04", 8, "pcs", 41500, 4),
    inv(5, "Portable display", "Equipment", "ViewPoint", "DSP-05", 3, "pcs", 78000, 3),
    inv(6, "Meeting room camera", "Equipment", "ConnectPro", "CAM-06", 5, "pcs", 16000, 2),
    inv(7, "Cloud workspace license", "Software", "CloudDesk", "LIC-07", 6, "licenses", 9800, 3),
    inv(8, "Onboarding service hours", "Services", "Ranzom", "SVC-08", 90, "hours", 6200, 30),
    inv(9, "Shipping boxes", "Supplies", "PackRight", "BOX-09", 800, "pcs", 62, 300),
    inv(10, "Event banners", "Supplies", "PrintLab", "BAN-10", 220, "pcs", 118, 25),
    inv(11, "Office adapters", "Office", "Techline", "ADP-11", 18, "pcs", 3200, 10),
    inv(12, "Customer gift cards", "Other", "GiftWorks", "GFT-12", 9, "pcs", 2400, 10),
    inv(13, "Product sample set", "Products", "Ranzom", "SMP-13", 260, "sets", 850, 100),
  ];
  const stockMovements: StockMovement[] = [
    { id: "sm-1", itemId: "inv-1", type: "In", quantity: 60, note: "Supplier delivery (demo)", date: day(subDays(today, 12)) },
    { id: "sm-2", itemId: "inv-4", type: "Out", quantity: 2, note: "Assigned to a customer demo (sample)", date: day(subDays(today, 6)) },
  ];

  const invoices: Invoice[] = orders.map((o, i) => {
    const status = o.paymentStatus === "Paid" ? "Paid" : i % 4 === 1 ? "Overdue" : "Partially Paid";
    return {
      id: `inv-doc-${i + 1}`,
      number: `RZI-2026-${String(301 + i).padStart(4, "0")}`,
      orderId: o.id,
      enquiryId: o.enquiryId,
      customer: o.customer,
      issueDate: o.orderDate,
      dueDate: day(addDays(new Date(o.orderDate), 20)),
      amount: o.value,
      status,
      createdAt: o.createdAt,
      updatedAt: o.createdAt,
    };
  });
  const payments: Payment[] = [];
  invoices.forEach((v, i) => {
    const adv = orders[i].advance;
    payments.push({ id: `pay-${payments.length + 1}`, receiptNo: `RZP-${String(401 + payments.length).padStart(4, "0")}`, invoiceId: v.id, customer: v.customer, amount: adv, date: v.issueDate, mode: pick(["UPI", "Bank Transfer", "Cheque"] as const), reference: "SAMPLE-REF", createdAt: v.createdAt, updatedAt: v.createdAt });
    if (v.status === "Paid") payments.push({ id: `pay-${payments.length + 1}`, receiptNo: `RZP-${String(401 + payments.length).padStart(4, "0")}`, invoiceId: v.id, customer: v.customer, amount: v.amount - adv, date: day(subDays(today, 5 + i)), mode: "Bank Transfer", reference: "SAMPLE-REF", createdAt: v.createdAt, updatedAt: v.createdAt });
  });

  const completedInstalls = installations.filter((x) => x.stage === "Completed");
  const services: ServiceRequest[] = (completedInstalls.length ? completedInstalls : installations.slice(0, 2)).slice(0, 4).map((x, i) => ({
    id: `srv-${i + 1}`,
    number: `RZS-${String(501 + i).padStart(4, "0")}`,
    enquiryId: x.enquiryId,
    customer: x.customer,
    installationRef: x.name,
    product: i % 2 ? "Customer portal" : "Account setup",
    warrantyUntil: day(addDays(today, 365 * (i % 2 ? 5 : 25))),
    issue: i % 2 ? "Customer needs help accessing their workspace." : "A recent order needs an update and review.",
    priority: pick(["Low", "Medium", "High"] as const),
    technician: "Casey Patel",
    visitDate: day(addDays(today, i + 1)),
    resolution: i === 0 ? "Access restored and customer notified." : undefined,
    status: i === 0 ? "Resolved" : i === 1 ? "Scheduled" : "Open",
    createdAt: iso(subDays(today, 6 - i)),
    updatedAt: iso(subDays(today, 6 - i)),
  }));

  const activity: ActivityEntry[] = [
    { id: "a1", text: `New enquiry added: ${enquiries[0].name}`, at: iso(subDays(today, 0)), kind: "enquiry", enquiryId: enquiries[0].id },
    { id: "a2", text: `Quotation ${quotations[0]?.number ?? ""} sent to ${quotations[0]?.customer ?? ""}`, at: iso(subDays(today, 1)), kind: "quotation" },
    { id: "a3", text: `Task completed for ${surveys[1].customer}`, at: iso(subDays(today, 2)), kind: "survey" },
    { id: "a4", text: `Payment received from ${payments[0]?.customer ?? ""}`, at: iso(subDays(today, 3)), kind: "payment" },
    { id: "a5", text: `Project started: ${installations[0]?.name ?? ""}`, at: iso(subDays(today, 4)), kind: "install" },
    { id: "a6", text: `Service request raised by ${services[0]?.customer ?? ""}`, at: iso(subDays(today, 5)), kind: "service" },
  ];
  const notifications: AppNotification[] = [
    { id: "n1", title: "Follow-ups due today", body: "You have follow-ups scheduled for today.", at: iso(today), read: false },
    { id: "n2", title: "Low stock", body: "Some inventory items are below their threshold.", at: iso(subDays(today, 1)), read: false },
    { id: "n3", title: "Demo data", body: "All records in this template are fictional demo data.", at: iso(subDays(today, 2)), read: true },
  ];

  return { team: TEAM, enquiries, contacts, followUps, surveys, quotations, orders, installations, inventory, stockMovements, invoices, payments, services, activity, notifications };
}
