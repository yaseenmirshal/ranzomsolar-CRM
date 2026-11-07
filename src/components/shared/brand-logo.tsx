import Image from "next/image";
import { cn } from "@/lib/utils";

/** Text-based brand treatment. Replace /public/logo/ranzom-solar-mark.svg with the official mark. */
export function BrandLogo({ collapsed = false, className, tone = "light" }: { collapsed?: boolean; className?: string; tone?: "light" | "auto" }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image src="/logo/ranzom-solar-mark.svg" alt="Ranzom Solar" width={32} height={32} priority className="size-8 shrink-0" />
      {!collapsed && (
        <div className="leading-none">
          <div className={cn("text-[15px] font-semibold tracking-tight", tone === "light" ? "text-white" : "text-foreground")}>
            RANZOM <span className="text-brand">SOLAR</span>
          </div>
          <div className={cn("mt-1 text-[10px] uppercase tracking-[0.14em]", tone === "light" ? "text-sidebar-muted" : "text-muted-foreground")}>CRM</div>
        </div>
      )}
    </div>
  );
}
