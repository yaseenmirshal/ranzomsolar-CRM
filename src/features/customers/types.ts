import type { CustomerCategory } from "@prisma/client";

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  district: string | null;
  category: CustomerCategory;
  projects: number;
  projectValue: string;
  outstandingBalance: string;
  createdAt: string;
}
