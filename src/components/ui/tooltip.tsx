"use client";
import * as React from "react";
import * as T from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = T.Provider;
export function Tooltip({ label, children, side = "right" }: { label: React.ReactNode; children: React.ReactNode; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <T.Root delayDuration={150}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={8} className={cn("z-50 rounded-md bg-navy px-2.5 py-1.5 text-xs font-medium text-white shadow-[var(--shadow-pop)] data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 dark:bg-[#223a50]")}>
          {label}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
