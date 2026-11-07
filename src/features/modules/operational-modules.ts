export const operationalModules = [
  "contacts", "follow-ups", "site-surveys", "quotations", "orders", "installations", "inventory",
] as const;

export type OperationalModule = (typeof operationalModules)[number];

export function isOperationalModule(module: string): module is OperationalModule {
  return operationalModules.some((item) => item === module);
}
