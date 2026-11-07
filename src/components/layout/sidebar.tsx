"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { navGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Tooltip } from "@/components/ui/tooltip";

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          {!collapsed ? (
            <div className="mb-1.5 px-3 text-[10.5px] font-medium uppercase tracking-[0.12em] text-sidebar-muted">{group.label}</div>
          ) : (
            <div className="mx-3 mb-1.5 h-px bg-sidebar-border" />
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-9 items-center gap-3 rounded-md px-3 text-[13.5px] font-medium transition-colors",
                    active ? "text-white" : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {active && (
                    <motion.span layoutId={`nav-active-${collapsed ? "c" : "e"}`} className="absolute inset-0 rounded-md bg-sidebar-accent" transition={{ type: "spring", stiffness: 500, damping: 40 }}>
                      <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
                    </motion.span>
                  )}
                  <item.icon className={cn("relative size-[18px] shrink-0", active && "text-brand")} />
                  {!collapsed && <span className="relative truncate">{item.label}</span>}
                </Link>
              );
              return <li key={item.href}>{collapsed ? <Tooltip label={item.label}>{link}</Tooltip> : link}</li>;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, loadPrefs } = useUiStore();
  const pathname = usePathname();
  useEffect(loadPrefs, [loadPrefs]);
  useEffect(() => setMobileOpen(false), [pathname, setMobileOpen]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop / tablet */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      >
        <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center" : "px-5")}>
          <BrandLogo collapsed={collapsed} />
        </div>
        <NavList collapsed={collapsed} />
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn("flex h-9 w-full items-center gap-3 rounded-md px-3 text-[13px] text-sidebar-muted transition-colors hover:bg-white/5 hover:text-white", collapsed && "justify-center px-0")}
          >
            {collapsed ? <ChevronsRight className="size-[18px]" /> : (<><ChevronsLeft className="size-[18px]" /><span>Collapse</span></>)}
          </button>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!mobileOpen}>
        <div onClick={() => setMobileOpen(false)} className={cn("absolute inset-0 bg-[#0b1724]/60 transition-opacity duration-200", mobileOpen ? "opacity-100" : "opacity-0")} />
        <aside className={cn("absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-sidebar shadow-2xl transition-transform duration-250 ease-out", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
            <BrandLogo />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-md p-2 text-sidebar-muted hover:bg-white/5 hover:text-white">
              <X className="size-5" />
            </button>
          </div>
          <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>
    </>
  );
}
