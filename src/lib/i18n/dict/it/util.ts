/**
 * Italian helpers shared by the it dictionary files: country names with their prepositions, Italy's region words
 * (and their gender), hours as Italians write them (article + hour, hour ranges in prose), counts and prices.
 */
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { num, pct, plural, price } from "@/lib/i18n/format";
import { includedRate, taxName } from "@/content/country-tax";
import { countryLabel } from "@/lib/i18n/places";

export const IT = "it" as const;

/** Numbers grouped the Italian way. */
export const n = (x: number): string => num(IT, x);
/** "1 rifornimento" / "3 rifornimenti". */
export const pl = (x: number, one: string, other: string): string => plural(IT, x, { one: `# ${one}`, other: `# ${other}` });
/** Price in local currency, Italian formatting. */
export const eur = (c: Country, v: number): string => price(IT, c, v);
export const money = (cc: CountryCode, v: number): string => price(IT, COUNTRIES[cc], v);
/** Capitalise the first character. */
export const cap = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

/* ===== section: countries */

/** Country name from Intl, except Hong Kong (Intl says "RAS di Hong Kong"). */
export function paese(cc: CountryCode): string {
  return cc === "hk" ? "Hong Kong" : countryLabel(cc, IT);
}
/** Locative with the right preposition, e.g. "nel Regno Unito". */
const IN: Record<CountryCode, string> = {
  us: "negli Stati Uniti", ca: "in Canada", au: "in Australia", uk: "nel Regno Unito", de: "in Germania", fr: "in Francia",
  it: "in Italia", es: "in Spagna", jp: "in Giappone", sg: "a Singapore", hk: "a Hong Kong", ae: "negli Emirati Arabi Uniti",
  ch: "in Svizzera", nl: "nei Paesi Bassi", se: "in Svezia", at: "in Austria", be: "in Belgio", kr: "in Corea del Sud", tw: "a Taiwan",
};
export const inPaese = (cc: CountryCode): string => IN[cc];
/** Genitive form, e.g. "degli Stati Uniti". */
const DI: Record<CountryCode, string> = {
  us: "degli Stati Uniti", ca: "del Canada", au: "dell'Australia", uk: "del Regno Unito", de: "della Germania", fr: "della Francia",
  it: "dell'Italia", es: "della Spagna", jp: "del Giappone", sg: "di Singapore", hk: "di Hong Kong", ae: "degli Emirati Arabi Uniti",
  ch: "della Svizzera", nl: "dei Paesi Bassi", se: "della Svezia", at: "dell'Austria", be: "del Belgio", kr: "della Corea del Sud", tw: "di Taiwan",
};
export const diPaese = (cc: CountryCode): string => DI[cc];
/** A country name already in Italian ("Italia", "Stati Uniti") → "in Italia", "negli Stati Uniti". */
export function inNome(name: string): string {
  const cc = paeseDi(name);
  return cc ? IN[cc] : `in ${name}`;
}
/** Reverse lookup: Italian country name → code. */
function paeseDi(name: string): CountryCode | undefined {
  return (Object.keys(IN) as CountryCode[]).find((k) => paese(k) === name);
}
/** Locative for any place: city → "a/ad", country → its own preposition, store → "da". */
export function aLuogo(name: string): string {
  if (/^apple\b/i.test(name)) return `da ${name}`;
  const cc = paeseDi(name);
  if (cc) return IN[cc];
  return /^[aA]/.test(name) ? `ad ${name}` : `a ${name}`;
}
/** Bare "a", turning into "ad" before a vowel A. */
export const ad = (name: string): string => (/^[aA]/.test(name) ? `ad ${name}` : `a ${name}`);

/** Country adjective, masculine singular (for "store online …"). */
const ADJ: Record<CountryCode, string> = {
  us: "statunitense", ca: "canadese", au: "australiano", uk: "britannico", de: "tedesco", fr: "francese", it: "italiano", es: "spagnolo",
  jp: "giapponese", sg: "di Singapore", hk: "di Hong Kong", ae: "emiratino", ch: "svizzero", nl: "olandese", se: "svedese", at: "austriaco",
  be: "belga", kr: "coreano", tw: "taiwanese",
};
export const aggettivo = (cc: CountryCode): string => ADJ[cc];

/* ===== section: region words */

/** Italian for a country's region level (countries.ts regionNoun), singular / plural, and its gender. */
const NOUN: Record<string, { one: string; other: string; m: boolean }> = {
  state: { one: "stato", other: "stati", m: true },
  province: { one: "provincia", other: "province", m: false },
  area: { one: "zona", other: "zone", m: false },
  department: { one: "dipartimento", other: "dipartimenti", m: true },
  prefecture: { one: "prefettura", other: "prefetture", m: false },
  emirate: { one: "emirato", other: "emirati", m: true },
  canton: { one: "cantone", other: "cantoni", m: true },
  region: { one: "regione", other: "regioni", m: false },
  county: { one: "contea", other: "contee", m: false },
  city: { one: "città", other: "città", m: false },
};
export const nounForms = NOUN;
const nounOf = (c: Pick<Country, "regionNoun">) => NOUN[c.regionNoun ?? "area"] ?? NOUN.area;
/** "provincia" / "province". */
export const regione = (c: Pick<Country, "regionNoun">, plural = false): string => (plural ? nounOf(c).other : nounOf(c).one);
/** "Tutte le province" / "Tutti gli stati". */
export const tutteLe = (c: Pick<Country, "regionNoun">): string => (nounOf(c).m ? `Tutti gli ${nounOf(c).other}` : `Tutte le ${nounOf(c).other}`);
/** The same from a plural word already in Italian. */
export function tuttiPlural(word: string): string {
  const m = Object.values(NOUN).find((x) => x.other === word)?.m ?? false;
  return m ? `Tutti gli ${word}` : `Tutte le ${word}`;
}
/** "Nearest" + region plural, agreeing in gender. */
export const piuVicine = (c: Pick<Country, "regionNoun">): string => (nounOf(c).m ? `Gli ${nounOf(c).other} più vicini` : `Le ${nounOf(c).other} più vicine`);
/** "Altre province" / "Altri stati". */
export const altre = (c: Pick<Country, "regionNoun">): string => (nounOf(c).m ? `Altri ${nounOf(c).other}` : `Altre ${nounOf(c).other}`);
/** "nessuna provincia" / "nessuno stato". */
export const nessuna = (c: Pick<Country, "regionNoun">): string => (nounOf(c).m ? `nessuno ${nounOf(c).one}` : `nessuna ${nounOf(c).one}`);

/* ===== section: hours */

/** "9:00", "14:00". */
export const ora = (h: number): string => `${((h % 24) + 24) % 24}:00`;
/** With its article: "le 9:00", "mezzogiorno", "mezzanotte", "l'1:00". */
export function leOre(h: number): string {
  const x = ((h % 24) + 24) % 24;
  return x === 0 ? "mezzanotte" : x === 12 ? "mezzogiorno" : x === 1 ? "l'1:00" : `le ${x}:00`;
}
/** Hour range in running text ("tra le … e le …"). */
export const tra = (from: number, to: number): string => `tra ${leOre(from)} e ${leOre(to)}`;
/** Compact hour range for tables and tiles. */
export const fascia = (from: number, to: number): string => `${ora(from)}–${ora(to)}`;
/** Adds the article to an already formatted hour. */
export const le = (hour: string): string => `le ${hour}`;

/* ===== section: dates */

/** Short date from YYYY-MM-DD, weekday optional. */
export const giorno = (ymd: string, weekday = true): string =>
  new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
/** Long date: day, month name, year. */
export const giornoLungo = (ymd: string): string => new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** Date and time in the country's reference time zone, with zone abbreviation. */
export const conFuso = (iso: string, c: Country): string =>
  new Intl.DateTimeFormat("it-IT", { timeZone: c.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
/** Weekday names, index 0 = Sunday. */
export const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
/** Habitual weekday with article (feminine for Sunday). */
export const ilGiorno = (d: number): string => (d === 0 ? "la domenica" : `il ${GIORNI[d]}`);

/* ===== section: tax */

/** Italian name of the tax included in the price. */
export function taxIt(c: Country): string {
  const t = taxName(c);
  return t === "VAT" ? "IVA" : t === "consumption tax" ? "imposta sui consumi" : t;
}
/** Short note on what tax an apple.com price includes. */
export function taxNoteIt(c: Country): string {
  if (c.cc === "us") return "tasse statali escluse";
  if (c.cc === "ca") return "prima di GST/HST e imposte provinciali";
  const r = includedRate(c);
  return r == null ? "nessuna imposta sulle vendite a Hong Kong" : `${taxIt(c)} inclusa (${pct(IT, r)})`;
}

/** "Across the whole country" with the correct article and agreement. */
const TUTTO: Partial<Record<CountryCode, string>> = {
  us: "in tutti gli Stati Uniti", ca: "in tutto il Canada", au: "in tutta l'Australia", uk: "in tutto il Regno Unito", de: "in tutta la Germania",
  fr: "in tutta la Francia", it: "in tutta Italia", es: "in tutta la Spagna", jp: "in tutto il Giappone", ch: "in tutta la Svizzera",
  nl: "in tutti i Paesi Bassi", se: "in tutta la Svezia", at: "in tutta l'Austria", be: "in tutto il Belgio", kr: "in tutta la Corea del Sud",
};
export const inTutto = (cc: CountryCode): string => TUTTO[cc] ?? inPaese(cc);
/** "From" + hour, with article contraction. */
export function dalle(h: number): string {
  const x = ((h % 24) + 24) % 24;
  return x === 0 ? "da mezzanotte" : x === 12 ? "da mezzogiorno" : x === 1 ? "dall'1:00" : `dalle ${x}:00`;
}

/* ===== section: articles before numbers */

/** Percentage with article (elision before vowels sounds; "<1%" becomes "meno dell'1%"). */
export function il(p: string): string {
  if (p.startsWith("<")) return `meno dell'${p.slice(1).trim()}`;
  const d = p.match(/^\d+/)?.[0] ?? "";
  if (d === "0") return `lo ${p}`;
  if (d === "1" || d === "11" || d.startsWith("8")) return `l'${p}`;
  return `il ${p}`;
}
export const Il = (p: string): string => cap(il(p));
/** Partitive article before a plural count (degli before 8 and 11). */
export function dei(x: number): string {
  const s = n(x);
  return /^8|^11(\D|$)/.test(s) ? `degli ${s}` : `dei ${s}`;
}
/** Date with article (elided before 1, 8, 11). */
export function ilData(date: string): string {
  return /^(1|8|11)\b/.test(date) || /^8/.test(date) ? `l'${date}` : `il ${date}`;
}
