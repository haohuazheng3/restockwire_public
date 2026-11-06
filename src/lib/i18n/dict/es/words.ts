/**
 * Shared Spanish (Spain) helpers for the es server dictionaries. Covers: country names with en/de and the article,
 * gendered region nouns, the tax included in a price, clock hours with their article, and Apple's Spanish colour
 * names inside an English product name. Register: Castilian, tú, Apple España's own terms for pickup and stock.
 */
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { includedRate, taxName } from "@/content/country-tax";
import { num, price } from "@/lib/i18n/format";
import { colorLabel, countryLabel } from "@/lib/i18n/places";

export const L = "es" as const;

/** Spanish number format; four-digit numbers stay unseparated. */
export const n = (x: number): string => num(L, x);
/** Percent with a non-breaking space before the sign; decimals kept as given. */
export const pc = (x: number): string => `${num(L, x)} %`;
/** Price in the store country's currency, Spanish layout (amount, then symbol). */
export const money = (c: Country | CountryCode, v: number): string => price(L, typeof c === "string" ? COUNTRIES[c] : c, v);

/** Short Spanish names where Intl's are long. */
const NAME: Partial<Record<CountryCode, string>> = { us: "Estados Unidos", hk: "Hong Kong" };
/** Names that take an article in Spanish. */
const ART: Partial<Record<CountryCode, string>> = { uk: "el Reino Unido", nl: "los Países Bajos", ae: "los Emiratos Árabes Unidos" };
/** Bare country name, no article. */
export const pais = (cc: CountryCode): string => NAME[cc] ?? countryLabel(cc, L);
const withArt = (cc: CountryCode): string => ART[cc] ?? pais(cc);
/** en + country, article included where Spanish needs one. */
export const enPais = (cc: CountryCode): string => `en ${withArt(cc)}`;
/** de + country; de el contracts to del. */
export const dePais = (cc: CountryCode): string => {
  const a = withArt(cc);
  return a.startsWith("el ") ? `del ${a.slice(3)}` : `de ${a}`;
};

/** Spanish noun for a country's subdivisions (from countries.ts regionNoun), plus grammatical gender. */
export interface Noun { one: string; other: string; f: boolean }
export const NOUNS: Record<string, Noun> = {
  state: { one: "estado", other: "estados", f: false },
  province: { one: "provincia", other: "provincias", f: true },
  area: { one: "zona", other: "zonas", f: true },
  department: { one: "departamento", other: "departamentos", f: false },
  prefecture: { one: "prefectura", other: "prefecturas", f: true },
  emirate: { one: "emirato", other: "emiratos", f: false },
  canton: { one: "cantón", other: "cantones", f: false },
  region: { one: "región", other: "regiones", f: true },
  // Sweden's län: "provincias" in Spanish.
  county: { one: "provincia", other: "provincias", f: true },
  city: { one: "ciudad", other: "ciudades", f: true },
};
export const noun = (c: Country, us = false): Noun => (us ? NOUNS.state : NOUNS[c.regionNoun ?? "area"] ?? NOUNS.area);
export const cap = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** "IVA", "GST", "impuesto sobre el consumo": the tax inside Apple's price. */
export function impuesto(c: Country): string {
  const t = taxName(c);
  return t === "VAT" ? "IVA" : t === "consumption tax" ? "impuesto sobre el consumo" : t === "sales tax" ? "impuesto sobre las ventas" : t;
}
/** What a price holds: "IVA incluido (21 %)"; Canada: before tax; Hong Kong: none. */
export function taxNote(c: Country): string {
  if (c.cc === "us") return "sin el impuesto sobre las ventas, que varía según el estado";
  if (c.cc === "ca") return "sin impuestos (GST/HST y los provinciales se suman aparte)";
  const r = includedRate(c);
  return r == null ? "sin IVA ni impuesto sobre las ventas" : `${impuesto(c)} incluido (${pc(r)})`;
}

/** Local clock hour, H:00, midnight as 0:00 (matches format.hour for es). */
export const h = (x: number): string => `${((x % 24) + 24) % 24}:00`;
/** Hour with its article: la for one o'clock, las for every other hour. */
export const lasH = (x: number): string => `${((x % 24) + 24) % 24 === 1 ? "la" : "las"} ${h(x)}`;
/** Hour range with an en dash. */
export const range = (from: number, to: number): string => `${h(from)}–${h(to)}`;
/** Hour window as a phrase: entre ... y ... */
export const between = (from: number, to: number): string => `entre ${lasH(from)} y ${lasH(to)}`;

/** Swap Apple's English colour names inside a product name for the Spanish ones from places.ts. */
export const tc = (s: string): string => s.replace(/Night Sky|Star White|Black|Burgundy|Glacier|Silver/g, (m) => colorLabel(m, L));

/** Convert an English hour label (10 AM, noon, midnight) that slipped into Spanish copy to H:00. */
export function fixHour(s: string): string {
  if (s === "noon") return "12:00";
  if (s === "midnight") return "0:00";
  const m = s.match(/^(\d{1,2}) (AM|PM)$/);
  if (!m) return s;
  const x = Number(m[1]) % 12 + (m[2] === "PM" ? 12 : 0);
  return h(x);
}
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
/** Convert an English weekday name that slipped into Spanish copy. */
export const fixDay = (s: string): string => (DAYS_EN.includes(s) ? DAYS_ES[DAYS_EN.indexOf(s)] : s);

/** Count of Apple Stores; Apple España keeps the brand name invariable in the plural. */
export const apples = (x: number): string => `${n(x)} Apple Store`;
/** Count + tienda(s). */
export const tiendas = (x: number): string => `${n(x)} ${x === 1 ? "tienda" : "tiendas"}`;
/** Count + reposición(es). */
export const reposiciones = (x: number): string => `${n(x)} ${x === 1 ? "reposición" : "reposiciones"}`;
/** Count + ciudad(es). */
export const ciudades = (x: number): string => `${n(x)} ${x === 1 ? "ciudad" : "ciudades"}`;
/** Count + día(s). */
export const dias = (x: number): string => `${n(x)} ${x === 1 ? "día" : "días"}`;
/** Pick the singular or plural verb form by count. */
export const v = (x: number, one: string, many: string): string => (x === 1 ? one : many);

/** Countries that take feminine agreement after todo/toda. */
const FEM_COUNTRIES = new Set<CountryCode>(["es", "fr", "it", "de", "ch", "se", "at", "be", "au", "kr"]);
/** The whole country: toda/todo/todos + name, respecting article and gender. */
export function todoPais(cc: CountryCode): string {
  const a = withArt(cc);
  if (a.startsWith("los ")) return `todos ${a}`;
  if (a.startsWith("el ")) return `todo ${a}`;
  return `${FEM_COUNTRIES.has(cc) ? "toda" : "todo"} ${a}`;
}
/** Weekday in the plural with los (sábado and domingo add -s). */
export const losDias = (day: string): string => { const d = fixDay(day); return /o$/.test(d) ? `los ${d}s` : `los ${d}`; };
/** The interval range other trackers publish (plans.ts OTHER_TRACKERS), rendered in Spanish. */
export function otherTrackers(en: string): string {
  const m = en.match(/^(\d+) seconds to (\d+) minutes$/);
  return m ? `de ${m[1]} segundos a ${m[2]} minutos` : en;
}
/** Prefix a duration with alrededor de, unless it already reads menos de ... */
export const aprox = (d: string): string => (/^menos /.test(d) ? d : `alrededor de ${d}`);
