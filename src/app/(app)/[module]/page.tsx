import { notFound } from "next/navigation";
import { flatNav } from "@/lib/navigation";
import { pendingModules } from "@/lib/module-status";
import { PendingModuleView } from "@/features/modules/pending-module-view";
import { OperationalModuleView } from "@/features/modules/operational-module-view";
import { isOperationalModule } from "@/features/modules/operational-modules";

export default async function PendingModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const navItem = flatNav.find((item) => item.href === `/${module}`);
  const status = pendingModules[module];

  if (!navItem) notFound();
  if (isOperationalModule(module)) {
    return <OperationalModuleView module={module} title={navItem.label} />;
  }
  if (!status) notFound();

  return <PendingModuleView title={navItem.label} module={status} />;
}
