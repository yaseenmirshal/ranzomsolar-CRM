"use client";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Demo file input: only file NAMES are kept locally. Swap onChange for a real upload service later. */
export function FileDropzone({ value, onChange, accept, label = "Drag files here, or click to browse" }: { value: string[]; onChange: (names: string[]) => void; accept?: Record<string, string[]>; label?: string }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => onChange([...value, ...files.map((f) => f.name)]),
  });
  return (
    <div className="space-y-2">
      <div {...getRootProps()} className={cn("flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center text-[13px] text-muted-foreground transition-colors hover:border-brand/60 hover:bg-brand-soft/40", isDragActive && "border-brand bg-brand-soft")}>
        <input {...getInputProps()} aria-label="Upload files" />
        <UploadCloud className="size-5 text-brand" />
        <span>{label}</span>
        <span className="text-xs">Max 10 MB · demo storage only (file names are saved)</span>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((n, i) => (
            <li key={`${n}-${i}`} className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-[13px]">
              <span className="flex min-w-0 items-center gap-2"><FileText className="size-4 shrink-0 text-brand" /><span className="truncate">{n}</span></span>
              <button type="button" aria-label={`Remove ${n}`} onClick={() => onChange(value.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-destructive"><X className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
