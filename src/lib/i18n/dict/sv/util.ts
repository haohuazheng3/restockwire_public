/**
 * Pure helpers for the sv dictionaries (safe on server and in tests): numerals, plural forms, money, durations,
 * colour names as Apple Sweden spells them, country names and the tax phrase after a price.
 */
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import type { Store } from "@/lib/apple/catalog";
import { fitTitleW, hour, list, num, pct, plural, price, secs, unit } from "@/lib/i18n/format";
import { appleStoreLabel, colorLabel, countryLabel } from "@/lib/i18n/places";
import { includedRate } from "@/content/country-tax";

export const SV = "sv" as const;

/** 12 345 */
export const n = (x: number): string => num(SV, x);
/** 25 → "25 %" */
export const pc = (x: number): string => pct(SV, x);
/** A share 0–1 as a whole percent; under half a percent "<1 %", never a misleading "0 %". */
export const share = (x: number): string => (x > 0 && x < 0.005 ? "<1 %" : pct(SV, Math.round(x * 100)));
/** "1 butik" / "3 butiker". */
export const pl = (x: number, one: string, other: string): string => plural(SV, x, { one: `# ${one}`, other: `# ${other}` });
/** Swedish list joining; past `max` items the tail becomes a count (… och 4 fler). */
export const words = (items: string[], max = 6): string => list(SV, items, max, (k) => `${n(k)} fler`);
export const fit = fitTitleW;
export const cap = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Country name in Swedish. */
export const land = (cc: CountryCode): string => countryLabel(cc, SV);
/** Price in local currency, Swedish digit grouping. */
export const kr = (cc: CountryCode, v: number): string => price(SV, COUNTRIES[cc], v);
/** Store label with its Apple prefix. */
export const apple = (s: Pick<Store, "storeNumber" | "name">): string => appleStoreLabel(s, SV);
/** Clock hour, Swedish style. */
export const klock = (h: number): string => hour(SV, h);
/** Window of local hours [from, to), Swedish style. */
export const range = (from: number, to: number): string => `kl. ${from}–${to % 24}`;
/** Same window as prose. */
export const between = (from: number, to: number): string => `mellan kl. ${from} och ${to % 24}`;

/** Time a listing stayed up, shortest unit pair (min, tim + min, d + tim). */
export function dur(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return "mindre än en minut";
  const m = Math.floor(s / 60);
  if (m < 60) return unit(SV, m, "m");
  const h = Math.floor(m / 60);
  if (h < 24) return secs(SV, m * 60);
  const d = Math.floor(h / 24);
  return h % 24 ? `${unit(SV, d, "d")} ${unit(SV, h % 24, "h")}` : unit(SV, d, "d");
}

const COLORS = ["Night Sky", "Star White", "Burgundy", "Glacier", "Silver", "Black"];
/** Colour name as Apple Sweden writes it. */
export const color = (c: string): string => colorLabel(c, SV);
/** Swaps a trailing English colour in a product or configuration name for the Swedish one. */
export function prod(name: string): string {
  for (const c of COLORS) {
    if (name === c) return colorLabel(c, SV);
    if (name.endsWith(` ${c}`)) return `${name.slice(0, -c.length)}${colorLabel(c, SV)}`;
  }
  return name;
}

/** Region word per grouping kind; the Swedish store groups (Skåne, Solna, Uppland) all fall under område. */
const NOUN: Record<string, [string, string]> = {
  state: ["delstat", "delstater"],
  province: ["provins", "provinser"],
  area: ["område", "områden"],
  department: ["departement", "departement"],
  prefecture: ["prefektur", "prefekturer"],
  emirate: ["emirat", "emirat"],
  canton: ["kanton", "kantoner"],
  county: ["område", "områden"],
  region: ["region", "regioner"],
  city: ["stad", "städer"],
};
export const NOUNS = NOUN;
export function noun(c: Pick<Country, "regionNoun">, plural = false): string {
  const f = NOUN[c.regionNoun ?? "area"] ?? NOUN.area;
  return plural ? f[1] : f[0];
}

/** Name of the tax included in a price. */
export function taxWord(c: Country): string {
  if (/^VAT/.test(c.taxNote)) return "moms";
  if (/^GST/.test(c.taxNote)) return "GST";
  if (/^consumption tax/.test(c.taxNote)) return "konsumtionsskatt";
  return "skatt";
}
/** Tax phrase printed after a price. */
export function taxNote(c: Country): string {
  if (c.cc === "us") return "före delstatlig försäljningsskatt";
  if (c.cc === "ca") return "före GST/HST och provinsskatt";
  const r = includedRate(c);
  if (r == null) return "momsfritt i Hongkong";
  return `inkl. ${taxWord(c)} (${pc(r)})`;
}
