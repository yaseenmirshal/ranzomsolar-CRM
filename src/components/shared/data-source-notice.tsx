import { Database } from "lucide-react";

export function DataSourceNotice() {
  return (
    <div
      role="status"
      className="mx-auto flex w-full max-w-[1600px] items-start gap-2 bg-brand-soft/60 px-4 py-2 text-xs text-brand md:px-6 lg:px-8"
    >
      <Database className="mt-0.5 size-3.5 shrink-0" />
      <span>Demo workspace: sample records are fictional and stored in this browser.</span>
    </div>
  );
}
