import { ShieldAlert } from "lucide-react";

export function DataSourceNotice() {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-[1600px] items-start gap-2 bg-amber-500/10 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 md:px-6 lg:px-8"
    >
      <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
      <span>Authentication is temporarily disabled. Anyone with this link can access CRM data; do not enter real or sensitive customer information. Sample records are fictional.</span>
    </div>
  );
}
