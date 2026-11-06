/**
 * German strings: place — the copy builders of the country pages (Germany, Austria, Switzerland in German; any
 * other country a German reader opens reads the same builders). Same arguments and shapes as
 * lib/seo/countryCopy.ts; every sentence is built from the country's live stock, restock log, apple.com prices
 * and its tax rule. Titles lead with what people type ("Apple Stores in München", "iPhone Duo Preis").
 */
import type { Dict } from "../en";
import * as cc from "@/lib/seo/countryCopy";
import type { HomeCopyInput, IntlPlaceInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { list, stamp } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, regionLabel } from "@/lib/i18n/places";
import { content } from "./content";
import { LANG, dativ, fitDe, inLand, inOrt, land, modelDe, money, n, pct, plural, regionWord, satz, steuer, taxNote, uhr } from "./util";

const C = (code: CountryCode) => COUNTRIES[code];
const apple = (s: Store) => appleStoreLabel(s, LANG);
const words = (items: string[], max = 6) => list(LANG, items, max, (k) => `${n(k)} weitere`);
const hat = (k: number) => (k === 1 ? "hat" : "haben");
/** "Keiner der 16 Stores", "Keiner der beiden Stores". */
const keinerDer = (k: number) => `Keiner der ${k === 2 ? "beiden" : n(k)} Stores`;
const mal = (k: number) => (k === 1 ? "einmal" : `${n(k)}-mal`);
/** A place of an IntlPlaceInput in German ("Bavaria" → "Bayern", "Munich" → "München"). */
/** Swiss region pages are cantons ("Kanton Zürich" holds Wallisellen too), so they say so. */
const nameOf = (i: IntlPlaceInput) => (i.kind === "state" ? `${i.cc === "ch" ? "Kanton " : ""}${regionLabel(i.cc, i.name, LANG)}` : cityLabel(i.cc, i.name, LANG));

function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${cc.INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "seit Beginn der Erfassung am 2. November" : "in den letzten 30 Tagen";
}
const SinceWhen = () => { const s = sinceWhen(); return s[0].toUpperCase() + s.slice(1); };

function placeLabel(code: CountryCode, name: string): string {
  return cc.placeLabel(code, name) === name ? name : `${name}, ${land(code)}`;
}

function whenIn(code: CountryCode, iso: string | Date): string {
  return stamp(LANG, iso, C(code).timeZone, true);
}

/* ------------------------------------------------------------------ tax */

function taxSentence(code: CountryCode, region?: string): string {
  const c = C(code);
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Ein iPhone Duo 256GB kostet in ${region} etwa ${money(c, t.total)}: Apples ${money(c, duo)} plus ${pct(t.rate)} ${CA_PROVINCE_TAX[region!].label}.`;
    return `Ein iPhone Duo 256GB kostet ${money(c, duo)} vor Steuern; die Provinz des Abhol-Stores schlägt an der Kasse 5 % bis 15 % auf.`;
  }
  const t = steuer(c);
  if (t.rate == null) return `${money(c, duo)} ist der ganze Preis eines iPhone Duo 256GB bei der Abholung: Hongkong erhebt keine Umsatzsteuer.`;
  return `${money(c, duo)} ist der ganze Preis eines iPhone Duo 256GB bei der Abholung ${inLand(code)}, inkl. ${pct(t.rate)} ${t.name}.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** The tax authority in German where it publishes in German (EU: Your Europe; Switzerland: ESTV). */
const EU_DE: Source = { label: "Ihr Europa (EU): MwSt-Vorschriften und -Sätze in den Mitgliedstaaten", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_de.htm" };
const CH_DE: Source = { label: "Eidgenössische Steuerverwaltung (ESTV): Schweizer Mehrwertsteuersätze", url: "https://www.estv.admin.ch/estv/de/home/mehrwertsteuer/mwst-steuersaetze.html" };
function taxSource(code: Exclude<CountryCode, "us">): Source {
  if (code === "ch") return CH_DE;
  if (TAX_SOURCES[code].url === TAX_SOURCES.de.url) return EU_DE;
  return TAX_SOURCES[code];
}

function priceSection(code: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = C(code);
  const m = modelByKey(model)!;
  const base = cc.priceOf(code, model) ?? 0;
  const src = taxSource(code as Exclude<CountryCode, "us">);
  const shop = `apple.com/${c.buyPath ?? c.shopPath}`;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = cc.priceOf(code, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (code === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["iPhone", "Preis auf apple.com", `Mit ${pct(t.total)} ${t.label}`],
        rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]),
        caption: `Was jedes iPhone in ${region} mit ${t.label} (${pct(t.total)}) kostet`,
        source: `[${src.label}](${src.url}); Preise von apple.com/ca`,
      };
      const parts = t.hst ? `${pct(t.hst)} HST` : t.pst ? `${pct(t.gst)} GST und ${pct(t.pst)} ${t.label.split(" + ")[1]}` : `${pct(t.gst)} GST (keine Provinzsteuer)`;
      return {
        id: "price-with-tax",
        h2: `Was kostet das ${m.name} ${inOrt(placeName)} mit Umsatzsteuer?`,
        lead: `**Etwa ${money(c, withProvinceTax(base, region!)!.total)}** für das ${m.name} 256GB in einem Store ${inOrt(placeName)}: Apples **${money(c, base)} vor Steuern**, plus ${parts} in ${region}.`,
        blocks: [table, { t: "note", text: "**Der Abhol-Store bestimmt den Satz:** Es zählt seine Provinz, nicht Ihre Wohnadresse." }],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `Was kostet das ${m.name} in Kanada mit Umsatzsteuer, je Provinz?`,
      lead: `**Von ${money(c, withProvinceTax(base, cheapest)!.total)} in ${cheapest} bis ${money(c, withProvinceTax(base, dearest)!.total)} in ${dearest}** für ein ${m.name} 256GB: Apples ${money(c, base)} verstehen sich ohne Steuer, und die Provinz des Abhol-Stores schlägt ${pct(CA_PROVINCE_TAX[cheapest].total)} bis ${pct(CA_PROVINCE_TAX[dearest].total)} auf.`,
      blocks: [{
        t: "table",
        head: ["Provinz", "Steuer", "Satz", `${m.short} 256GB mit Steuer`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pct(CA_PROVINCE_TAX[p].total), money(c, withProvinceTax(base, p)!.total)]),
        caption: "Umsatzsteuer bei Abholung im Store, in jeder Provinz mit Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); Preise von apple.com/ca`,
      }],
    };
  }
  const t = steuer(c);
  const r = t.rate;
  return {
    id: "price",
    h2: `Was kostet das ${m.name} ${inLand(code)}? ${money(c, base)}, ${taxNote(c)}`,
    lead: r == null
      ? `**${money(c, base)}, genau der Preis auf apple.com**, für das ${m.name} 256GB bei Abholung ${inOrt(placeName)}: Hongkong erhebt **weder Umsatz- noch Mehrwertsteuer**.`
      : `**${money(c, base)}** für das ${m.name} 256GB bei Abholung ${inOrt(placeName)}, **${pct(r)} ${t.name} schon enthalten** (${money(c, beforeTax(c, base))} vor Steuer); an der Kasse kommt nichts dazu.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Preis auf apple.com"] : ["iPhone", "Preis auf apple.com", `Ohne ${pct(r)} ${t.name}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `Apples Preise ${inLand(code)}, wie bei der Abholung bezahlt${r == null ? "" : ` (inkl. ${t.name})`}`,
      source: `[${src.label}](${src.url}); Preise von ${shop}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const c = C(code);
  const duo = cc.priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Was kostet das iPhone Duo ${inOrt(placeName)} mit Steuer?`, a: `Etwa ${money(c, t.total)} für das 256GB-Modell: ${pct(t.rate)} ${CA_PROVINCE_TAX[region!].label} von ${region} auf Apples ${money(c, duo)}, berechnet vom Abhol-Store.` }
      : { q: "Ist die Steuer in Apples kanadischen Preisen enthalten?", a: `Nein: Das iPhone Duo 256GB kostet ${money(c, duo)} vor Steuern. Die Provinz des Abhol-Stores schlägt GST, HST oder Provinzsteuer auf, von 5 % in Alberta bis 14,975 % in Quebec.` };
  }
  const t = steuer(c);
  return t.rate == null
    ? { q: "Zahlt man in Hongkong Umsatzsteuer auf ein iPhone?", a: `Nein: Hongkong hat weder Umsatz- noch Mehrwertsteuer. Das iPhone Duo 256GB kostet bei der Abholung ${money(c, duo)}, genau wie auf apple.com angegeben.` }
    : { q: `Ist die ${t.name} in Apples Preisen ${inLand(code)} schon enthalten?`, a: `Ja: Die ${money(c, duo)} für ein iPhone Duo 256GB enthalten ${pct(t.rate)} ${t.name}. An der Abholtheke kommt nichts dazu.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeLabel(i.cc, nameOf(i));
  return fitDe([
    `Apple Stores ${inOrt(w)}: iPhone Duo zur Abholung in ${k === 2 ? "beiden" : `allen ${n(k)}`}, live`,
    `Apple Stores ${inOrt(w)}: iPhone Duo zur Abholung, live`,
    `Apple Stores ${inOrt(w)}: iPhone-Verfügbarkeit jetzt`,
    `Apple Stores ${inOrt(w)}: iPhone-Verfügbarkeit`,
    `Apple Store ${w}: iPhone-Verfügbarkeit`,
  ], 60, i.cc);
}

/** The description's price clause. */
function priceBit(code: CountryCode, region?: string): string {
  const c = C(code);
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? ` und dem Duo für etwa ${money(c, t.total)} mit Steuer in ${region}` : ` und dem Duo für ${money(c, duo)} vor Steuern`; }
  return ` und dem Duo für ${money(c, duo)}, ${taxNote(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeLabel(i.cc, nameOf(i));
  const duo = i.stockNow.duo, pm = i.stockNow["18-pro-max"];
  return fitDe([
    satz(`${duo} von ${n(k)} Apple Stores ${inOrt(w)} ${hat(duo)} das iPhone Duo jetzt zur Abholung, ${pm} das 18 Pro Max. Store für Store, mit Restock-Zeiten${priceBit(i.cc, i.region)}`),
    `${duo} von ${n(k)} Apple Stores ${inOrt(w)} ${hat(duo)} das iPhone Duo jetzt, ${pm} das 18 Pro Max. Live je Store, mit Restock-Zeiten.`,
  ], 155, i.cc);
}

/** One sentence, live state first: how many of the place's stores list each model at this minute. */
function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, verteilt auf ${plural(i.cities, "Stadt", "Städte")},` : "";
  return `**${duo}** von **${plural(k, "Apple Store", "Apple Stores")}** ${inOrt(nameOf(i))}${cities} ${hat(duo)} in diesem Moment ein iPhone Duo zur Abholung; beim iPhone 18 Pro Max sind es **${i.stockNow["18-pro-max"]}**, beim iPhone 18 Pro **${i.stockNow["18-pro"]}**.`;
}

/** The Duo section's one-sentence answer to "which stores have it right now?". */
function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**Ja, in ${have.length} von ${n(k)} Stores**: ${words(have.map(apple), 4)} ${hat(have.length)} in diesem Moment ein iPhone Duo zur Abholung.`;
  if (st.month > 0) return `**Gerade nicht**: ${keinerDer(k)} hat ein iPhone Duo, zusammen hatten sie es ${sinceWhen()} aber schon **${mal(st.month)}** wieder im Angebot.`;
  return `**Gerade nicht**: ${keinerDer(k)} hat ein iPhone Duo, und keiner hatte ${sinceWhen()} einen bestätigten Duo-Restock.`;
}

/** The Duo section's key points: the last restock, the record, how long a listing lasted, and the alert. */
function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Letzter Duo-Restock hier:** ${whenIn(i.cc, st.lastRestock.at)} bei ${apple(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Bestätigt ${sinceWhen()}:** ${plural(st.month, "Duo-Restock", "Duo-Restocks")} in den Stores ${inOrt(w)}`);
  if (st.medianMs != null) items.push(`**So lange hält ein Angebot:** im Median etwa ${fmtDuration(st.medianMs, LANG)}, bis das Duo wieder ausverkauft ist`);
  const which = k === 1 ? "den Store" : k === 2 ? "die beiden Stores" : k === 3 ? "die drei Stores" : `die ${Math.min(k, 5)} nächsten Stores`;
  items.push(`**Schnellster Weg zu einem:** [iPhone-Duo-Alarm ${inOrt(w)} einrichten](${alert}) für ${which}, zu denen Sie fahren würden; Stores mit Alarm laufen im 5-Sekunden-Takt`);
  items.push("**Ein Alarm** ist ein Store × eine exakte Konfiguration; der Push kommt etwa 3 Sekunden, nachdem eine zweite Prüfung den Restock bestätigt hat");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Das kann sich in einer Minute ändern:** Ein Alarm bemerkt den nächsten Restock, lange bevor Sie ihn durch Neuladen von apple.com sehen würden." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = nameOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = cc.scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const pmNow = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: `Welche Apple Stores ${inOrt(w)} haben das iPhone Duo gerade?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `Ist das iPhone 18 Pro Max ${inOrt(w)} vorrätig?`,
      lead: pmNow > 0
        ? `**Ja, in ${pmNow} von ${n(k)} Stores**; von den ${n(k * pm)} Kombinationen aus Store und Konfiguration ${inOrt(w)} sind in diesem Moment **${pct(cc.pairsPct(i, "18-pro-max"))}** vorrätig.`
        : `**Gerade nicht**: ${keinerDer(k)} ${inOrt(w)} hat ein iPhone 18 Pro Max zur Abholung.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Gerade am schwersten zu finden:** ${words(scarce.map((x) => `${modelDe(x.label)} (${x.stores} von ${n(k)} Stores)`))}`] : []),
        `**iPhone 18 Pro:** ${i.stockNow["18-pro"]} von ${n(k)} Stores, ${pct(cc.pairsPct(i, "18-pro"))} seiner Kombinationen vorrätig`,
        `**Bestätigt ${sinceWhen()}:** ${i.max.month ? plural(i.max.month, "Restock des 18 Pro Max", "Restocks des 18 Pro Max") : "noch kein Restock des 18 Pro Max"}`,
        ...(i.max.medianMs != null ? [`**So lange hält ein Angebot:** im Median etwa ${fmtDuration(i.max.medianMs, LANG)}, bis ein Pro Max wieder ausverkauft ist`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  if (k === 1) return fitDe([`Apple Store ${inLand(code)}: iPhone Duo zur Abholung, live`, `Apple Store ${land(code)}: iPhone-Verfügbarkeit live`], 70, code);
  return fitDe([
    `Apple Stores ${inLand(code)}: iPhone Duo zur Abholung in ${k === 2 ? "beiden" : `allen ${n(k)}`}, live`,
    `Apple Stores ${inLand(code)}: iPhone Duo zur Abholung, live`,
    `Apple Stores ${inLand(code)}: iPhone-Verfügbarkeit live`,
  ], 70, code);
}

function homeTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  return fitDe([
    `iPhone-Verfügbarkeit ${inLand(code)}: Abholung live ${k === 1 ? "im Apple Store" : `in ${n(k)} Apple Stores`}`,
    `iPhone-Verfügbarkeit ${inLand(code)}: Abholung live`,
    `iPhone-Verfügbarkeit ${land(code)}: live`,
  ], 70, code);
}

function homeH1(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `iPhone-Verfügbarkeit zur Abholung, live im Apple Store ${inLand(code)}` : `iPhone-Verfügbarkeit zur Abholung, live in allen ${n(k)} Apple Stores ${inLand(code)}`;
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `der einzige Apple Store ${inLand(code)}` : `alle ${n(k)} Apple Stores ${inLand(code)}`;
}

function spreadPhrase(code: CountryCode): string {
  const c = C(code);
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const k = storesOf(code).length;
  const city = (x: string) => cityLabel(code, x, LANG);
  if (k === 1) return `in ${city(cities[0].name)}`;
  if (cities.length === 1) return `alle in ${city(cities[0].name)}`;
  const inCities = `in ${cities.length === 1 ? "einer Stadt" : `${n(cities.length)} Städten`}`;
  if (!c.regionNoun || regions.length === 1) return inCities;
  return `${inCities} in ${n(regions.length)} ${dativ(regionWord(c, true))}`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const all = k === 1 ? "Der Apple Store" : k === 2 ? "Beide Apple Stores" : `Alle ${n(k)} Apple Stores`;
  return {
    title: fitDe([`Ist das ${m.name} ${inLand(code)} verfügbar? ${all}, live`, `Ist das ${m.name} ${inLand(code)} verfügbar? Live`, `${m.name} Verfügbarkeit ${land(code)}`], 70, code),
    h2: [`Welche Apple Stores ${inLand(code)} haben das ${m.name} gerade?`, priceSection(code, land(code), undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = C(code);
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const price = code === "ca" ? `**${money(c, r.low)}** vor Steuern` : `**${money(c, r.low)}**, ${taxNote(c)}`;
  const now = k === 1
    ? (inStock === 0 ? `In diesem Moment hat der Apple Store ${inLand(code)} das ${m.name} **nicht** zur Abholung` : `In diesem Moment hat der Apple Store ${inLand(code)} das ${m.name} **zur Abholung**`)
    : inStock === 0
      ? `In diesem Moment hat **keiner** der ${n(k)} Apple Stores ${inLand(code)} das ${m.name} zur Abholung`
      : `In diesem Moment ${hat(inStock)} **${inStock} von ${n(k)}** Apple Stores ${inLand(code)} das ${m.name} zur Abholung`;
  return satz(`${now} (jeder Store wird **alle 15 Sekunden** geprüft); Preise ab ${price}`);
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = C(code);
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const from = `ab ${money(c, r.low)}${code === "ca" ? " vor Steuern" : ""}`;
  if (k === 1) {
    const now = inStock > 0 ? "hat das " + m.name + " in diesem Moment zur Abholung" : "hat das " + m.name + " gerade nicht zur Abholung";
    return fitDe([
      `Der Apple Store ${inLand(code)} ${now}. Konfiguration für Konfiguration, ${from}, mit Restock-Zeiten.`,
      `Der Apple Store ${inLand(code)} ${now}. Live je Konfiguration, Restock-Zeiten und Alarme.`,
    ], 155, code);
  }
  return fitDe([
    `${inStock} von ${n(k)} Apple Stores ${inLand(code)} ${hat(inStock)} das ${m.name} in diesem Moment zur Abholung. Store für Store und Konfiguration für Konfiguration, ${from}, mit Restock-Zeiten.`,
    `${inStock} von ${n(k)} Apple Stores ${inLand(code)} ${hat(inStock)} das ${m.name} jetzt. Live-Verfügbarkeit je Store und Konfiguration, Restock-Zeiten und Alarme.`,
  ], 155, code);
}

function modelRows(code: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = code === "us" ? "" : `/${code}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, n(catalogFor(m.key, code).length), n(storesNow[m.key] ?? 0), n(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home */

function homeDescription(code: CountryCode): string {
  const c = C(code);
  const k = storesOf(code).length;
  const where = k === 1 ? `im Apple Store ${inLand(code)}` : `in allen ${n(k)} Apple Stores ${inLand(code)}`;
  const what = k === 1 ? "Preise" : "Restock-Zeiten und Preise";
  return fitDe([
    `iPhone Duo, 18 Pro und 18 Pro Max: Verfügbarkeit zur Abholung ${where}, alle 15 Sekunden geprüft. ${what} in ${c.currency}, dazu ein Push, sobald Ihr Store nachlegt.`,
    `iPhone Duo, 18 Pro und 18 Pro Max: Verfügbarkeit ${where}, alle 15 Sekunden geprüft. ${what}, dazu ein Push, sobald Ihr Store nachlegt.`,
    `iPhone-Verfügbarkeit ${where}, alle 15 Sekunden geprüft, mit Push, sobald Ihr Store nachlegt.`,
  ], 155, code);
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  return `Letzter bestätigter iPhone-Duo-Restock ${inLand(code)}: **{{duo.lastRestock}}**. In diesem Moment haben **{{duo.storesNow}} von ${n(k)}** Apple ${k === 1 ? "Store" : "Stores"} ein Duo zur Abholung, **{{pm.storesNow}}** ein iPhone 18 Pro Max und **{{pro.storesNow}}** ein iPhone 18 Pro.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const code = i.cc;
  const c = C(code);
  const k = storesOf(code).length;
  const stores = storesOf(code);
  const unit = c.unit === "mi" ? "Meilen" : "Kilometern";
  return [
    {
      id: "iphone-stock",
      h2: `Welche iPhones sind ${inLand(code)} gerade vorrätig?`,
      lead: `Die Tabelle beantwortet es live: Apples eigene Verfügbarkeit zur Abholung im Store, für jede Konfiguration ${k === 1 ? `im Apple Store ${inLand(code)}` : `in allen ${n(k)} Apple Stores ${inLand(code)}`}, alle 15 Sekunden geprüft${k > 1 ? ` und aufgeschlüsselt nach Store, ${c.regionNoun ? regionWord(c) : "Stadt"} und Konfiguration` : ""}.`,
      blocks: [
        { t: "table", head: ["Modell", "Konfigurationen", "Stores mit Bestand jetzt", "Bestätigte Restocks"], rows: modelRows(code, i.storesNow, i.restocks), caption: `Live-Stand ${inLand(code)}, {{asOf}}` },
        { t: "ul", items: [
          "**Bestätigt heißt zweimal:** Eine Änderung erscheint erst, wenn eine zweite Prüfung sie bestätigt; eine fehlerhafte Antwort von apple.com wird so nie zum Restock oder Ausverkauf",
          "**Erstsichtungen sind keine Restocks:** Eine Konfiguration, die zum ersten Mal auftaucht, setzt nur den Ausgangswert",
          `**Das Protokoll ist die Quelle:** Jede bestätigte Änderung kommt ins [Restock-Protokoll](${i.restocksPath}), aus dem die Restock-Diagramme auf ${i.index?.indexable ? `[den Store-Seiten](${i.index.path})` : "der Store-Seite"} entstehen`,
          `**Abdeckung:** ${spreadPhrase(code)}, mit Apples eigenen Preisen und Teilenummern für ${land(code)}; Stores mit Alarm laufen im 5-Sekunden-Takt`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, land(code)),
    {
      id: "alerts",
      h2: `Wie funktionieren Restock-Alarme ${inLand(code)}?`,
      lead: `Sie wählen ${k === 1 ? "den Store" : "die Stores"} und das genaue iPhone; sobald ${k === 1 ? "der Store" : "einer davon"} es zur Abholung im Store anbietet, kommt etwa 3 Sekunden nach dem bestätigten Restock ein Push auf Ihr Handy.`,
      blocks: [
        { t: "ol", items: [
          k === 1
            ? `Wählen Sie unter **Alarme einrichten** iPhone, Speicher und Farbe; der Store ist ${apple(stores[0])} in ${cityLabel(code, stores[0].city, LANG)}.`
            : `Wählen Sie unter **Alarme einrichten** iPhone, Speicher und Farbe und kreuzen Sie dann die Stores an, die Sie erreichen; die nächsten stehen oben, mit ${unit} auf der Straße und Fahrzeit.`,
          "Auf dem iPhone fügen Sie RestockWire zum Home-Bildschirm hinzu und erlauben Mitteilungen; iOS stellt Web-Push nur an eine installierte App zu ([Anleitung](/phone-alerts)).",
          "Kommt der Push, öffnen Sie daraus apple.com und kaufen mit Abholung in genau diesem Store.",
        ] },
        { t: "table", head: ["Tarif", "Monatlich (USD)", "Alarme"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Ein Alarm = ein Store × eine exakte Konfiguration; Stöbern bleibt kostenlos, und das Tempo ist in jedem Tarif gleich ([Preise](/pricing))" },
        { t: "note", text: "**Unsere Einschätzung:** Das Duo lohnt Alarme in jedem Store, den Sie erreichen; beim 18 Pro und Pro Max erst die Live-Zahlen ansehen." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const p = code === "us" ? "" : `/${code}`;
  const when = rt.n === 0
    ? `Seit Beginn der Erfassung am 2. November noch keiner bestätigt. [Wann ist das iPhone Duo ${inLand(code)} wieder verfügbar?](${rt.path}) zählt jeden nach Ortszeit und Wochentag, sobald er kommt.`
    : rt.peakHour != null
      ? `Die meisten kommen gegen **${uhr(rt.peakHour)} Ortszeit**: ${n(rt.n)} bestätigte Restocks in ${rt.stores} von ${rt.storesTotal} Stores seit dem 2. November. [Stunde für Stunde und Tag für Tag](${rt.path}).`
      : `${n(rt.n)} bestätigte Restocks in ${rt.stores} von ${rt.storesTotal} Stores seit dem 2. November, an zu wenigen Tagen für eine typische Uhrzeit. [Stunde für Stunde und Tag für Tag](${rt.path}).`;
  return [
    k === 1
      ? { q: `Hat der Apple Store ${inLand(code)} das iPhone Duo in diesem Moment?`, a: `**{{duo.storesNow}} von 1** bei der letzten Prüfung ({{asOf}}). [iPhone-Duo-Verfügbarkeit ${inLand(code)}](${p}/in-stock/iphone-duo) zeigt jede Konfiguration und aktualisiert sich alle 15 Sekunden.` }
      : { q: `Welche Apple Stores ${inLand(code)} haben das iPhone Duo in diesem Moment?`, a: `{{duo.storesNow}} von ${n(k)} bei der letzten Prüfung ({{asOf}}). [iPhone-Duo-Verfügbarkeit ${inLand(code)}](${p}/in-stock/iphone-duo) nennt jeden Store und jede Konfiguration und aktualisiert sich alle 15 Sekunden.` },
    { q: `Wann ist das iPhone Duo ${inLand(code)} wieder verfügbar?`, a: when },
    { q: `Wie schnell bemerkt RestockWire einen Restock ${inLand(code)}?`, a: `Stores mit Alarm werden alle 5 Sekunden geprüft, jeder Apple Store ${inLand(code)} alle 15; ein erstes „verfügbar“ wird binnen einer Sekunde erneut geprüft. Der bestätigte Restock ist etwa 3 Sekunden später auf Ihrem Handy.` },
    { q: "Brauche ich einen Tarif, um die Verfügbarkeit zu sehen?", a: "Nein: Live-Verfügbarkeit, Karte und Restock-Protokoll sind kostenlos. Ein Tarif bringt Alarme, abgerechnet in US-Dollar: Plus $5 im Monat für 10, Pro $10 für 20, Max $20 für 50, jederzeit kündbar ([Preise](/pricing))." },
    taxFaq(code, land(code)),
    { q: "Hält ein Alarm das iPhone für mich zurück?", a: `Nein; das tut nur eine Abholbestellung auf apple.com. Der Alarm bringt Sie zuerst zur Kasse, und Apple legt das Gerät zurück, sobald Sie bezahlt haben ([Apples Hilfe zur Abholung](${pickupHelp(code).url})).` },
  ];
}

const home: Dict["place"]["home"] = {
  appName: (code: CountryCode) => `RestockWire iPhone-Verfügbarkeit ${land(code)}`,
  offer: "Live-Verfügbarkeit, Karte und Restock-Protokoll sind kostenlos; Alarm-Tarife ab $5 im Monat",
  itemList: (code: CountryCode) => `Apple Stores ${inLand(code)}`,
  restockTimesChip: "Restock-Zeiten",
  storesByRegion: (code: CountryCode) => `Stores nach ${regionWord(C(code))}`,
  browse: (code: CountryCode) => `Verfügbarkeit nach Ort ${inLand(code)}`,
  selloutH2: (code: CountryCode) => `Wie lange hält ein iPhone-Restock ${inLand(code)}?`,
  selloutLabel: (code: CountryCode) => `in den Apple Stores ${inLand(code)}`,
  last24Label: (code: CountryCode) => inLand(code),
  newsroom: "Apple Newsroom: Das iPhone Duo kommt in Apple Stores weltweit (23. Oktober 2026)",
};

function storeTitle(s: Store, region?: string): string {
  const name = apple(s);
  const shown = region && !s.name.toLowerCase().includes(region.toLowerCase()) && !name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  return fitDe(content.titles.store(name, shown), 60, s.country);
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel,
  whenIn,
  taxSentence,
  priceSection,
  taxFaq,
  placeTitle,
  placeDescription,
  placeIntro,
  placeSections,
  storesIndexTitle,
  homeTitle,
  homeH1,
  allStoresPhrase,
  spreadPhrase,
  modelPageTitles,
  modelIntro,
  modelDescription,
  modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home,
  storeTitle,
  sources: (code: Exclude<CountryCode, "us">) => ({
    pickupHelp: { label: `Apple: Hilfe zu Versand und Abholung (${land(code)}) – was Sie zur Abholung mitbringen`, url: pickupHelp(code).url },
    storeList: { label: `Apple: Liste aller Apple Stores (${land(code)})`, url: storeListSource(code).url },
    tax: taxSource(code),
  }),
};

