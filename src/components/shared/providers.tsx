"use client";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDataStore } from "@/store/data-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useDataStore((s) => s.hydrate);
  useEffect(() => { void hydrate(); }, [hydrate]);
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors closeButton toastOptions={{ classNames: { toast: "!rounded-lg !border !shadow-[var(--shadow-pop)]" } }} />
      </TooltipProvider>
    </ThemeProvider>
  );
}
