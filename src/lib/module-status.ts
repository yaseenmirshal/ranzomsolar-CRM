export interface PendingModule {
  description: string;
}

export const pendingModules: Record<string, PendingModule> = {
  customers: {
    description: "Customer records and their sales history are not implemented as a standalone page yet.",
  },
  invoices: {
    description: "Invoice listing and balances are not implemented yet.",
  },
  payments: {
    description: "Payment listing and reconciliation are not implemented yet.",
  },
  service: {
    description: "Service and warranty case management is not implemented yet.",
  },
  reports: {
    description: "Reports are not implemented yet.",
  },
  settings: {
    description: "Administrator-managed CRM settings are not implemented yet.",
  },
};
