/**
 * Shared pieces of RestockWire's own page families (lib/content/insight.ts, dict/<lang>/insight.tsx): where a page
 * lives in every country and language, the localized "where" phrase, hreflang clusters, and small layout helpers.
 *
 * Slugs (English page trees and native versions alike, under /{cc} or /{lang}-{cc}):
 *   /apple-pickup-status · /restock-reports · /restock-reports/{2026-w45} · /fastest-selling-apple-stores
 *   /compare-apple-stores · /compare-apple-stores/{a}-vs-{b}
 * Guides live once in English at the root and once per native version: /restock-alerts-on-apple-watch …
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Points } from "@/components/ui/Viz";
import { storesOf } from "@/lib/apple/catalog";
import { ALL_CODES, COUNTRIES, prefixOf, type Country, type CountryCode } from "@/lib/apple/countries";
import { NATIVE_LOCALES, localesOf, pathInLocale, type Lang, type Locale } from "@/lib/i18n/locales";
import { countryLabel } from "@/lib/i18n/places";
import { LANG_TAG, num } from "@/lib/i18n/format";
import type { Where } from "@/lib/i18n/dict/en/insight";
import { GUIDE_SLUGS, hasRankingPage } from "@/lib/content/insight";

export const SITE = "https://restockwire.com";

export type Family = "status" | "reports" | "ranking" | "compare";
export const FAMILY_SLUG: Record<Family, string> = {
  status: "apple-pickup-status",
  reports: "restock-reports",
  ranking: "fastest-selling-apple-stores",
  compare: "compare-apple-stores",
};
export { GUIDE_SLUGS };
export type GuideKey = keyof typeof GUIDE_SLUGS;

/** Countries that have a page of this family at all. */
export function familyIn(family: Family, cc: CountryCode): boolean {
  if (family === "ranking") return hasRankingPage(cc);
  if (family === "compare") {
    const by = new Map<string, number>();
    for (const s of storesOf(cc)) by.set(`${s.state}|${s.city}`, (by.get(`${s.state}|${s.city}`) ?? 0) + 1);
    return [...by.values()].some((n) => n >= 2);
  }
  return true;
}

/** The English path of a family page in a country ("/apple-pickup-status", "/jp/apple-pickup-status"), plus a tail. */
export function familyPath(family: Family, cc: CountryCode, tail = ""): string {
  return `${prefixOf(cc)}/${FAMILY_SLUG[family]}${tail}`;
}
/** The same in a language version. */
export function familyUrl(family: Family, loc: Locale, tail = ""): string {
  const en = familyPath(family, loc.cc, tail);
  return loc.native ? pathInLocale(en, loc) : en;
}
export function guideUrl(key: GuideKey, loc: Locale): string {
  return loc.native ? `/${loc.id}/${GUIDE_SLUGS[key]}` : `/${GUIDE_SLUGS[key]}`;
}

/** hreflang: English pages cluster across countries (x-default = the US), native versions across native locales. */
export function familyHreflang(family: Family, loc: Locale, tail = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (loc.native) {
    for (const l of NATIVE_LOCALES) if (familyIn(family, l.cc)) out[l.tag] = familyUrl(family, l, tail);
    return out;
  }
  for (const cc of ALL_CODES) if (familyIn(family, cc)) out[COUNTRIES[cc].hreflang] = familyPath(family, cc, tail);
  if (familyIn(family, "us")) out["x-default"] = familyPath(family, "us", tail);
  return out;
}
/** Guides: the English page and every native version in one cluster. */
export function guideHreflang(key: GuideKey): Record<string, string> {
  const out: Record<string, string> = { en: guideUrl(key, localesOf("us")[0]), "x-default": `/${GUIDE_SLUGS[key]}` };
  for (const l of NATIVE_LOCALES) out[l.tag] = guideUrl(key, l);
  return out;
}

/** The country as a page names it. English: "the US" / "in the US"; other languages get the country's name in both. */
export function whereOf(c: Country, lang: Lang): Where {
  const n = storesOf(c.cc).length;
  if (lang === "en") return { name: c.cc === "us" ? "the US" : c.name, in: c.inName, us: c.cc === "us", stores: num(lang, n) };
  const name = countryLabel(c.cc, lang);
  return { name, in: name, us: c.cc === "us", stores: num(lang, n) };
}

/** Other countries' versions of a family page, in the page's language. */
export function otherCountries(family: Family, loc: Locale): { href: string; label: string }[] {
  return ALL_CODES.filter((cc) => cc !== loc.cc && familyIn(family, cc)).map((cc) => {
    const own = loc.native ? NATIVE_LOCALES.find((l) => l.cc === cc && l.lang === loc.lang) : undefined;
    return { href: own ? familyUrl(family, own) : familyPath(family, cc), label: loc.lang === "en" ? COUNTRIES[cc].short : countryLabel(cc, loc.lang) };
  });
}

const th = "border-b border-line py-2 pe-3 text-start text-xs font-semibold text-ink-3";
export const td = "border-b border-line py-2 pe-3 align-top tabular-nums";
export const rowTh = "border-b border-line py-2 pe-3 text-start font-medium text-ink";

export function Table({ caption, head, children, min = "24rem" }: { caption?: string; head: string[]; children: ReactNode; min?: string }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth: min }}>
        {caption && <caption className="mb-2 text-start text-xs text-ink-3">{caption}</caption>}
        <thead><tr>{head.map((h, i) => <th key={`${h}-${i}`} scope="col" className={th}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Keys({ items }: { items: string[] }) {
  return <Points items={items.map((p) => ({ text: p, plain: p.replace(/\*\*/g, "") }))} className="my-3 ml-0!" />;
}

/** One question section: the H2, the answer-first lead, then whatever follows. */
export function Section({ id, h2, lead, children }: { id: string; h2: string; lead: string; children?: ReactNode }) {
  return (
    <section id={id} className="pane mt-6 scroll-mt-24 p-5 sm:p-7" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="text-2xl font-bold">{h2}</h2>
      <p className="mt-2 text-[1.0625rem] leading-relaxed text-ink-2">{lead}</p>
      {children}
    </section>
  );
}

export function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm">{l.label}</Link>)}</div>;
}

/** "Nov 7, 2026, 3:12 PM EST" in the page's language and the country's reference zone. */
export function stampIn(lang: Lang, iso: string, c: Country): string {
  const tag = LANG_TAG[lang];
  return new Intl.DateTimeFormat(tag, { timeZone: c.timeZone, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
}
/** "Nov 2–8, 2026" (other languages: the locale's own short dates joined by an en dash). */
export function rangeIn(lang: Lang, start: string, end: string): string {
  const tag = LANG_TAG[lang];
  const a = new Date(`${start}T12:00:00Z`), b = new Date(`${end}T12:00:00Z`);
  try {
    return new Intl.DateTimeFormat(tag, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).formatRange(a, b);
  } catch {
    const f = new Intl.DateTimeFormat(tag, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    return `${f.format(a)} – ${f.format(b)}`;
  }
}
/** "74 s" / "2 min 05 s"; other languages through Intl units. */
export function secsIn(lang: Lang, s: number | null | undefined): string | null {
  if (s == null) return null;
  const r = Math.round(s);
  if (lang === "en") return r < 120 ? `${r} s` : `${Math.floor(r / 60)} min ${String(r % 60).padStart(2, "0")} s`;
  const tag = LANG_TAG[lang];
  const u = (n: number, unit: "second" | "minute") => new Intl.NumberFormat(tag, { style: "unit", unit, unitDisplay: "short" }).format(n);
  return r < 120 ? u(r, "second") : `${u(Math.floor(r / 60), "minute")} ${u(r % 60, "second")}`;
}
export function pctIn(lang: Lang, x: number | null | undefined, digits = 0): string | null {
  if (x == null || !Number.isFinite(x)) return null;
  return new Intl.NumberFormat(LANG_TAG[lang], { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(x);
}
export function hourIn(lang: Lang, h: number): string {
  const d = new Date(Date.UTC(2026, 0, 1, h));
  return new Intl.DateTimeFormat(LANG_TAG[lang], { hour: "numeric", timeZone: "UTC" }).format(d);
}
