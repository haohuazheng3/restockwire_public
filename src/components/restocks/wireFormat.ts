/**
 * Formatting shared by the four wire modules (RestockHeatmap, RestockStreak, SellOutRanking, RestockLeaderboard):
 * hour windows, durations up to days, shares and store names in the page's language. English keeps the site's own
 * forms (rangeLabel "7–9 AM", "45 s"); other languages go through lib/i18n/format.
 */
import { appleName, type Store } from "@/lib/apple/catalog";
import { rangeLabel } from "@/lib/content/restockTimes";
import { hour, pct as pctOf, secs, unit } from "@/lib/i18n/format";
import { appleStoreLabel } from "@/lib/i18n/places";
import type { Lang } from "@/lib/i18n/locales";

/** Local hours [from, to): "7–9 AM" / "7時–9時". */
export function hoursLabel(lang: Lang, from: number, to: number): string {
  return lang === "en" ? rangeLabel(from, to) : `${hour(lang, from)}–${hour(lang, to % 24)}`;
}

/** A gap or a quiet spell: seconds and minutes as the restock modules write them, then hours, then days ("2.5 d"). */
export function span(lang: Lang, sec: number): string {
  if (sec < 48 * 3600) return secs(lang, sec);
  return unit(lang, Math.round((sec / 86400) * 10) / 10, "d");
}

/** A 0–1 share as a whole percent; under half a percent reads "<1%", never "0%". */
export function share(lang: Lang, x: number): string {
  if (x > 0 && x < 0.005) return `<${pctOf(lang, 1)}`;
  return pctOf(lang, Math.round(x * 100));
}

/** "Apple Somerset" / "Apple 銀座". */
export function storeName(lang: Lang, s: Store): string {
  return lang === "en" ? appleName(s) : appleStoreLabel(s, lang);
}

/** Hour ticks of the heatmap's header: English "12a", "3a" … every third hour, other languages 0, 3 … 21. */
export function hourTick(lang: Lang, h: number): string {
  if (h % 3 !== 0) return "";
  if (lang !== "en") return String(h);
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`;
}
