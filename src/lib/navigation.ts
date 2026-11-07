import {
  BarChart3, Banknote, CalendarClock, ClipboardCheck, FileText, HardHat, LayoutDashboard, Contact,
  Package, PhoneCall, Receipt, ScrollText, Settings, ShoppingCart, Users, Wrench, type LucideIcon,
} from "lucide-react";

export interface NavItem { label: string; href: string; icon: LucideIcon }
export interface NavGroup { label: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Sales",
    items: [
      { label: "Enquiries", href: "/enquiries", icon: ScrollText },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Contacts", href: "/contacts", icon: Contact },
      { label: "Follow-ups", href: "/follow-ups", icon: PhoneCall },
    ],
  },
  {
    label: "Projects",
    items: [
      { label: "Site Surveys", href: "/site-surveys", icon: ClipboardCheck },
      { label: "Quotations", href: "/quotations", icon: FileText },
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Installations", href: "/installations", icon: HardHat },
      { label: "Inventory", href: "/inventory", icon: Package },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Invoices", href: "/invoices", icon: Receipt },
      { label: "Payments", href: "/payments", icon: Banknote },
    ],
  },
  {
    label: "Support",
    items: [{ label: "Service & Warranty", href: "/service", icon: Wrench }],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const flatNav = navGroups.flatMap((g) => g.items);
export const routeLabels: Record<string, string> = Object.fromEntries(flatNav.map((n) => [n.href.slice(1), n.label]));
export { CalendarClock };
