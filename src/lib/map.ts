/** Shared map constants (the big map and the store-page mini map). */
import type { Theme } from "./theme";

export const MAP_STYLES: Record<Theme, string> = {
  light: process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron",
  dark: process.env.NEXT_PUBLIC_MAP_STYLE_URL_DARK || "https://tiles.openfreemap.org/styles/dark",
};
export const MAP_STYLE = MAP_STYLES.light;
export function mapStyleFor(theme: Theme): string { return MAP_STYLES[theme]; }

/** Dot / label colours per basemap. */
export const MAP_INK: Record<Theme, { ok: string; unknown: string; none: string; stroke: string; label: string; halo: string; me: string }> = {
  // iOS system colours (Maps-style): green for stock, orange for not-yet-checked, grey for none, blue for you.
  light: { ok: "#34c759", unknown: "#ff9500", none: "rgba(142,142,147,0.55)", stroke: "#ffffff", label: "#1d1d1f", halo: "#ffffff", me: "#0071e3" },
  dark: { ok: "#30d158", unknown: "#ff9f0a", none: "rgba(142,142,147,0.6)", stroke: "#000000", label: "#f5f5f7", halo: "#000000", me: "#0a84ff" },
};

/** MapLibre 6 looks for its worker next to the main module; bundlers move that, so we serve a copy (scripts/vendor.mjs). */
export const MAP_WORKER_URL = "/vendor/maplibre-gl-worker.mjs";
