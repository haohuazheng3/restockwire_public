/**
 * Chart colours for the ops console: the light-surface categorical steps of the data-viz palette and
 * the fixed status steps. A plain module on purpose — server pages read it, and a "use client" module
 * would hand them client references instead of strings (the bars then render with no fill).
 */
export const PALETTE = {
  blue: "var(--chart-blue)", orange: "var(--chart-orange)", aqua: "var(--chart-aqua)", violet: "var(--chart-violet)",
  good: "#3fd68f", warning: "#ff9f43", serious: "#ec835a", critical: "#ff6b6b",
  muted: "var(--chart-muted)",
} as const;
