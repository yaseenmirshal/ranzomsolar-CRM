export const CHART_COLORS = ["#35A9F4", "#1E7FC4", "#7CC7F8", "#0B5A94", "#A9DAFA", "#5B6B7C"];
export const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;
export const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  boxShadow: "var(--shadow-pop)",
  fontSize: 12,
  color: "var(--popover-foreground)",
} as const;
