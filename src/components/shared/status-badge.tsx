import { Badge } from "@/components/ui/badge";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";
const TONES: Record<string, Tone> = {
  // enquiry lifecycle (existing meanings preserved)
  Lead: "brand", "In-Progress": "warning", Paused: "neutral", Completed: "success",
  // generic
  Pending: "warning", Scheduled: "brand", Rescheduled: "neutral", Cancelled: "danger",
  Draft: "neutral", Sent: "brand", Accepted: "success", Rejected: "danger", Expired: "neutral",
  Unpaid: "danger", "Partially Paid": "warning", Paid: "success", Issued: "brand", Overdue: "danger",
  Feasible: "success", "Feasible with changes": "warning", "Not feasible": "danger",
  Planning: "neutral", "Material Dispatch": "brand", Installing: "warning", Commissioning: "brand",
  Low: "neutral", Medium: "brand", High: "warning", Urgent: "danger",
  Open: "danger", "In Progress": "warning", Resolved: "success",
  Residential: "brand", Commercial: "neutral", "Follow up": "warning",
  "Low stock": "danger", "In stock": "success",
};

export function StatusBadge({ value, tone }: { value: string; tone?: Tone }) {
  return <Badge tone={tone ?? TONES[value] ?? "neutral"}>{value}</Badge>;
}
