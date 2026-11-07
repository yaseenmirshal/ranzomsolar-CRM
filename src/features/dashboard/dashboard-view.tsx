"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { format, isBefore, isToday, parseISO, startOfDay, subDays, isAfter } from "date-fns";
import { Banknote, CalendarClock, ClipboardCheck, FileText, HardHat, HandCoins, PhoneCall, Plus, ScrollText, ShoppingCart, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { ListCard } from "@/components/shared/list-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { capacityDistribution, countBy, funnel, kpis, monthlySeries, teamPerformance } from "@/lib/analytics";
import { formatDate, formatINR, initials, timeAgo } from "@/lib/format";
import { useDataStore } from "@/store/data-store";
import { cn } from "@/lib/utils";

const ChartSkeleton = () => <Skeleton className="h-72 rounded-xl" />;
const EnquiryGrowthChart = dynamic(() => import("@/components/charts/dashboard-charts").then((m) => m.EnquiryGrowthChart), { ssr: false, loading: ChartSkeleton });
const RevenueChart = dynamic(() => import("@/components/charts/dashboard-charts").then((m) => m.RevenueChart), { ssr: false, loading: ChartSkeleton });
const FunnelChart = dynamic(() => import("@/components/charts/dashboard-charts").then((m) => m.FunnelChart), { ssr: false, loading: ChartSkeleton });
const DonutChart = dynamic(() => import("@/components/charts/dashboard-charts").then((m) => m.DonutChart), { ssr: false, loading: ChartSkeleton });
const CapacityChart = dynamic(() => import("@/components/charts/dashboard-charts").then((m) => m.CapacityChart), { ssr: false, loading: ChartSkeleton });

const RANGES = [{ label: "Last 30 days", days: 30 }, { label: "Last 90 days", days: 90 }, { label: "All time", days: 0 }] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const quickActions = [
  { label: "Add enquiry", href: "/enquiries?new=1", icon: UserPlus },
  { label: "Schedule follow-up", href: "/follow-ups?new=1", icon: PhoneCall },
  { label: "Book site survey", href: "/site-surveys?new=1", icon: ClipboardCheck },
  { label: "Create quotation", href: "/quotations?new=1", icon: FileText },
  { label: "Record payment", href: "/payments?new=1", icon: HandCoins },
];

export function DashboardView() {
  const d = useDataStore();
  const root = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<(typeof RANGES)[number]>(RANGES[2]);

  // Apply the date filter to enquiry-based figures
  const data = useMemo(() => {
    if (!range.days) return d;
    const from = subDays(new Date(), range.days);
    return { ...d, enquiries: d.enquiries.filter((e) => isAfter(parseISO(e.createdAt), from)) };
  }, [d, range]);

  const k = useMemo(() => kpis(data), [data]);
  const monthly = useMemo(() => monthlySeries(data), [data]);
  const fn = useMemo(() => funnel(data), [data]);
  const catData = useMemo(() => countBy(data.enquiries, (e) => e.category), [data.enquiries]);
  const typeData = useMemo(() => countBy(data.enquiries, (e) => e.solarType), [data.enquiries]);
  const capData = useMemo(() => capacityDistribution(data.enquiries), [data.enquiries]);
  const team = useMemo(() => teamPerformance(data, d.team), [data, d.team]);

  const today = startOfDay(new Date());
  const pending = d.followUps.filter((f) => f.status === "Pending");
  const todays = pending.filter((f) => isToday(parseISO(f.date)));
  const overdue = pending.filter((f) => isBefore(parseISO(f.date), today));
  const upcomingSurveys = d.surveys.filter((s) => s.status === "Scheduled").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const activeInstalls = d.installations.filter((i) => i.stage !== "Completed").slice(0, 4);
  const recentPayments = [...d.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const recentQuotes = [...d.quotations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const recentEnquiries = [...d.enquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  // GSAP entrance sequence — runs once after data is ready; cleaned up via context revert.
  useEffect(() => {
    if (!d.hydrated || !root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .from("[data-reveal=head]", { opacity: 0, y: 10, duration: 0.4 })
        .from("[data-reveal=kpi]", { opacity: 0, y: 14, duration: 0.45, stagger: 0.05 }, "-=0.2")
        .from("[data-reveal=chart]", { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 }, "-=0.25")
        .from("[data-reveal=section]", { opacity: 0, y: 14, duration: 0.45, stagger: 0.05 }, "-=0.3");
    }, root);
    return () => ctx.revert();
  }, [d.hydrated]);

  if (!d.hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <div className="grid gap-4 lg:grid-cols-2"><ChartSkeleton /><ChartSkeleton /></div>
      </div>
    );
  }

  return (
    <div ref={root} className="space-y-6">
      {/* Welcome */}
      <div data-reveal="head" className="solar-lines relative overflow-hidden rounded-xl border bg-card p-5 sm:p-6">
        <div className="absolute -right-10 -top-16 size-56 rounded-full bg-brand/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground"><CalendarClock className="size-3.5" />{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{greeting()}, Demo Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You have <span className="font-medium text-foreground">{todays.length}</span> follow-up{todays.length === 1 ? "" : "s"} today
              {overdue.length > 0 && <> and <span className="font-medium text-foreground">{overdue.length}</span> overdue</>}. <span className="inline-flex items-center gap-1 text-brand"><Sparkles className="size-3" />Demo data</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-muted p-1" role="group" aria-label="Date filter">
              {RANGES.map((r) => (
                <button key={r.label} onClick={() => setRange(r)} aria-pressed={range.label === r.label} className={cn("rounded-md px-3 py-1 text-[13px] font-medium transition-colors", range.label === r.label ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>{r.label}</button>
              ))}
            </div>
            <Button asChild><Link href="/enquiries?new=1"><Plus />Add enquiry</Link></Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9">
        <KpiCard label="Total enquiries" value={k.totalEnquiries} icon={ScrollText} hint={range.label} />
        <KpiCard label="New enquiries" value={k.newEnquiries} icon={UserPlus} hint="Recent leads" />
        <KpiCard label="Follow-ups due" value={k.followUpsDue} icon={PhoneCall} hint="Today & overdue" />
        <KpiCard label="Site surveys" value={k.surveys} icon={ClipboardCheck} hint={`${d.surveys.filter((s) => s.status === "Scheduled").length} scheduled`} />
        <KpiCard label="Quotations sent" value={k.quotationsSent} icon={FileText} hint="Sent + accepted" />
        <KpiCard label="Confirmed orders" value={k.confirmedOrders} icon={ShoppingCart} />
        <KpiCard label="Active installations" value={k.activeInstallations} icon={HardHat} hint="In progress" />
        <KpiCard label="Total revenue" value={k.revenue} format={(n) => formatINR(n, true)} icon={Banknote} hint="Payments received" />
        <KpiCard label="Outstanding" value={k.outstanding} format={(n) => formatINR(n, true)} icon={HandCoins} hint="Across invoices" />
      </section>

      {/* Charts */}
      <section aria-label="Charts" className="grid gap-4 lg:grid-cols-12">
        <EnquiryGrowthChart data={monthly} className="lg:col-span-7" />
        <FunnelChart data={fn} className="lg:col-span-5" />
        <RevenueChart data={monthly} className="lg:col-span-7" />
        <DonutChart title="Residential vs commercial" data={catData} className="lg:col-span-5" />
        <CapacityChart data={capData} className="lg:col-span-7" />
        <DonutChart title="Solar system types" description="On-grid, hybrid, off-grid" data={typeData} className="lg:col-span-5" />
      </section>

      {/* Work lists */}
      <section aria-label="Work queue" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ListCard title="Today's follow-ups" href="/follow-ups" count={todays.length} empty="Nothing due today 🎉">
          {todays.slice(0, 4).map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{f.customer}</p><p className="text-xs text-muted-foreground">{f.time} · {f.type} · {f.assignedTo}</p></div><StatusBadge value={f.type} tone="brand" /></div>
          ))}
        </ListCard>
        <ListCard title="Overdue follow-ups" href="/follow-ups" count={overdue.length} empty="No overdue follow-ups">
          {overdue.slice(0, 4).map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{f.customer}</p><p className="text-xs text-muted-foreground">Due {formatDate(f.date, "dd MMM")} · {f.assignedTo}</p></div><span className="size-2 shrink-0 rounded-full bg-destructive" aria-label="Overdue" /></div>
          ))}
        </ListCard>
        <ListCard title="Upcoming site surveys" href="/site-surveys" empty="No surveys scheduled">
          {upcomingSurveys.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{s.customer}</p><p className="text-xs text-muted-foreground">{s.location} · {s.surveyor}</p></div><span className="shrink-0 text-xs font-medium text-muted-foreground">{formatDate(s.date, "dd MMM")}</span></div>
          ))}
        </ListCard>
        <ListCard title="Recent enquiries" href="/enquiries" empty="No enquiries yet" className="xl:col-span-1">
          {recentEnquiries.map((e) => (
            <Link key={e.id} href={`/enquiries/${e.id}`} className="flex items-center justify-between gap-3 hover:opacity-80"><div className="min-w-0"><p className="truncate text-sm font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.place} · {e.systemCapacity ?? "—"}</p></div><StatusBadge value={e.status} /></Link>
          ))}
        </ListCard>
        <ListCard title="Recent quotations" href="/quotations" empty="No quotations yet">
          {recentQuotes.map((q) => (
            <div key={q.id} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{q.customer}</p><p className="text-xs text-muted-foreground">{q.number} · {q.capacity}</p></div><StatusBadge value={q.status} /></div>
          ))}
        </ListCard>
        <ListCard title="Recent payments" href="/payments" empty="No payments recorded">
          {recentPayments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{p.customer}</p><p className="text-xs text-muted-foreground">{formatDate(p.date, "dd MMM")} · {p.mode}</p></div><span className="shrink-0 text-sm font-semibold tabular-nums">{formatINR(p.amount)}</span></div>
          ))}
        </ListCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5" data-reveal="section">
          <CardHeader><CardTitle>Solar installation progress</CardTitle><Link href="/installations" className="text-xs font-medium text-brand hover:underline">View all</Link></CardHeader>
          <CardContent className="space-y-4 pt-4">
            {activeInstalls.length === 0 && <p className="text-sm text-muted-foreground">No active installations.</p>}
            {activeInstalls.map((i) => {
              const pct = Math.round((i.checklist.filter((c) => c.done).length / Math.max(1, i.checklist.length)) * 100);
              return (
                <div key={i.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-[13px]"><span className="truncate font-medium">{i.customer}</span><span className="shrink-0 text-muted-foreground">{i.capacity} · {pct}%</span></div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="lg:col-span-4" data-reveal="section">
          <CardHeader><CardTitle>Team performance</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <ul className="divide-y">
              {team.map((t) => (
                <li key={t.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">{initials(t.name)}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.enquiries} enquiries · {t.followUps} follow-ups done</p></div>
                  <span className="text-xs tabular-nums text-muted-foreground">{t.pending} pending</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="space-y-4 lg:col-span-3">
          <Card data-reveal="section">
            <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
            <CardContent className="grid gap-1.5 pt-3">
              {quickActions.map((a) => (
                <Button key={a.href} asChild variant="soft" className="justify-start"><Link href={a.href}><a.icon />{a.label}</Link></Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card data-reveal="section">
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent className="pt-4">
          <ol className="relative space-y-4 border-l pl-5">
            {d.activity.slice(0, 6).map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full border-2 border-card bg-brand" />
                <p className="text-sm">{a.text}</p><p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
