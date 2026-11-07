import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "./empty-state";

export function ListCard({ title, href, empty, children, count, className }: { title: string; href?: string; empty: string; children: React.ReactNode[] | React.ReactNode; count?: number; className?: string }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <Card className={className} data-reveal="section">
      <CardHeader className="pb-0">
        <CardTitle>{title}{count !== undefined && <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{count}</span>}</CardTitle>
        {href && <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">View all<ArrowRight className="size-3" /></Link>}
      </CardHeader>
      <CardContent className="pt-3">
        {items.length === 0 ? <EmptyState title={empty} /> : <ul className="divide-y">{items.map((c, i) => <li key={i} className="py-2.5 first:pt-0 last:pb-0">{c}</li>)}</ul>}
      </CardContent>
    </Card>
  );
}
