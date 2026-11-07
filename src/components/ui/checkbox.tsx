"use client";
import * as React from "react";
import * as C from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof C.Root>) {
  return (
    <C.Root className={cn("flex size-4 shrink-0 items-center justify-center rounded border border-input bg-card data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-white", className)} {...props}>
      <C.Indicator><Check className="size-3" strokeWidth={3} /></C.Indicator>
    </C.Root>
  );
}
