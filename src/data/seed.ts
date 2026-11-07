/**
 * Fictional demonstration data (Kerala-flavoured). Nothing here is real customer or company data.
 * Dates are generated relative to "today" so follow-ups/surveys always look current.
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
  { id: "t1", name: "Anoop Krishnan", role: "Sales Executive" },
  { id: "t2", name: "Fathima Rasheed", role: "Customer Relations" },
  { id: "t3", name: "Sreejith Menon", role: "Site Surveyor" },
  { id: "t4", name: "Nikhil Das", role: "Installation Lead" },
  { id: "t5", name: "Reshma Pillai", role: "Accounts" },
];

const NAMES = [
  "Rajesh Nair", "Sulaiman Koya", "Deepa Varghese", "Abdul Latheef", "Meera Menon", "Jithin Thomas",
  "Shabana Beegum", "Vinod Kumar", "Anitha Chandran", "Muhammed Shafi", "Lekshmi Prabhu", "George Mathew",
  "Haris Pookoya", "Remya Suresh", "Biju Cherian", "Noufal Ali", "Sindhu Rajan", "Prasad Warrier",
  "Jasmine Basheer", "Ashraf Kadavil", "Divya Mohan", "Santhosh Pai", "Fousiya Hamza", "Arun Gopinath",
];
const PLACES = ["Kozhikode", "Calicut Beach Road", "Feroke", "Ramanattukara", "Vadakara", "Koyilandy", "Thamarassery",
  "Mukkam", "Perinthalmanna", "Malappuram", "Kannur", "Thrissur", "Kochi", "Palakkad", "Kondotty", "Tirur"];
const COMMERCIAL_PREFIX = ["Malabar", "Kerala", "Hilltop", "Coastal", "Greenfield", "Bluewave"];
const COMMERCIAL_SUFFIX = ["Textiles", "Cold Storage", "Hospital", "Residency", "Bakers", "Engineering Works"];
const SOURCES = ["Referral", "Instagram", "Website", "Walk-in", "Facebook", "Google Search", "Existing Customer"];
const REFERRERS = ["Faisal M", "Anil Kumar", "Shibu K", "Rafeeq P", "Dilip Nambiar"];

const capacityFor = (cat: Category, r: number): Capacity => {
  if (cat === "Commercial") return (["10 KW", "15 KW", "50 kw", "65 kw"] as Capacity[])[Math.floor(r * 4)];
  return (["3 KW", "5 KW", "5 KW", "8 KW", "10 KW"] as Capacity[])[Math.floor(r * 5)];
};
const kwOf = (c: Capacity) => parseInt(c, 10);

export function buildSeed(today = new Date()): SeedData {
  const r = rng(20260);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
  const phone = () => `9${Math.floor(400000000 + r() * 599999999)}`;

  const enquiries: Enquiry[] = [];
  const lifecycle: [EnquiryStatus, PipelineStage][] = [
    ["Lead", "New"], ["Lead", "Follow-up Required"], ["Lead", "Site Survey Pending"],
    ["In-Progress", "Quotation Pending"], ["In-Progress", "Quotation Sent"], ["In-Progress", "Order Confirmed"],
    ["In-Progress", "Installation"], ["Paused", "Follow-up Required"], ["Completed", "Closed"],
  ];
  for (let i = 0; i < 24; i++) {
    const commercial = i % 5 === 4;
    const category: Category = commercial ? "Commercial" : "Residential";
    const name = commercial ? `${pick(COMMERCIAL_PREFIX)} ${pick(COMMERCIAL_SUFFIX)}` : NAMES[i];
    const [status, stage] = lifecycle[i % lifecycle.length];
    const capacity = capacityFor(category, r());
    const kw = kwOf(capacity);
    const quoted = status === "Lead" ? undefined : Math.round(kw * (52000 + r() * 8000) / 1000) * 1000;
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
      solarType: pick<SolarType>(["On-Grid", "On-Grid", "Hybrid", "Off-Grid", "On-Grid (micro)"]),
      systemCapacity: capacity,
      roofType: pick(["Sheet", "Slope", "Flat"] as const),
      dcrType: pick(["DCR", "NDCR"] as const),
      panelBrand: pick(["WAREE", "EMMVEE", "ADANI"] as const),
      inverterBrand: pick(["SOLIS", "POLYCAB", "DEYE"] as const),
      referral,
      referralContact: referral ? phone() : undefined,
      quoted,
      cashReceived: status === "Completed" ? quoted : status === "In-Progress" && stage !== "Quotation Sent" && quoted ? Math.round(quoted * 0.3) : 0,
      documentation: status === "Completed",
      documents: status === "Completed" ? ["Handover-pack.pdf"] : [],
      startDate: status === "Lead" ? undefined : day(addDays(created, 14)),
      status,
      stage,
      workDescription: `${kw} KW ${category.toLowerCase()} rooftop solar installation enquiry.`,
      assignedTo: TEAM[i % 3].name,
      nextFollowUp: status === "Completed" ? undefined : day(addDays(today, (i % 9) - 3)),
      source: referral ? "Referral" : pick(SOURCES),
      createdAt: iso(created),
      updatedAt: iso(created),
    });
  }

  const contacts: Contact[] = enquiries.slice(0, 16).map((e, i) => ({
    id: `con-${i + 1}`,
    name: e.category === "Commercial" ? `${pick(NAMES)} (Manager)` : e.name,
    phone: e.contactNo,
    email: e.email,
    role: i % 3 === 0 ? "Follow up" : "Lead",
    lastContacted: day(subDays(today, i % 12)),
    enquiryId: e.id,
    createdAt: e.createdAt,
    updatedAt: e.createdAt,
  }));

  const fuTypes: FollowUpType[] = ["Call", "WhatsApp", "Site Visit", "Email", "Meeting"];
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
        notes: "Discuss system size, roof suitability and expected savings.",
        outcome: done ? "Customer interested, asked for quotation." : undefined,
        nextAction: done ? "Send quotation" : undefined,
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
      surveyor: "Sreejith Menon",
      location: e.place,
      category: e.category,
      roofType: e.roofType ?? "Flat",
      roofCondition: pick(["Good", "Good", "Fair", "Needs repair"] as const),
      roofAreaSqFt: Math.round(kwOf(e.systemCapacity ?? "5 KW") * 85 + r() * 120),
      electricityConnection: e.category === "Commercial" ? "Three phase" : pick(["Single phase", "Three phase"] as const),
      sanctionedLoadKw: Math.round(kwOf(e.systemCapacity ?? "5 KW") * 1.2),
      requiredCapacity: e.systemCapacity,
      shading: pick(["No significant shading", "Partial shade from coconut trees in the morning", "Minor shading from water tank"]),
      electricityBill: Math.round(2500 + r() * 9000),
      photos: [],
      notes: "Demo survey notes. Structure strength and cable route verified.",
      feasibility: done ? pick(["Feasible", "Feasible", "Feasible with changes"] as const) : "Pending",
      status: done ? "Completed" : "Scheduled",
      createdAt: iso(subDays(today, 10)),
      updatedAt: iso(subDays(today, 10)),
    } satisfies SiteSurvey;
  });

  const quotations: Quotation[] = enquiries
    .filter((e) => e.quoted)
    .map((e, i) => {
      const kw = kwOf(e.systemCapacity ?? "5 KW");
      const panelCost = Math.round(kw * 24000);
      const inverterCost = Math.round(kw * 9000);
      const status = e.stage === "Quotation Sent" ? "Sent" : e.status === "Paused" ? "Expired" : e.stage === "Quotation Pending" ? "Draft" : "Accepted";
      return {
        id: `qt-${i + 1}`,
        number: `RSQ-2026-${String(101 + i).padStart(4, "0")}`,
        enquiryId: e.id,
        customer: e.name,
        solarType: e.solarType ?? "On-Grid",
        capacity: e.systemCapacity ?? "5 KW",
        panelDetails: `${e.panelBrand} mono PERC panels, ${kw} KW`,
        inverterDetails: `${e.inverterBrand} ${kw} KW inverter`,
        batteryDetails: e.solarType === "Hybrid" || e.solarType === "Off-Grid" ? "Lithium battery bank (as per design)" : undefined,
        mountingStructure: "Hot-dip galvanised elevated structure",
        lines: [
          { id: "l1", description: "Solar panels", quantity: 1, unitPrice: panelCost },
          { id: "l2", description: "Inverter", quantity: 1, unitPrice: inverterCost },
          { id: "l3", description: "Mounting structure & cabling", quantity: 1, unitPrice: Math.round(kw * 8000) },
        ],
        installationCharges: Math.round(kw * 4000),
        otherCosts: 5000,
        discount: 0,
        taxPercent: 8.9,
        validUntil: day(addDays(today, status === "Expired" ? -10 : 20)),
        paymentTerms: "30% advance, 60% on delivery, 10% after commissioning",
        notes: "Demo quotation — figures are illustrative only.",
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
      number: `RSO-2026-${String(201 + i).padStart(4, "0")}`,
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

  const checklistLabels = ["Material delivered", "Structure erected", "Panels mounted", "DC/AC cabling", "Inverter commissioning", "Net-meter / grid sync", "Customer handover"];
  const stages = ["Planning", "Material Dispatch", "Installing", "Commissioning", "Completed"] as const;
  const installations: InstallationProject[] = orders.map((o, i) => {
    const stage = stages[i % stages.length];
    const doneCount = stage === "Completed" ? 7 : stage === "Commissioning" ? 5 : stage === "Installing" ? 3 : stage === "Material Dispatch" ? 1 : 0;
    const enq = enquiries.find((e) => e.id === o.enquiryId);
    const checklist: ChecklistItem[] = checklistLabels.map((label, k) => ({ id: `c${k}`, label, done: k < doneCount }));
    return {
      id: `ins-${i + 1}`,
      name: `${enq?.systemCapacity ?? "5 KW"} ${enq?.category ?? "Residential"} — ${enq?.name ?? o.customer}`,
      orderId: o.id,
      enquiryId: o.enquiryId,
      customer: o.customer,
      team: i % 2 ? "Team Alpha" : "Team Bravo",
      startDate: day(addDays(today, i * 2 - 8)),
      endDate: day(addDays(today, i * 2 - 4)),
      capacity: enq?.systemCapacity ?? "5 KW",
      equipment: `${enq?.panelBrand ?? "WAREE"} panels, ${enq?.inverterBrand ?? "SOLIS"} inverter`,
      checklist,
      stage,
      photos: [],
      completionDate: stage === "Completed" ? day(subDays(today, 4)) : undefined,
      createdAt: o.createdAt,
      updatedAt: o.createdAt,
    };
  });

  const inv = (n: number, name: string, category: InventoryItem["category"], brand: string, model: string, qty: number, unit: string, price: number, low: number): InventoryItem => ({
    id: `inv-${n}`, name, sku: `RS-${category.slice(0, 3).toUpperCase()}-${String(n).padStart(3, "0")}`, category, brand, model,
    quantity: qty, unit, purchasePrice: price, lowStockThreshold: low, createdAt: iso(subDays(today, 90)), updatedAt: iso(subDays(today, 5)),
  });
  const inventory: InventoryItem[] = [
    inv(1, "540W Mono PERC Panel", "Solar Panels", "WAREE", "WSMD-540", 120, "pcs", 11800, 40),
    inv(2, "545W Mono Panel", "Solar Panels", "EMMVEE", "EMM-545", 36, "pcs", 11600, 40),
    inv(3, "550W Bifacial Panel", "Solar Panels", "ADANI", "ASB-550", 64, "pcs", 12400, 30),
    inv(4, "5 KW On-Grid Inverter", "Inverters", "SOLIS", "S6-GR1P5K", 8, "pcs", 41500, 4),
    inv(5, "10 KW Three-phase Inverter", "Inverters", "POLYCAB", "P3-10K", 3, "pcs", 78000, 3),
    inv(6, "8 KW Hybrid Inverter", "Inverters", "DEYE", "SUN-8K-SG", 5, "pcs", 96000, 2),
    inv(7, "5 kWh Lithium Battery", "Batteries", "DEYE", "RW-M5.1", 6, "pcs", 98000, 3),
    inv(8, "Elevated GI Structure (per KW)", "Mounting Structures", "Local Fabricator", "HDG-ELV", 90, "kW set", 6200, 30),
    inv(9, "4 sq mm DC Cable", "Cables", "POLYCAB", "PV-4SQ", 800, "m", 62, 300),
    inv(10, "AC Cable 3C x 6 sq mm", "Cables", "POLYCAB", "AC-6SQ", 220, "m", 118, 250),
    inv(11, "DC Distribution Box", "Electrical Components", "Havells", "DCDB-2S", 18, "pcs", 3200, 10),
    inv(12, "Earthing Kit", "Electrical Components", "Local Supplier", "ERT-KIT", 9, "pcs", 2400, 10),
    inv(13, "MC4 Connectors (pair)", "Other Materials", "Staubli", "MC4", 260, "pair", 85, 100),
  ];
  const stockMovements: StockMovement[] = [
    { id: "sm-1", itemId: "inv-1", type: "In", quantity: 60, note: "Supplier delivery (demo)", date: day(subDays(today, 12)) },
    { id: "sm-2", itemId: "inv-4", type: "Out", quantity: 2, note: "Issued to installation (demo)", date: day(subDays(today, 6)) },
  ];

  const invoices: Invoice[] = orders.map((o, i) => {
    const status = o.paymentStatus === "Paid" ? "Paid" : i % 4 === 1 ? "Overdue" : "Partially Paid";
    return {
      id: `inv-doc-${i + 1}`,
      number: `RSI-2026-${String(301 + i).padStart(4, "0")}`,
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
    payments.push({ id: `pay-${payments.length + 1}`, receiptNo: `RSR-2026-${String(401 + payments.length).padStart(4, "0")}`, invoiceId: v.id, customer: v.customer, amount: adv, date: v.issueDate, mode: pick(["UPI", "Bank Transfer", "Cheque"] as const), reference: "DEMO-REF", createdAt: v.createdAt, updatedAt: v.createdAt });
    if (v.status === "Paid") payments.push({ id: `pay-${payments.length + 1}`, receiptNo: `RSR-2026-${String(401 + payments.length).padStart(4, "0")}`, invoiceId: v.id, customer: v.customer, amount: v.amount - adv, date: day(subDays(today, 5 + i)), mode: "Bank Transfer", reference: "DEMO-REF", createdAt: v.createdAt, updatedAt: v.createdAt });
  });

  const completedInstalls = installations.filter((x) => x.stage === "Completed");
  const services: ServiceRequest[] = (completedInstalls.length ? completedInstalls : installations.slice(0, 2)).slice(0, 4).map((x, i) => ({
    id: `srv-${i + 1}`,
    number: `RSS-2026-${String(501 + i).padStart(4, "0")}`,
    enquiryId: x.enquiryId,
    customer: x.customer,
    installationRef: x.name,
    product: i % 2 ? "Inverter" : "Solar panels",
    warrantyUntil: day(addDays(today, 365 * (i % 2 ? 5 : 25))),
    issue: i % 2 ? "Inverter showing intermittent grid fault code." : "Reduced generation after monsoon — cleaning and inspection requested.",
    priority: pick(["Low", "Medium", "High"] as const),
    technician: "Nikhil Das",
    visitDate: day(addDays(today, i + 1)),
    resolution: i === 0 ? "Panels cleaned, connections tightened." : undefined,
    status: i === 0 ? "Resolved" : i === 1 ? "Scheduled" : "Open",
    createdAt: iso(subDays(today, 6 - i)),
    updatedAt: iso(subDays(today, 6 - i)),
  }));

  const activity: ActivityEntry[] = [
    { id: "a1", text: `New enquiry added: ${enquiries[0].name}`, at: iso(subDays(today, 0)), kind: "enquiry", enquiryId: enquiries[0].id },
    { id: "a2", text: `Quotation ${quotations[0]?.number ?? ""} sent to ${quotations[0]?.customer ?? ""}`, at: iso(subDays(today, 1)), kind: "quotation" },
    { id: "a3", text: `Site survey completed for ${surveys[1].customer}`, at: iso(subDays(today, 2)), kind: "survey" },
    { id: "a4", text: `Advance received from ${payments[0]?.customer ?? ""}`, at: iso(subDays(today, 3)), kind: "payment" },
    { id: "a5", text: `Installation started: ${installations[0]?.name ?? ""}`, at: iso(subDays(today, 4)), kind: "install" },
    { id: "a6", text: `Service request raised by ${services[0]?.customer ?? ""}`, at: iso(subDays(today, 5)), kind: "service" },
  ];
  const notifications: AppNotification[] = [
    { id: "n1", title: "Follow-ups due today", body: "You have follow-ups scheduled for today.", at: iso(today), read: false },
    { id: "n2", title: "Low stock", body: "Some inventory items are below their threshold.", at: iso(subDays(today, 1)), read: false },
    { id: "n3", title: "Demo data", body: "All records in this template are fictional demo data.", at: iso(subDays(today, 2)), read: true },
  ];

  return { team: TEAM, enquiries, contacts, followUps, surveys, quotations, orders, installations, inventory, stockMovements, invoices, payments, services, activity, notifications };
}
