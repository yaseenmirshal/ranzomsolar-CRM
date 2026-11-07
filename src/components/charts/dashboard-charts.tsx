"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { axisProps, CHART_COLORS, tooltipStyle } from "./chart-theme";

type Point = Record<string, string | number>;

function ChartCard({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className} data-reveal="chart">
      <CardHeader><div><CardTitle>{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</div></CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export function EnquiryGrowthChart({ data, className }: { data: Point[]; className?: string }) {
  return (
    <ChartCard title="Enquiry growth" description="New enquiries per month" className={className}>
      <div className="h-60" role="img" aria-label="Area chart of new enquiries per month">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <defs><linearGradient id="gEnq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#35A9F4" stopOpacity={0.35} /><stop offset="100%" stopColor="#35A9F4" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" {...axisProps} /><YAxis allowDecimals={false} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="enquiries" stroke="#35A9F4" strokeWidth={2.5} fill="url(#gEnq)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function RevenueChart({ data, className }: { data: Point[]; className?: string }) {
  return (
    <ChartCard title="Monthly revenue" description="Payments received (demo data)" className={className}>
      <div className="h-60" role="img" aria-label="Bar chart of monthly revenue">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v: number) => formatINR(v, true).replace("₹", "")} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatINR(Number(v))} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="revenue" fill="#35A9F4" radius={[5, 5, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function FunnelChart({ data, className }: { data: { stage: string; value: number }[]; className?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ChartCard title="Lead conversion funnel" description="Enquiry to installation" className={className}>
      <ul className="space-y-3">
        {data.map((d, i) => (
          <li key={d.stage}>
            <div className="mb-1 flex justify-between text-[13px]"><span className="font-medium">{d.stage}</span><span className="tabular-nums text-muted-foreground">{d.value}{i > 0 && data[0].value ? ` · ${Math.round((d.value / data[0].value) * 100)}%` : ""}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand transition-[width] duration-1000 ease-out" style={{ width: `${(d.value / max) * 100}%`, opacity: 1 - i * 0.14 }} />
            </div>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}

export function DonutChart({ title, description, data, className }: { title: string; description?: string; data: { name: string; value: number }[]; className?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title={title} description={description} className={className}>
      <div className="flex items-center gap-4">
        <div className="h-40 w-40 shrink-0" role="img" aria-label={`${title} donut chart`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={46} outerRadius={70} paddingAngle={2} stroke="var(--card)" strokeWidth={2} animationDuration={900}>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-2 text-[13px]">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} /><span className="truncate">{d.name}</span></span>
              <span className="tabular-nums text-muted-foreground">{d.value} · {total ? Math.round((d.value / total) * 100) : 0}%</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

export function CapacityChart({ data, className }: { data: { name: string; value: number }[]; className?: string }) {
  return (
    <ChartCard title="Solar capacity distribution" description="Enquiries by system size" className={className}>
      <div className="h-48" role="img" aria-label="Bar chart of enquiries by capacity">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" {...axisProps} /><YAxis allowDecimals={false} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="value" fill="#1E7FC4" radius={[5, 5, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
