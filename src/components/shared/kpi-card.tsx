"use client";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

export function KpiCard({ label, value, format, icon: Icon, hint, trend }: {
  label: string; value: number; format?: (n: number) => string; icon: LucideIcon; hint?: string; trend?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      data-reveal="kpi"
      className="group rounded-xl border bg-card p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><Icon className="size-4" /></span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums"><CountUp value={value} format={format} /></div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        {trend !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-medium", trend >= 0 ? "text-success" : "text-destructive")}>
            {trend >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{Math.abs(trend)}%
          </span>
        )}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </motion.div>
  );
}
