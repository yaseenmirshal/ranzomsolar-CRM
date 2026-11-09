"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Bell, Check, ChevronRight, LogOut, Menu, Moon, Palette, Plus, Search, Sun, UserRound } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { routeLabels } from "@/lib/navigation";
import { timeAgo } from "@/lib/format";
import { useDataStore } from "@/store/data-store";
import { useUiStore, type Palette as PaletteName } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const palettes: { id: PaletteName; label: string; color: string }[] = [
  { id: "ocean", label: "Ocean", color: "#35a9f4" },
  { id: "violet", label: "Violet", color: "#8b5cf6" },
  { id: "emerald", label: "Emerald", color: "#10b981" },
  { id: "sunset", label: "Sunset", color: "#f9735b" },
];

function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] sm:flex">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Home</Link>
      {parts.map((p, i) => {
        const href = `/${parts.slice(0, i + 1).join("/")}`;
        const label = i === 0 ? routeLabels[p] ?? p : "Details";
        const last = i === parts.length - 1;
        return (
          <span key={href} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            {last ? <span className="truncate font-medium">{label}</span> : <Link href={href} className="text-muted-foreground hover:text-foreground">{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const enquiries = useDataStore((s) => s.enquiries);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return enquiries.filter((e) => [e.name, e.contactNo, e.place, String(e.siNo)].some((v) => v.toLowerCase().includes(t))).slice(0, 6);
  }, [q, enquiries]);

  return (
    <div className="relative w-full max-w-md" role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={ref}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="Search leads, customers, phone…"
        aria-label="Global search"
        className="bg-muted/60 pl-9 shadow-none"
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border bg-popover shadow-[var(--shadow-pop)]">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-sm text-muted-foreground">No matches for “{q}”</p>
          ) : (
            <ul className="p-1">
              {results.map((e) => (
                <li key={e.id}>
                  <button onMouseDown={() => { router.push(`/enquiries/${e.id}`); setQ(""); }} className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted">
                    <span className="truncate font-medium">{e.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{e.place} · #{e.siNo}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const notifications = useDataStore((s) => s.notifications);
  const patch = useDataStore((s) => s.patch);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications (${unread} unread)`} className="relative">
          <Bell />
          {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-card" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          <button className="text-xs text-brand hover:underline" onClick={() => notifications.filter((n) => !n.read).forEach((n) => patch("notifications", n.id, { read: true }))}>Mark all read</button>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <li key={n.id} className={cn("flex gap-3 border-b px-4 py-3 last:border-0", !n.read && "bg-brand-soft/50")}>
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand")} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-[13px] text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">{timeAgo(n.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(dark ? "light" : "dark")}>
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}

export function Header({ user }: { user: { name: string | null; email: string | null } }) {
  const router = useRouter();
  const setMobileOpen = useUiStore((s) => s.setMobileOpen);
  const palette = useUiStore((s) => s.palette);
  const setPalette = useUiStore((s) => s.setPalette);
  const loadPrefs = useUiStore((s) => s.loadPrefs);
  useEffect(() => loadPrefs(), [loadPrefs]);
  const quick = [
    { label: "Add lead", href: "/enquiries?new=1" },
    { label: "Schedule follow-up", href: "/follow-ups?new=1" },
    { label: "Add task", href: "/site-surveys?new=1" },
    { label: "Create proposal", href: "/quotations?new=1" },
    { label: "Record payment", href: "/payments?new=1" },
  ];
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/70 md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu /></Button>
      <Breadcrumbs />
      <div className="mx-auto flex flex-1 justify-center sm:px-4"><GlobalSearch /></div>
      <div className="hidden text-[13px] text-muted-foreground xl:block">{format(new Date(), "EEE, dd MMM yyyy")}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="hidden sm:inline-flex"><Plus />Quick add</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
          {quick.map((a) => <DropdownMenuItem key={a.href} onSelect={() => router.push(a.href)}><Plus />{a.label}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
      <Notifications />
      <ThemeSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Color theme"><Palette /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Gradient palette</DropdownMenuLabel>
          {palettes.map((item) => (
            <DropdownMenuItem key={item.id} onSelect={() => setPalette(item.id)}>
              <span className="size-3 rounded-full" style={{ background: item.color }} aria-hidden />
              <span className="flex-1">{item.label}</span>
              {palette === item.id && <Check className="size-4" aria-label="Selected" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu"><UserRound /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <span className="block max-w-56 truncate">{user.name || "Account"}</span>
            {user.email && <span className="block max-w-56 truncate text-xs font-normal text-muted-foreground">{user.email}</span>}
          </DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => { void signOut({ redirectTo: "/login" }); }}>
            <LogOut />Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
