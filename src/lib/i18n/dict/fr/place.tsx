/**
 * Chaînes françaises : place — les textes des pages pays en français (France, Belgique, Suisse, Canada) : titres,
 * introductions « réponse d’abord », sections par mot-clé, prix et taxes, FAQ, à partir des chiffres en direct.
 * Canada : prix Apple avant taxes, TPS / TVH / TVQ / TVP / TVD par province ; ailleurs TVA incluse (20 %, 21 %, 8,1 %).
 * Mêmes arguments et mêmes formes de retour que l’anglais (lib/seo/countryCopy.ts).
 */
import type { Dict } from "../en";
import * as cc from "@/lib/seo/countryCopy";
import type { IntlPlaceInput, HomeCopyInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, TAX_SOURCES, beforeTax, includedRate, taxName, withProvinceTax, pickupHelp, storeListSource } from "@/content/country-tax";
import type { Source } from "@/lib/content/types";
import type { Block, Faq } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { FaqItem } from "@/lib/seo/enrich";
import { alertHref, fmtDuration } from "@/lib/seo/enrich";
import { fitTitleW, list, num, plural, price, stamp, hour } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel } from "@/lib/i18n/places";
import { IN, NAME, L, cap, dans, noun } from "./util";

/* ------------------------------------------------------------------ small helpers */

const money = (code: CountryCode, v: number) => price(L(code), COUNTRIES[code], v);
const N = (code: CountryCode | undefined, v: number) => num(L(code), v);
const rate = (code: CountryCode, r: number) => `${num(L(code), r)} %`;
const apple = (s: Store) => appleStoreLabel(s, L(s.country));
/** "TVA", "TPS", "taxe à la consommation": the tax inside a price. */
function taxFr(c: Country): string {
  const t = taxName(c);
  return t === "VAT" ? "TVA" : t === "GST" ? "TPS" : t === "consumption tax" ? "taxe à la consommation" : "taxe";
}
/** "TVA (20 %) incluse" / "avant taxes" (Canada) / "sans taxe de vente" (Hong Kong). */
export function taxNote(code: CountryCode): string {
  const c = COUNTRIES[code];
  if (!c.pricesIncludeTax) return code === "ca" ? "avant taxes (TPS/TVH et taxe provinciale)" : "avant taxe de vente";
  const r = includedRate(c);
  return r == null ? "sans taxe de vente" : `${taxFr(c)} (${rate(code, r)}) incluse`;
}
/** A place given in French: the country itself reads "en France", anything else "à Paris", "au Québec". */
function where(code: CountryCode, place: string): string {
  return place === NAME[code] || place === COUNTRIES[code].name ? IN[code] : dans(place);
}
/** The French name of a page's place (the input carries the English one). */
function placeName(i: IntlPlaceInput): string {
  const lg = L(i.cc);
  return i.kind === "state" ? regionLabel(i.cc, i.name, lg) : cityLabel(i.cc, i.name, lg);
}
/** A place that is also a US store city or state gets its country: "London (Canada)". */
function labelOf(code: CountryCode, name: string): string {
  return cc.placeLabel(code, name) !== name ? `${name} (${NAME[code]})` : name;
}
const provinceFr = (p: string) => regionLabel("ca", p, "fr-CA");

/* ------------------------------------------------------------------ Canada: provincial taxes in French */

/** The provincial part's French name: TVP (C.-B.), TVD (Manitoba), TVQ (Québec). */
const PST: Record<string, string> = { "British Columbia": "TVP", Manitoba: "TVD", Quebec: "TVQ" };
function caLabel(p: string): string {
  const t = CA_PROVINCE_TAX[p];
  return t.hst ? "TVH" : t.pst ? `TPS + ${PST[p] ?? "taxe provinciale"}` : "TPS";
}
/** "la TPS de 5 % et la TVQ de 9,975 %". */
function caParts(p: string): string {
  const t = CA_PROVINCE_TAX[p];
  if (t.hst) return `la TVH de ${rate("ca", t.hst)}`;
  if (t.pst) return `la TPS de ${rate("ca", t.gst)} et la ${PST[p] ?? "taxe provinciale"} de ${rate("ca", t.pst)}`;
  return `la TPS de ${rate("ca", t.gst)}, sans taxe de vente provinciale`;
}

/* ------------------------------------------------------------------ sources in French */

/** Apple's online store path for French readers (prices, pickup help). */
const SHOP: Partial<Record<CountryCode, string>> = { fr: "fr", be: "be-fr", ch: "ch-fr", ca: "ca" };
const RETAIL: Partial<Record<CountryCode, string>> = { fr: "fr", be: "befr", ch: "chfr", ca: "ca/fr" };
const EU_FR: Source = { label: "Your Europe (Union européenne) : taux de TVA appliqués dans les pays de l’UE", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_fr.htm" };
const TAX_FR: Partial<Record<CountryCode, Source>> = {
  fr: EU_FR,
  be: EU_FR,
  ch: { label: "Administration fédérale des contributions (AFC) : taux de TVA en Suisse", url: "https://www.estv.admin.ch/estv/fr/accueil/taxe-sur-la-valeur-ajoutee/taux-tva-suisse.html" },
  ca: { label: "Agence du revenu du Canada : calculatrice de la TPS/TVH et tableau des taux", url: "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/tps-tvh-entreprises/facturer-percevoir-quel-taux/calculatrice.html" },
};
function taxSource(code: Exclude<CountryCode, "us">): Source {
  return TAX_FR[code] ?? { label: `${TAX_SOURCES[code].label} (en anglais)`, url: TAX_SOURCES[code].url };
}
function pickupHelpFr(code: CountryCode): Source {
  const p = SHOP[code];
  // Apple's Canadian help page exists in English only (the /ca/fr/shop help answers 404).
  if (p && code !== "ca") return { label: `Apple : aide Livraison et retrait (${NAME[code]}), ce qu’il faut apporter au retrait`, url: `https://www.apple.com/${p}/shop/help/shipping_delivery` };
  const en = pickupHelp(code);
  return { label: `Apple : aide Livraison et retrait (${NAME[code]}, en anglais), ce qu’il faut apporter au retrait`, url: en.url };
}
function storeListFr(code: CountryCode): Source {
  const p = RETAIL[code];
  if (p) return { label: `Apple : liste des magasins (${NAME[code]})`, url: `https://www.apple.com/${p}/retail/storelist/` };
  return { label: `Apple : liste des magasins (${NAME[code]}, en anglais)`, url: storeListSource(code).url };
}
const shopPath = (code: CountryCode) => SHOP[code] ?? COUNTRIES[code].buyPath ?? COUNTRIES[code].shopPath;

/* ------------------------------------------------------------------ time */

function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${cc.INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "depuis le début du suivi, le 2 novembre" : "sur les 30 derniers jours";
}
function whenIn(code: CountryCode, iso: string | Date): string {
  return stamp(L(code), iso, COUNTRIES[code].timeZone, true);
}

/* ------------------------------------------------------------------ tax */

function taxSentence(code: CountryCode, region?: string): string {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Un iPhone Duo 256GB revient à environ ${money(code, t.total)} ${dans(provinceFr(region!))} : les ${money(code, duo)} d’Apple plus ${rate(code, t.rate)} de ${caLabel(region!)}.`;
    return `Un iPhone Duo 256GB est à ${money(code, duo)} avant taxes ; la province du magasin de retrait ajoute de 5 % à 15 % au comptoir.`;
  }
  const r = includedRate(c);
  if (r == null) return `${money(code, duo)}, c’est le prix total d’un iPhone Duo 256GB au retrait : il n’y a pas de taxe de vente ${IN[code]}.`;
  return `${money(code, duo)}, c’est le prix total d’un iPhone Duo 256GB au retrait ${IN[code]}, ${taxFr(c)} de ${rate(code, r)} incluse.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(code: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const base = cc.priceOf(code, model) ?? 0;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = cc.priceOf(code, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  const src = code === "us" ? TAX_SOURCES.ca : taxSource(code);
  if (code === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const R = provinceFr(region!);
      const table: Block = {
        t: "table",
        head: ["iPhone", "Prix apple.com", `Avec ${rate(code, t.total)} de ${caLabel(region!)}`],
        rows: rows.map(([label, p]) => [label, money(code, p), money(code, withProvinceTax(p, region!)!.total)]),
        caption: `Ce que coûte chaque iPhone ${dans(R)} avec la ${caLabel(region!)} (${rate(code, t.total)})`,
        source: `[${src.label}](${src.url}) ; prix d’apple.com/ca`,
      };
      return {
        id: "price-with-tax",
        h2: `Combien coûte l’${m.name} ${dans(placeName)} une fois les taxes ajoutées ?`,
        lead: `**Environ ${money(code, withProvinceTax(base, region!)!.total)}** pour l’${m.name} 256GB dans un magasin ${dans(placeName)} : les **${money(code, base)} avant taxes** d’Apple, plus ${caParts(region!)}${placeName !== R ? ` (${R})` : ""}.`,
        blocks: [table, { t: "note", text: "**C’est le magasin de retrait qui fixe le taux :** sa province décide de la taxe, pas votre adresse." }],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `Combien coûte l’${m.name} au Canada une fois les taxes ajoutées, province par province ?`,
      lead: `**De ${money(code, withProvinceTax(base, cheapest)!.total)} ${dans(provinceFr(cheapest))} à ${money(code, withProvinceTax(base, dearest)!.total)} ${dans(provinceFr(dearest))}** pour un ${m.name} 256GB : les ${money(code, base)} d’Apple s’entendent hors taxes, et la province du magasin de retrait ajoute de ${rate(code, CA_PROVINCE_TAX[cheapest].total)} à ${rate(code, CA_PROVINCE_TAX[dearest].total)}.`,
      blocks: [{
        t: "table",
        head: ["Province", "Taxe", "Taux", `${m.short} 256GB taxes comprises`],
        rows: provinces.map((p) => [provinceFr(p), caLabel(p), rate(code, CA_PROVINCE_TAX[p].total), money(code, withProvinceTax(base, p)!.total)]),
        caption: "Taxe de vente sur un retrait en magasin, dans chaque province qui compte un Apple Store",
        source: `[${src.label}](${src.url}) ; prix d’apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxFr(c);
  return {
    id: "price",
    h2: `Combien coûte l’${m.name} ${IN[code]} ? ${money(code, base)}, ${taxNote(code)}`,
    lead: r == null
      ? `**${money(code, base)}, exactement le prix d’apple.com**, pour l’${m.name} 256GB au retrait ${where(code, placeName)} : il n’y a **ni taxe de vente** ni TVA ${IN[code]}.`
      : `**${money(code, base)}** pour l’${m.name} 256GB au retrait ${where(code, placeName)}, **${tn} de ${rate(code, r)} déjà incluse** (${money(code, beforeTax(c, base))} hors taxes) ; rien ne s’ajoute au comptoir.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Prix apple.com"] : ["iPhone", "Prix apple.com", `Hors ${tn} de ${rate(code, r)}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(code, p)] : [label, money(code, p), money(code, beforeTax(c, p))])),
      caption: `Prix d’Apple ${IN[code]}, tels que payés au retrait${r == null ? "" : ` (${tn} incluse)`}`,
      source: `[${src.label}](${src.url}) ; prix d’apple.com/${shopPath(code)}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Quel est le prix de l’iPhone Duo ${dans(placeName)}, taxes comprises ?`, a: `Environ ${money(code, t.total)} pour le 256GB : ${rate(code, t.rate)} de ${caLabel(region!)} (${provinceFr(region!)}) en plus des ${money(code, duo)} d’Apple, perçus par le magasin de retrait.` }
      : { q: "Les prix canadiens d’Apple incluent-ils les taxes ?", a: `Non : l’iPhone Duo 256GB est à ${money(code, duo)} avant taxes. La province du magasin de retrait ajoute la TPS, la TVH ou la taxe provinciale, de 5 % en Alberta à 14,975 % au Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: `Paie-t-on une taxe de vente sur un iPhone ${IN[code]} ?`, a: `Non : il n’y a ni taxe de vente ni TVA ${IN[code]}. L’iPhone Duo 256GB coûte ${money(code, duo)} au retrait, exactement le prix affiché sur apple.com.` }
    : { q: `La ${taxFr(c)} est-elle déjà comprise dans les prix d’Apple ${IN[code]} ?`, a: `Oui : les ${money(code, duo)} d’un iPhone Duo 256GB comprennent ${rate(code, r)} de ${taxFr(c)}. Rien de plus ne s’ajoute au comptoir de retrait.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = labelOf(i.cc, placeName(i));
  return fitTitleW([
    ...(k > 1 ? [`Apple Store ${w} : retrait iPhone Duo dans ${k === 2 ? "les deux" : `les ${N(i.cc, k)}`}, en direct`] : []),
    `Apple Store ${w} : retrait iPhone Duo en direct`,
    `Apple Store ${w} : stock iPhone maintenant`,
    `Apple Store ${w} : stock iPhone`,
  ]);
}

function priceBit(code: CountryCode, region?: string): string {
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, et le Duo à environ ${money(code, t.total)} avec les taxes ${dans(provinceFr(region!))}` : `, et le Duo à ${money(code, duo)} avant taxes`; }
  return `, et le Duo à ${money(code, duo)}, ${taxNote(code)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = N(i.cc, i.stores.length);
  const w = dans(labelOf(i.cc, placeName(i)));
  const duo = i.stockNow.duo;
  return fitTitleW([
    `${N(i.cc, duo)} des ${k} Apple Store ${w} ${duo > 1 ? "proposent" : "propose"} l’iPhone Duo en retrait maintenant, ${N(i.cc, i.stockNow["18-pro-max"])} le 18 Pro Max. Magasin par magasin, avec les heures de retour en stock${priceBit(i.cc, i.region)}.`,
    `${N(i.cc, duo)} des ${k} Apple Store ${w} ${duo > 1 ? "proposent" : "propose"} l’iPhone Duo maintenant, ${N(i.cc, i.stockNow["18-pro-max"])} le 18 Pro Max. En direct par magasin, avec les heures de retour en stock.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const lg = L(i.cc);
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, répartis dans ${plural(lg, i.cities, { one: "# ville", other: "# villes" })},` : "";
  return `**${N(i.cc, duo)}** des **${plural(lg, i.stores.length, { one: "# Apple Store", other: "# Apple Store" })}** ${dans(placeName(i))}${cities} ${duo > 1 ? "proposent" : "propose"} un iPhone Duo en retrait à cette minute ; l’iPhone 18 Pro Max est à **${N(i.cc, i.stockNow["18-pro-max"])}**, l’iPhone 18 Pro à **${N(i.cc, i.stockNow["18-pro"])}**.`;
}

/** The two scarcest configurations of a model at a place, in French ("256GB Ciel nocturne"). */
function scarcest(i: IntlPlaceInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  const items = catalogFor(model, i.cc);
  const counts = new Map<string, number>(items.map((c) => [c.partNumber, 0]));
  for (const s of i.stores) for (const p of i.stock.get(s.storeNumber)?.perModel[model].parts ?? []) if (counts.has(p)) counts.set(p, (counts.get(p) ?? 0) + 1);
  const by = new Map(items.map((c) => [c.partNumber, c]));
  return [...counts.entries()].map(([p, n]) => ({ label: `${by.get(p)!.storage} ${colorLabel(by.get(p)!.color, L(i.cc))}`, stores: n })).sort((a, b) => a.stores - b.stores).slice(0, k);
}

function duoLead(i: IntlPlaceInput): string {
  const lg = L(i.cc);
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**Oui, dans ${N(i.cc, have.length)} ${k === 1 ? "magasin sur 1" : `des ${N(i.cc, k)} magasins`}** : ${list(lg, have.map((s) => apple(s)), 4, (r) => `${N(i.cc, r)} autres`)} ${have.length === 1 ? "propose" : "proposent"} un iPhone Duo en retrait à cette minute.`;
  const none = k === 1 ? "le magasin ne propose pas" : `aucun des ${N(i.cc, k)} magasins ne propose`;
  if (st.month > 0) return `**Pas à cette minute** : ${none} d’iPhone Duo, même si ${k === 1 ? "il l’a reçu" : "ensemble, ils l’ont reçu"} **${plural(lg, st.month, { one: "# fois", other: "# fois" })}** ${sinceWhen()}.`;
  return `**Pas à cette minute** : ${none} d’iPhone Duo, et aucun retour en stock du Duo n’a été confirmé ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const lg = L(i.cc);
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Dernier retour en stock du Duo ici :** ${whenIn(i.cc, st.lastRestock.at)} chez ${apple(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Confirmés ${sinceWhen()} :** ${plural(lg, st.month, { one: "# retour en stock du Duo", other: "# retours en stock du Duo" })} dans les magasins ${dans(w)}`);
  if (st.medianMs != null) items.push(`**Durée de mise en ligne :** environ ${fmtDuration(st.medianMs, lg)} en médiane avant que le Duo soit de nouveau épuisé`);
  const targets = k === 1 ? "le magasin" : k <= 3 ? `les ${k === 2 ? "deux" : "trois"} magasins` : `les ${Math.min(k, 5)} magasins les plus proches`;
  items.push(`**Le chemin le plus court :** [mettez l’iPhone Duo sur le fil ${dans(w)}](${alert}) pour ${targets} où vous pouvez vous rendre ; les magasins avec alertes sont vérifiés toutes les 5 secondes`);
  items.push("**Une règle d’alerte** = un magasin × une configuration exacte ; la notification arrive environ 3 secondes après qu’une deuxième vérification a confirmé le retour en stock");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Cela change en une minute :** une alerte voit le prochain retour en stock bien avant qu’une actualisation d’apple.com ne le montre." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const lg = L(i.cc);
  const k = i.stores.length;
  const w = placeName(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const of = (x: number) => `${N(i.cc, x)} ${k === 1 ? "magasin sur 1" : `des ${N(i.cc, k)} magasins`}`;
  const pmNow = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: `Quels Apple Store ${dans(w)} ont l’iPhone Duo en ce moment ?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `L’iPhone 18 Pro Max est-il en stock ${dans(w)} ?`,
      lead: pmNow > 0
        ? `**Oui, dans ${of(pmNow)}**, avec **${cc.pairsPct(i, "18-pro-max")} %** des ${N(i.cc, k * pm)} couples magasin × configuration ${dans(w)} en ligne à cette minute.`
        : `**Pas à cette minute** : ${k === 1 ? "le magasin ne propose pas" : `aucun des ${N(i.cc, k)} magasins ${dans(w)} ne propose`} d’iPhone 18 Pro Max en retrait.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Les plus difficiles à trouver en ce moment :** ${list(lg, scarce.map((x) => `${x.label} (${N(i.cc, x.stores)} magasin${x.stores > 1 ? "s" : ""} sur ${N(i.cc, k)})`))}`] : []),
        `**iPhone 18 Pro :** ${N(i.cc, i.stockNow["18-pro"])} magasin${i.stockNow["18-pro"] > 1 ? "s" : ""} sur ${N(i.cc, k)}, ${cc.pairsPct(i, "18-pro")} % de ses couples en ligne`,
        `**Confirmés ${sinceWhen()} :** ${i.max.month ? plural(lg, i.max.month, { one: "# retour en stock du 18 Pro Max", other: "# retours en stock du 18 Pro Max" }) : "aucun retour en stock du 18 Pro Max pour l’instant"}`,
        ...(i.max.medianMs != null ? [`**Durée de mise en ligne :** environ ${fmtDuration(i.max.medianMs, lg)} en médiane avant qu’un Pro Max soit de nouveau épuisé`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  return fitTitleW([
    ...(k > 1 ? [`Apple Store ${NAME[code]} : retrait iPhone Duo dans ${k === 2 ? "les deux" : `les ${N(code, k)}`}, en direct`] : []),
    `Apple Store ${NAME[code]} : retrait iPhone Duo en direct`,
    `Apple Store ${NAME[code]} : stock iPhone en direct`,
  ], 70);
}

function homeTitle(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  if (k === 1) {
    const city = cityLabel(code, stores[0].city, L(code));
    return fitTitleW([`Stock iPhone ${NAME[code]} : retrait en direct à l’Apple Store de ${city}`, `Stock iPhone ${NAME[code]} : retrait en direct à ${city}`, `Stock iPhone ${IN[code]} : ${apple(stores[0])}`]);
  }
  return fitTitleW([
    `Stock iPhone ${NAME[code]} : retrait en direct dans ${N(code, k)} Apple Store`,
    `Stock iPhone ${NAME[code]} : retrait en direct`,
    `Stock iPhone ${IN[code]} en direct`,
  ]);
}

function homeH1(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  if (k === 1) {
    const city = cityLabel(code, stores[0].city, L(code));
    return `Stock iPhone en retrait, en direct, à l’Apple Store ${/^[aeiouyhâéèêîôû]/i.test(city) ? `d’${city}` : `de ${city}`}`;
  }
  return `Stock iPhone en retrait, en direct, dans les ${N(code, k)} Apple Store ${IN[code]}`;
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `l’unique Apple Store ${IN[code]}` : `les ${N(code, k)} Apple Store ${IN[code]}`;
}

function spreadPhrase(code: CountryCode): string {
  const c = COUNTRIES[code];
  const lg = L(code);
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const k = storesOf(code).length;
  const villes = plural(lg, cities.length, { one: "# ville", other: "# villes" });
  if (k === 1) return `à ${cityLabel(code, cities[0].name, lg)}`;
  if (cities.length === 1) return `tous à ${cityLabel(code, cities[0].name, lg)}`;
  if (!c.regionNoun || regions.length === 1) return `dans ${villes}`;
  const nn = noun(c);
  return `dans ${villes} ${cities.length === 1 ? "répartie" : "réparties"} sur ${N(code, regions.length)} ${regions.length === 1 ? nn.one : nn.other}`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const all = k === 1 ? "l’Apple Store" : k === 2 ? "les deux Apple Store" : `les ${N(code, k)} Apple Store`;
  return {
    title: fitTitleW([`L’${m.name} est-il en stock ${IN[code]} ? ${cap(all)}, en direct`, `L’${m.name} est-il en stock ${IN[code]} ? En direct`, `Stock ${m.name} ${IN[code]}`], 70),
    h2: [`Quels Apple Store ${IN[code]} ont l’${m.name} en ce moment ?`, priceSection(code, NAME[code], undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const p = code === "ca" ? `**${money(code, r.low)}** avant taxes` : `**${money(code, r.low)}**, ${taxNote(code)}`;
  const now = inStock === 0
    ? (k === 1 ? `À cette minute, l’Apple Store ${IN[code]} ne propose **pas** l’${m.name} en retrait` : `À cette minute, **aucun** des ${N(code, k)} Apple Store ${IN[code]} ne propose l’${m.name} en retrait`)
    : `À cette minute, **${N(code, inStock)} ${k === 1 ? "sur 1" : `des ${N(code, k)}`}** Apple Store ${IN[code]} ${inStock === 1 ? "propose" : "proposent"} l’${m.name} en retrait`;
  return `${now} (chaque magasin est vérifié **toutes les 15 secondes**) ; les prix commencent à ${p}.`;
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const of = k === 1 ? `${N(code, inStock)} sur 1` : `${N(code, inStock)} des ${N(code, k)}`;
  const verb = inStock > 1 ? "proposent" : "propose";
  return fitTitleW([
    `${of} Apple Store ${IN[code]} ${verb} l’${m.name} en retrait à cette minute. Magasin par magasin et configuration par configuration, dès ${money(code, r.low)}${code === "ca" ? " avant taxes" : ""}, avec les heures de retour en stock.`,
    `${of} Apple Store ${IN[code]} ${verb} l’${m.name} maintenant. Stock de retrait en direct par magasin et configuration, heures de retour en stock et alertes.`,
  ], 155);
}

function modelRows(code: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = code === "us" ? "" : `/${code}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, N(code, catalogFor(m.key, code).length), N(code, storesNow[m.key] ?? 0), N(code, restocks[m.key] ?? 0)]);
}

function homeDescription(code: CountryCode): string {
  const k = storesOf(code).length;
  return `Le stock en retrait des iPhone Duo, 18 Pro et 18 Pro Max en direct dans ${allStoresPhrase(code)}, vérifié toutes les 15 secondes. ${k === 1 ? "Prix" : "Heures de retour en stock et prix"} en ${COUNTRIES[code].currency}, et une notification à la seconde où votre magasin est réapprovisionné.`;
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  const of = k === 1 ? "sur 1" : `des ${N(code, k)}`;
  return `Dernier retour en stock confirmé d’iPhone Duo ${IN[code]} : **{{duo.lastRestock}}**. À cette minute, **{{duo.storesNow}} ${of}** Apple Store proposent un Duo en retrait, **{{pm.storesNow}}** un iPhone 18 Pro Max et **{{pro.storesNow}}** un iPhone 18 Pro.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const code = i.cc;
  const c = COUNTRIES[code];
  const stores = storesOf(code);
  const k = stores.length;
  const lg = L(code);
  return [
    {
      id: "iphone-stock",
      h2: `Quels iPhone sont en stock ${IN[code]} en ce moment ?`,
      lead: `Le tableau y répond en direct : la disponibilité en retrait en magasin publiée par apple.com pour chaque configuration dans ${allStoresPhrase(code)}, vérifiée toutes les 15 secondes${k > 1 ? ` et détaillée par magasin, par ${c.regionNoun ? noun(c).one : "ville"} et par configuration` : ""}.`,
      blocks: [
        { t: "table", head: ["Modèle", "Configurations", "Magasins qui le proposent", "Retours en stock confirmés"], rows: modelRows(code, i.storesNow, i.restocks), caption: `Le fil ${IN[code]} au {{asOf}}` },
        { t: "ul", items: [
          "**Confirmé veut dire deux fois :** un changement n’est publié que lorsqu’une deuxième vérification concorde ; une réponse erronée d’apple.com ne devient jamais un retour en stock ni une rupture",
          "**Une première observation n’est pas un retour en stock :** une configuration vue pour la première fois sert seulement de point de départ",
          `**Le journal fait foi :** chaque changement confirmé entre dans le [journal des retours en stock](${i.restocksPath}), qui dessine les graphiques de ${i.index?.indexable ? `[chaque page magasin](${i.index.path})` : "la page du magasin"}`,
          `**Couverture :** ${spreadPhrase(code)}, avec les prix et références d’Apple ${IN[code]} ; les magasins avec alertes sont vérifiés toutes les 5 secondes`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, NAME[code]),
    {
      id: "alerts",
      h2: `Comment fonctionnent les alertes de retour en stock ${IN[code]} ?`,
      lead: `Vous choisissez ${k === 1 ? "le magasin" : "les magasins"} et le téléphone exact ; quand ${k === 1 ? "le magasin" : "l’un d’eux"} le propose en retrait en magasin, une notification arrive sur votre téléphone environ 3 secondes après la confirmation du retour en stock.`,
      blocks: [
        { t: "ol", items: [
          k === 1 ? `Choisissez l’iPhone, la capacité et la couleur sous **M’alerter** ; le magasin est ${apple(stores[0])} à ${cityLabel(code, stores[0].city, lg)}.` : "Choisissez l’iPhone, la capacité et la couleur sous **M’alerter**, puis cochez les magasins où vous pouvez vous rendre ; les plus proches viennent en premier, avec la distance par la route en kilomètres et le temps de trajet.",
          "Sur iPhone, ajoutez RestockWire à l’écran d’accueil et autorisez les notifications ; iOS ne délivre les notifications web qu’à une app installée ([comment l’installer](/phone-alerts)).",
          "Quand la notification arrive, ouvrez apple.com depuis celle-ci et payez avec le retrait en magasin dans ce magasin.",
        ] },
        { t: "table", head: ["Formule", "Par mois (USD)", "Règles d’alerte"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Une règle = un magasin × une configuration exacte ; consulter reste gratuit, et la vitesse est la même dans toutes les formules ([tarifs](/pricing))" },
        { t: "note", text: "**Notre lecture :** le Duo mérite une alerte dans chaque magasin accessible ; pour les 18 Pro et Pro Max, regardez d’abord les chiffres en direct." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const p = code === "us" ? "" : `/${code}`;
  const count = plural(L(code), rt.n, { one: "# retour en stock confirmé", other: "# retours en stock confirmés" });
  const where = rt.storesTotal === 1 ? "" : ` dans ${N(code, rt.stores)} des ${N(code, rt.storesTotal)} magasins`;
  const when = rt.n === 0
    ? `Aucun confirmé depuis le début du suivi, le 2 novembre. [Quand Apple remet-il l’iPhone Duo en stock ${IN[code]} ?](${rt.path}) les compte par heure locale et par jour, au fur et à mesure.`
    : rt.peakHour != null
      ? `La plupart tombent vers **${hour(L(code), rt.peakHour, true)}, heure locale** : ${count}${where} depuis le 2 novembre. [Heure par heure et jour par jour](${rt.path}).`
      : `${cap(count)}${where} depuis le 2 novembre, sur trop peu de jours pour désigner une heure habituelle. [Heure par heure et jour par jour](${rt.path}).`;
  return [
    { q: `Quels Apple Store ${IN[code]} proposent l’iPhone Duo à cette minute ?`, a: `{{duo.storesNow}} sur ${N(code, k)} à la dernière vérification ({{asOf}}). [Stock iPhone Duo ${IN[code]}](${p}/in-stock/iphone-duo) nomme chaque magasin et chaque configuration, actualisé toutes les 15 secondes.` },
    { q: `Quand Apple remet-il l’iPhone Duo en stock ${IN[code]} ?`, a: when },
    { q: `À quelle vitesse RestockWire voit-il un retour en stock ${IN[code]} ?`, a: `Les magasins avec alertes sont vérifiés toutes les 5 secondes, et ${k === 1 ? `l’Apple Store ${IN[code]}` : `chaque Apple Store ${IN[code]}`} toutes les 15 secondes ; un premier « disponible » est revérifié dans la seconde. Le retour en stock confirmé arrive sur votre téléphone environ 3 secondes plus tard.` },
    { q: "Faut-il une formule pour consulter le stock ?", a: "Non : le stock en direct, la carte et le journal des retours en stock sont gratuits. Une formule ajoute des règles d’alerte, facturées en dollars américains : Plus à $5 par mois pour 10, Pro à $10 pour 20, Max à $20 pour 50, résiliable quand vous voulez ([tarifs](/pricing))." },
    taxFaq(code, NAME[code]),
    { q: "Une alerte me réserve-t-elle le téléphone ?", a: `Non ; seule une commande avec retrait sur apple.com le fait. L’alerte vous amène au paiement le premier, et Apple met l’appareil de côté une fois que vous avez payé ([aide d’Apple sur le retrait](${pickupHelpFr(code).url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (code) => `RestockWire : vérificateur de stock iPhone ${NAME[code]}`,
  offer: "Stock en direct, carte et journal des retours en stock gratuits ; formules d’alerte dès $5 par mois",
  itemList: (code) => `Apple Store ${IN[code]}`,
  restockTimesChip: "Heures de retour en stock",
  storesByRegion: (code) => `Magasins par ${noun(COUNTRIES[code]).one}`,
  browse: (code) => `Stock par lieu ${IN[code]}`,
  selloutH2: (code) => `Combien de temps dure un retour en stock d’iPhone ${IN[code]} ?`,
  selloutLabel: (code) => `dans les Apple Store ${IN[code]}`,
  last24Label: (code) => IN[code],
  newsroom: "Apple Newsroom : l’iPhone Duo arrive dans les Apple Store du monde entier (23 octobre 2026, en anglais)",
};

/** Store <title> and H1: the store as people search it ("Apple Champs-Élysées", "Apple Store Lille"), then the promise. */
export function storeTitleVariants(lead: string, region: string | null): string[] {
  const r = region ? ` (${region})` : "";
  return [
    `${lead}${r} : stock iPhone du jour, retrait et horaires`,
    `${lead}${r} : stock iPhone, retrait et horaires`,
    `${lead}${r} : stock iPhone et horaires`,
    `${lead} : stock iPhone du jour, retrait et horaires`,
    `${lead} : stock iPhone, retrait et horaires`,
    `${lead} : stock iPhone et horaires`,
    `${lead} : stock iPhone`,
    `${lead} – stock`,
  ];
}

function storeTitle(s: Store, region?: string): string {
  const lg = L(s.country);
  // A store named after its city ("Lille", "Brussels") reads as people search it: "Apple Store Lille", "Apple Store Bruxelles".
  const lead = s.name === s.city ? `Apple Store ${cityLabel(s.country, s.city, lg)}` : appleStoreLabel(s, lg);
  const shown = region && !lead.toLowerCase().includes(region.toLowerCase()) && !s.name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  return fitTitleW(storeTitleVariants(lead, shown));
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel: labelOf,
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
  home: homeLabels,
  storeTitle,
  sources: (code) => ({ pickupHelp: pickupHelpFr(code), storeList: storeListFr(code), tax: taxSource(code) }),
};
