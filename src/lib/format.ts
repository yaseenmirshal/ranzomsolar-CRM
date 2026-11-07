import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export function formatINR(value: number, compact = false): string {
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^91/, "").slice(-10);
  if (digits.length !== 10) return raw;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function formatDate(iso?: string | null, pattern = "dd MMM yyyy"): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, pattern) : "—";
}

export function timeAgo(iso: string): string {
  const d = parseISO(iso);
  return isValid(d) ? `${formatDistanceToNowStrict(d)} ago` : "—";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
