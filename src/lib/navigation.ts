import {
  Banknote, BarChart3, BriefcaseBusiness, CalendarClock, ClipboardList, Contact, FileText,
  FolderKanban, LayoutDashboard, LifeBuoy, Package, PhoneCall, Receipt, Settings, ShoppingCart, Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem { label: string; href: string; icon: LucideIcon }
export interface NavGroup { label: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Customers",
    items: [
      { label: "Leads", href: "/enquiries", icon: BriefcaseBusiness },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Contacts", href: "/contacts", icon: Contact },
      { label: "Follow-ups", href: "/follow-ups", icon: PhoneCall },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Tasks", href: "/site-surveys", icon: ClipboardList },
      { label: "Proposals", href: "/quotations", icon: FileText },
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Projects", href: "/installations", icon: FolderKanban },
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
    items: [{ label: "Support cases", href: "/service", icon: LifeBuoy }],
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
