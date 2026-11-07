"use client";
import { useState } from "react";
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
  type ColumnDef, type SortingState, type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  onExport?: () => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  initialHidden?: VisibilityState;
}

export function DataTable<T>({ data, columns, searchPlaceholder = "Search…", toolbar, onExport, pageSize = 10, emptyTitle = "Nothing here yet", emptyDescription, onRowClick, initialHidden = {} }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [visibility, setVisibility] = useState<VisibilityState>(initialHidden);

  const table = useReactTable({
    data, columns,
    state: { sorting, globalFilter, columnVisibility: visibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    globalFilterFn: (row, _id, value: string) => {
      const t = value.toLowerCase();
      return row.getAllCells().some((c) => {
        const v = c.getValue();
        return (typeof v === "string" || typeof v === "number") && String(v).toLowerCase().includes(t);
      });
    },
  });

  const { pageIndex } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const start = total === 0 ? 0 : pageIndex * table.getState().pagination.pageSize + 1;
  const end = Math.min(total, (pageIndex + 1) * table.getState().pagination.pageSize);

  return (
    <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={searchPlaceholder} aria-label="Search table" className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {toolbar}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Columns3 />Columns</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table.getAllLeafColumns().filter((c) => c.getCanHide()).map((c) => (
                <DropdownMenuCheckboxItem key={c.id} checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)} onSelect={(e) => e.preventDefault()}>
                  {typeof c.columnDef.header === "string" ? c.columnDef.header : c.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {onExport && <Button variant="outline" size="sm" onClick={onExport}><Download />Export CSV</Button>}
        </div>
      </div>

      {total === 0 ? (
        <EmptyState title={globalFilter ? "No results match your search" : emptyTitle} description={globalFilter ? "Try a different keyword or clear the filters." : emptyDescription} />
      ) : (
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const sortable = h.column.getCanSort();
                    const dir = h.column.getIsSorted();
                    return (
                      <th key={h.id} scope="col" aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined} className="whitespace-nowrap px-4 py-2.5 font-medium">
                        {h.isPlaceholder ? null : sortable ? (
                          <button onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-foreground">
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {dir === "asc" ? <ArrowUp className="size-3" /> : dir === "desc" ? <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
                          </button>
                        ) : flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} onClick={onRowClick ? () => onRowClick(row.original) : undefined} className={cn("transition-colors hover:bg-brand-soft/40", onRowClick && "cursor-pointer")}>
                  {row.getVisibleCells().map((cell) => <td key={cell.id} className="whitespace-nowrap px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5 text-[13px] text-muted-foreground">
        <span>{start}–{end} of {total}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft /></Button>
          <span className="px-2 tabular-nums">Page {pageIndex + 1} / {Math.max(1, table.getPageCount())}</span>
          <Button variant="outline" size="icon-sm" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight /></Button>
        </div>
      </div>
    </div>
  );
}
