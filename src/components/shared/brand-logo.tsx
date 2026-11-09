import { cn } from "@/lib/utils";

export function BrandLogo({ collapsed = false, className, tone = "light" }: { collapsed?: boolean; className?: string; tone?: "light" | "auto" }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div aria-label="Ranzom Tech" role="img" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">R</div>
      {!collapsed && (
        <div className="leading-none">
          <div className={cn("text-[15px] font-semibold tracking-tight", tone === "light" ? "text-white" : "text-foreground")}>
            RANZOM <span className="text-brand">TECH</span>
          </div>
          <div className={cn("mt-1 text-[10px] uppercase tracking-[0.14em]", tone === "light" ? "text-sidebar-muted" : "text-muted-foreground")}>CRM</div>
        </div>
      )}
    </div>
  );
}
