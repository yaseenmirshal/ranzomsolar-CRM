"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR, formatPhone } from "@/lib/format";
import { useDataStore } from "@/store/data-store";
import type { Enquiry, EnquiryStatus } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";

/** Lifecycle-status Kanban. Dragging a card between columns changes its status (HTML5 drag & drop). */
export function EnquiryKanban({ enquiries, statuses, onEdit }: { enquiries: Enquiry[]; statuses: readonly EnquiryStatus[]; onEdit: (e: Enquiry) => void }) {
  const patch = useDataStore((s) => s.patch);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<EnquiryStatus | null>(null);

  const drop = async (status: EnquiryStatus) => {
    const card = enquiries.find((e) => e.id === dragId);
    setDragId(null); setOver(null);
    if (!card || card.status === status) return;
    await patch("enquiries", card.id, { status });
    toast.success(`${card.name} moved to ${status}`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statuses.map((status) => {
        const cards = enquiries.filter((e) => e.status === status);
        return (
          <section
            key={status} aria-label={`${status} column`}
            onDragOver={(e) => { e.preventDefault(); setOver(status); }} onDragLeave={() => setOver((o) => (o === status ? null : o))} onDrop={() => drop(status)}
            className={cn("flex min-h-60 flex-col rounded-xl border bg-muted/40 p-2.5 transition-colors", over === status && "border-brand bg-brand-soft/60")}
          >
            <header className="mb-2 flex items-center justify-between px-1.5"><StatusBadge value={status} /><span className="text-xs tabular-nums text-muted-foreground">{cards.length}</span></header>
            <div className="space-y-2">
              {cards.map((e) => (
                <article key={e.id} draggable onDragStart={() => setDragId(e.id)} onDragEnd={() => { setDragId(null); setOver(null); }}
                  className={cn("cursor-grab rounded-lg border bg-card p-3 shadow-[var(--shadow-card)] transition-[box-shadow,opacity] hover:shadow-[var(--shadow-pop)] active:cursor-grabbing", dragId === e.id && "opacity-40")}>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/enquiries/${e.id}`} className="text-sm font-medium hover:text-brand">{e.name}</Link>
                    <button onClick={() => onEdit(e)} className="text-xs text-muted-foreground hover:text-brand">Edit</button>
                  </div>
                  <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><MapPin className="size-3" />{e.place}</p>
                    <p className="flex items-center gap-1.5"><Phone className="size-3" />{formatPhone(e.contactNo)}</p>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between"><span className="text-xs font-medium">{e.systemCapacity ?? "—"} · {e.solarType ?? "—"}</span>{e.quoted && <span className="text-xs tabular-nums text-muted-foreground">{formatINR(e.quoted, true)}</span>}</div>
                </article>
              ))}
              {cards.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop a card here</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
