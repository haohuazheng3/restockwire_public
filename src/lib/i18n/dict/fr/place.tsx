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
/** Nom français de la taxe incluse dans un prix. */
function taxFr(c: Country): string {
  const t = taxName(c);
  return t === "VAT" ? "TVA" : t === "GST" ? "TPS" : t === "consumption tax" ? "taxe à la consommation" : "taxe";
}
/** Mention fiscale accolée à un prix, selon que le pays l’inclut ou non. */
export function taxNote(code: CountryCode): string {
  const c = COUNTRIES[code];
  if (!c.pricesIncludeTax) return code === "ca" ? "hors taxes (TPS/TVH et part provinciale à ajouter)" : "hors taxe de vente";
  const r = includedRate(c);
  return r == null ? "sans taxe de vente" : `${taxFr(c)} ${rate(code, r)} comprise`;
}
/** Lieu en français avec préposition ; le pays lui-même prend la forme de la table IN. */
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
/** Les parts fédérale et provinciale en toutes lettres : "la TPS de 5 % et la TVQ de 9,975 %". */
function caParts(p: string): string {
  const t = CA_PROVINCE_TAX[p];
  if (t.hst) return `la TVH de ${rate("ca", t.hst)}`;
  if (t.pst) return `la TPS de ${rate("ca", t.gst)} et la ${PST[p] ?? "taxe provinciale"} de ${rate("ca", t.pst)}`;
  return `la TPS de ${rate("ca", t.gst)}, et aucune part provinciale`;
}

/* ------------------------------------------------------------------ sources in French */

/** Apple's online store path for French readers (prices, pickup help). */
const SHOP: Partial<Record<CountryCode, string>> = { fr: "fr", be: "be-fr", ch: "ch-fr", ca: "ca" };
const RETAIL: Partial<Record<CountryCode, string>> = { fr: "fr", be: "befr", ch: "chfr", ca: "ca/fr" };
const EU_FR: Source = { label: "Your Europe, portail de l’UE — barème des taux de TVA par État membre", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_fr.htm" };
const TAX_FR: Partial<Record<CountryCode, Source>> = {
  fr: EU_FR,
  be: EU_FR,
  ch: { label: "AFC, Confédération suisse — taux de TVA en vigueur", url: "https://www.estv.admin.ch/estv/fr/accueil/taxe-sur-la-valeur-ajoutee/taux-tva-suisse.html" },
  ca: { label: "ARC, gouvernement du Canada — taux de TPS/TVH par province et calculatrice", url: "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/tps-tvh-entreprises/facturer-percevoir-quel-taux/calculatrice.html" },
};
function taxSource(code: Exclude<CountryCode, "us">): Source {
  return TAX_FR[code] ?? { label: `${TAX_SOURCES[code].label} (en anglais)`, url: TAX_SOURCES[code].url };
}
function pickupHelpFr(code: CountryCode): Source {
  const p = SHOP[code];
  // Apple's Canadian help page exists in English only (the /ca/fr/shop help answers 404).
  if (p && code !== "ca") return { label: `Apple (${NAME[code]}) — page d’aide sur le retrait : pièces à présenter`, url: `https://www.apple.com/${p}/shop/help/shipping_delivery` };
  const en = pickupHelp(code);
  return { label: `Apple (${NAME[code]}, page en anglais) — page d’aide sur le retrait : pièces à présenter`, url: en.url };
}
function storeListFr(code: CountryCode): Source {
  const p = RETAIL[code];
  if (p) return { label: `Apple (${NAME[code]}) — annuaire officiel des magasins`, url: `https://www.apple.com/${p}/retail/storelist/` };
  return { label: `Apple (${NAME[code]}, page en anglais) — annuaire officiel des magasins`, url: storeListSource(code).url };
}
const shopPath = (code: CountryCode) => SHOP[code] ?? COUNTRIES[code].buyPath ?? COUNTRIES[code].shopPath;

/* ------------------------------------------------------------------ time */

function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${cc.INTL_TRACKING_SINCE}T00:00:00Z`) < 14 * 86400_000 ? "depuis l’ouverture du fil, le 2 novembre" : "en 14 jours";
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
    if (t) return `${cap(dans(provinceFr(region!)))}, l’iPhone Duo 256GB sort à ${money(code, t.total)} environ. Calcul : ${money(code, duo)} chez Apple + ${rate(code, t.rate)} de ${caLabel(region!)}.`;
    return `iPhone Duo 256GB : ${money(code, duo)} hors taxes. Au comptoir, la province du magasin ajoute entre 5 % et 15 %.`;
  }
  const r = includedRate(c);
  if (r == null) return `iPhone Duo 256GB au retrait : ${money(code, duo)}, point final. Pas de taxe de vente ${IN[code]}.`;
  return `iPhone Duo 256GB au retrait ${IN[code]} : ${money(code, duo)} tout compris (${taxFr(c)} ${rate(code, r)}).`;
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
        head: ["Modèle", "apple.com (hors taxes)", `${caLabel(region!)} ${rate(code, t.total)} comprise`],
        rows: rows.map(([label, p]) => [label, money(code, p), money(code, withProvinceTax(p, region!)!.total)]),
        caption: `${cap(dans(R))} : prix réel de chaque iPhone, ${caLabel(region!)} de ${rate(code, t.total)} ajoutée`,
        source: `[${src.label}](${src.url}) · tarifs relevés sur apple.com/ca`,
      };
      return {
        id: "price-with-tax",
        h2: `${m.name} ${dans(placeName)} : quel prix à la caisse, taxes incluses ?`,
        lead: `**${money(code, withProvinceTax(base, region!)!.total)} environ** : l’${m.name} 256GB retiré ${dans(placeName)}. Apple affiche **${money(code, base)} hors taxes** ; s’y ajoute ${caParts(region!)}${placeName !== R ? ` (${R})` : ""}.`,
        blocks: [table, { t: "note", text: "**Le taux suit le magasin, pas vous :** c’est la province du point de retrait qui compte, quelle que soit votre adresse." }],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} au Canada : le prix taxes incluses dans chaque province`,
      lead: `**${m.name} 256GB : ${money(code, withProvinceTax(base, cheapest)!.total)} au mieux ${dans(provinceFr(cheapest))}, ${money(code, withProvinceTax(base, dearest)!.total)} au pire ${dans(provinceFr(dearest))}.** Base Apple : ${money(code, base)} hors taxes. Écart provincial : de ${rate(code, CA_PROVINCE_TAX[cheapest].total)} à ${rate(code, CA_PROVINCE_TAX[dearest].total)}, selon le magasin de retrait.`,
      blocks: [{
        t: "table",
        head: ["Province", "Taxe applicable", "Taux total", `${m.short} 256GB, prix final`],
        rows: provinces.map((p) => [provinceFr(p), caLabel(p), rate(code, CA_PROVINCE_TAX[p].total), money(code, withProvinceTax(base, p)!.total)]),
        caption: "Provinces dotées d’un Apple Store : la taxe prélevée au retrait",
        source: `[${src.label}](${src.url}) · tarifs relevés sur apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxFr(c);
  return {
    id: "price",
    h2: `${m.name} ${IN[code]} : ${money(code, base)}, ${taxNote(code)}`,
    lead: r == null
      ? `**${money(code, base)} au retrait ${where(code, placeName)}**, au centime près le prix d’apple.com pour l’${m.name} 256GB. ${cap(IN[code])}, **aucune taxe de vente**, aucune TVA.`
      : `**${money(code, base)} au retrait ${where(code, placeName)}** pour l’${m.name} 256GB. La **${tn} de ${rate(code, r)} est dedans** (${money(code, beforeTax(c, base))} sans elle) : aucun supplément au comptoir.`,
    blocks: [{
      t: "table",
      head: r == null ? ["Modèle", "Tarif apple.com"] : ["Modèle", "Tarif apple.com", `Sans la ${tn} (${rate(code, r)})`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(code, p)] : [label, money(code, p), money(code, beforeTax(c, p))])),
      caption: `${cap(IN[code])} : ce que vous payez au retrait${r == null ? "" : `, ${tn} comprise`}`,
      source: `[${src.label}](${src.url}) · tarifs relevés sur apple.com/${shopPath(code)}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `${cap(dans(placeName))}, combien coûte l’iPhone Duo une fois taxé ?`, a: `${money(code, t.total)} environ pour le 256GB. Le magasin de retrait ajoute ${rate(code, t.rate)} de ${caLabel(region!)} (${provinceFr(region!)}) aux ${money(code, duo)} affichés par Apple.` }
      : { q: "Au Canada, le prix Apple est-il taxes comprises ?", a: `Non. ${money(code, duo)} pour l’iPhone Duo 256GB, hors taxes. TPS, TVH ou part provinciale s’y ajoutent selon le magasin : 5 % en Alberta, jusqu’à 14,975 % au Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: `${cap(IN[code])}, une taxe s’ajoute-t-elle au prix de l’iPhone ?`, a: `Aucune : ni taxe de vente ni TVA. ${money(code, duo)} pour l’iPhone Duo 256GB, comme sur apple.com.` }
    : { q: `${cap(IN[code])}, faut-il ajouter la ${taxFr(c)} au prix Apple ?`, a: `Non, elle y est déjà : ${rate(code, r)} inclus dans les ${money(code, duo)} de l’iPhone Duo 256GB. Pas de supplément au retrait.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = labelOf(i.cc, placeName(i));
  return fitTitleW([
    ...(k > 1 ? [`${w} : ${N(i.cc, k)} Apple Store, l’iPhone Duo à la minute`] : []),
    `${w} : l’iPhone Duo en Apple Store, à la minute`,
    `${w} : où est l’iPhone en Apple Store ?`,
    `${w} : iPhone en Apple Store`,
  ]);
}

function priceBit(code: CountryCode, region?: string): string {
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? ` Duo : ${money(code, t.total)} environ, taxes ${dans(provinceFr(region!))} comprises.` : ` Duo : ${money(code, duo)} hors taxes.`; }
  return ` Duo : ${money(code, duo)}, ${taxNote(code)}.`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = N(i.cc, i.stores.length);
  const w = dans(labelOf(i.cc, placeName(i)));
  const duo = i.stockNow.duo;
  return fitTitleW([
    `${cap(w)}, retrait à la minute : iPhone Duo dans ${N(i.cc, duo)} Apple Store sur ${k}, 18 Pro Max dans ${N(i.cc, i.stockNow["18-pro-max"])}. Créneaux de remise en stock par magasin.${priceBit(i.cc, i.region)}`,
    `${cap(w)} : iPhone Duo en retrait dans ${N(i.cc, duo)} Apple Store sur ${k}, 18 Pro Max dans ${N(i.cc, i.stockNow["18-pro-max"])}. Suivi magasin par magasin, créneaux de remise en stock inclus.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const lg = L(i.cc);
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (${plural(lg, i.cities, { one: "# ville", other: "# villes" })})` : "";
  return `${cap(dans(placeName(i)))}, retrait ouvert à l’instant : iPhone Duo **${N(i.cc, duo)}**, iPhone 18 Pro Max **${N(i.cc, i.stockNow["18-pro-max"])}**, iPhone 18 Pro **${N(i.cc, i.stockNow["18-pro"])}** — sur **${plural(lg, i.stores.length, { one: "# Apple Store", other: "# Apple Store" })}**${cities}.`;
}

/** Les deux variantes les plus rares d’un modèle dans un lieu, libellées en français. */
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
  if (have.length > 0) return `**${N(i.cc, have.length)}/${N(i.cc, k)} à l’instant.** Retrait de l’iPhone Duo ouvert : ${list(lg, have.map((s) => apple(s)), 4, (r) => `+ ${N(i.cc, r)}`)}.`;
  const none = k === 1 ? "le seul magasin est à sec" : `les ${N(i.cc, k)} magasins sont à sec`;
  if (st.month > 0) return `**0 à l’instant** : ${none} en iPhone Duo. Pourtant, **${plural(lg, st.month, { one: "# remise en stock", other: "# remises en stock" })}** ${sinceWhen()}.`;
  return `**0 à l’instant** : ${none} en iPhone Duo, et le registre ne compte aucune remise en stock ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const lg = L(i.cc);
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Dernière remise en stock du Duo :** ${apple(last)}, ${whenIn(i.cc, st.lastRestock.at)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Bilan ${sinceWhen()} :** ${plural(lg, st.month, { one: "# remise en stock confirmée", other: "# remises en stock confirmées" })} pour le Duo ${dans(w)}`);
  if (st.medianMs != null) items.push(`**Tenue du stock :** ${fmtDuration(st.medianMs, lg)} en médiane, puis rupture`);
  const targets = k === 1 ? "le magasin" : k <= 3 ? `les ${k === 2 ? "deux" : "trois"} magasins` : `vos ${Math.min(k, 5)} magasins de proximité`;
  items.push(`**Pour être le premier :** [une alerte iPhone Duo ${dans(w)}](${alert}) sur ${targets} que vous pouvez rejoindre. Sous alerte, un magasin passe sur le fil des 5 secondes`);
  items.push("**Mécanique :** 1 alerte = 1 magasin × 1 variante précise. Second contrôle concordant, puis notification environ 3 secondes plus tard");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Tout peut basculer en une minute.** L’alerte capte la prochaine remise en stock avant que vous n’ayez rechargé apple.com." });
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
  const of = (x: number) => `${N(i.cc, x)}/${N(i.cc, k)} magasin${k > 1 ? "s" : ""}`;
  const pmNow = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: `${cap(dans(w))}, l’iPhone Duo est-il disponible en retrait ?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `iPhone 18 Pro Max ${dans(w)} : quel stock à l’instant ?`,
      lead: pmNow > 0
        ? `**${of(pmNow)} à l’instant.** Taux de présence ${dans(w)} : **${cc.pairsPct(i, "18-pro-max")} %** des ${N(i.cc, k * pm)} paires magasin × variante.`
        : `**0 à l’instant.** ${k === 1 ? "Le magasin n’a" : `Les ${N(i.cc, k)} magasins ${dans(w)} n’ont`} aucun iPhone 18 Pro Max en retrait.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Les plus rares à l’instant :** ${list(lg, scarce.map((x) => `${x.label} (${N(i.cc, x.stores)}/${N(i.cc, k)})`))}`] : []),
        `**iPhone 18 Pro, en comparaison :** ${N(i.cc, i.stockNow["18-pro"])}/${N(i.cc, k)} magasins, ${cc.pairsPct(i, "18-pro")} % des paires en ligne`,
        `**Registre 18 Pro Max ${sinceWhen()} :** ${i.max.month ? plural(lg, i.max.month, { one: "# remise en stock", other: "# remises en stock" }) : "vide à ce jour"}`,
        ...(i.max.medianMs != null ? [`**Tenue du stock :** ${fmtDuration(i.max.medianMs, lg)} en médiane pour un Pro Max, puis rupture`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  return fitTitleW([
    ...(k > 1 ? [`${NAME[code]} : les ${N(code, k)} Apple Store, iPhone Duo à la minute`] : []),
    `${NAME[code]} : l’Apple Store et l’iPhone Duo à la minute`,
    `${NAME[code]} : Apple Store et stock iPhone`,
  ], 70);
}

function homeTitle(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  if (k === 1) {
    const city = cityLabel(code, stores[0].city, L(code));
    return fitTitleW([`${NAME[code]} : l’iPhone en retrait à ${city}, minute par minute`, `${NAME[code]} : l’iPhone en retrait à ${city}`, `iPhone ${IN[code]} : ${apple(stores[0])}`]);
  }
  return fitTitleW([
    `${NAME[code]} : l’iPhone en retrait, ${N(code, k)} Apple Store au fil`,
    `${NAME[code]} : l’iPhone en retrait, minute par minute`,
    `iPhone en retrait ${IN[code]}`,
  ]);
}

function homeH1(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  if (k === 1) {
    const city = cityLabel(code, stores[0].city, L(code));
    return `L’iPhone en retrait à l’Apple Store ${/^[aeiouyhâéèêîôû]/i.test(city) ? `d’${city}` : `de ${city}`}, minute par minute`;
  }
  return `L’iPhone en retrait ${IN[code]} : ${N(code, k)} Apple Store, minute par minute`;
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `le seul Apple Store ${IN[code]}` : `${N(code, k)} Apple Store ${IN[code]}`;
}

function spreadPhrase(code: CountryCode): string {
  const c = COUNTRIES[code];
  const lg = L(code);
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const k = storesOf(code).length;
  const villes = plural(lg, cities.length, { one: "# ville", other: "# villes" });
  if (k === 1) return `à ${cityLabel(code, cities[0].name, lg)}`;
  if (cities.length === 1) return `concentrés à ${cityLabel(code, cities[0].name, lg)}`;
  if (!c.regionNoun || regions.length === 1) return `dans ${villes}`;
  const nn = noun(c);
  return `sur ${N(code, regions.length)} ${regions.length === 1 ? nn.one : nn.other} et ${villes}`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const all = k === 1 ? "l’Apple Store" : k === 2 ? "les deux Apple Store" : `les ${N(code, k)} Apple Store`;
  return {
    title: fitTitleW([`${m.name} ${IN[code]} : où le retirer ? ${cap(all)}, à la minute`, `${m.name} ${IN[code]} : où le retirer à l’instant ?`, `${m.name} en retrait ${IN[code]}`], 70),
    h2: [`${cap(IN[code])}, quel Apple Store a l’${m.name} à l’instant ?`, priceSection(code, NAME[code], undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const p = code === "ca" ? `**${money(code, r.low)}** hors taxes` : `**${money(code, r.low)}**, ${taxNote(code)}`;
  const now = inStock === 0
    ? `${m.name} ${IN[code]} : retrait fermé partout à l’instant (**0/${N(code, k)}** Apple Store)`
    : `${m.name} ${IN[code]} : retrait ouvert dans **${N(code, inStock)}/${N(code, k)}** Apple Store à l’instant`;
  return `${now}. Prix d’entrée : ${p}. Chaque magasin repasse sur le fil **toutes les 15 secondes**.`;
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const of = `${N(code, inStock)}/${N(code, k)}`;
  return fitTitleW([
    `${m.name} ${IN[code]}, à la minute : retrait ouvert dans ${of} Apple Store. Détail par magasin et par variante, prix dès ${money(code, r.low)}${code === "ca" ? " hors taxes" : ""}, créneaux du stock.`,
    `${m.name} ${IN[code]} : retrait ouvert dans ${of} Apple Store à l’instant. Détail par magasin et par variante, créneaux de remise en stock, alertes.`,
  ], 155);
}

function modelRows(code: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = code === "us" ? "" : `/${code}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, N(code, catalogFor(m.key, code).length), N(code, storesNow[m.key] ?? 0), N(code, restocks[m.key] ?? 0)]);
}

function homeDescription(code: CountryCode): string {
  const k = storesOf(code).length;
  return `${cap(allStoresPhrase(code))} sur le fil des 15 secondes : retrait des iPhone Duo, 18 Pro et 18 Pro Max. ${k === 1 ? "Prix" : "Créneaux du stock et prix"} en ${COUNTRIES[code].currency}. Alerte dès le retour du stock dans votre magasin.`;
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  return `Retrait ouvert à l’instant ${IN[code]}, sur ${N(code, k)} Apple Store : iPhone Duo **{{duo.storesNow}}**, iPhone 18 Pro Max **{{pm.storesNow}}**, iPhone 18 Pro **{{pro.storesNow}}**. Dernière remise en stock confirmée du Duo : **{{duo.lastRestock}}**.`;
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
      h2: `${cap(IN[code])}, quels iPhone peut-on retirer à l’instant ?`,
      lead: `Réponse dans le tableau, mis à jour toutes les 15 secondes : ce qu’apple.com déclare disponible en retrait, variante par variante, pour ${allStoresPhrase(code)}${k > 1 ? `. Le détail suit par magasin, par ${c.regionNoun ? noun(c).one : "ville"} et par variante` : ""}.`,
      blocks: [
        { t: "table", head: ["Modèle", "Variantes", "Magasins avec stock", "Remises en stock confirmées"], rows: modelRows(code, i.storesNow, i.restocks), caption: `${cap(IN[code])}, arrêté au {{asOf}}` },
        { t: "ul", items: [
          `**Couverture :** ${spreadPhrase(code)}. Prix et références d’Apple ${IN[code]}. Magasins sous alerte : fil des 5 secondes`,
          "**Double contrôle :** rien n’est publié sans un second relevé concordant. Une réponse aberrante d’apple.com ne produit ni remise en stock ni rupture",
          "**Premier relevé ≠ remise en stock :** une variante vue pour la première fois sert seulement de point zéro",
          `**Registre :** tout changement confirmé rejoint le [fil des remises en stock](${i.restocksPath}), source des graphiques de ${i.index?.indexable ? `[chaque fiche magasin](${i.index.path})` : "la fiche du magasin"}`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, NAME[code]),
    {
      id: "alerts",
      h2: `Alertes ${IN[code]} : du stock à votre écran, comment ?`,
      lead: `Environ 3 secondes entre la confirmation du stock et la notification sur votre téléphone. Vous fixez le téléphone exact et ${k === 1 ? "le magasin" : "les magasins"} ; le reste est automatique.`,
      blocks: [
        { t: "ol", items: [
          k === 1 ? `**M’alerter** : modèle, capacité, couleur. Magasin d’office : ${apple(stores[0])}, ${cityLabel(code, stores[0].city, lg)}.` : "**M’alerter** : modèle, capacité, couleur. Ensuite, cochez les magasins que vous pouvez rejoindre ; tri par distance routière en kilomètres, temps de trajet affiché.",
          "iPhone : RestockWire sur l’écran d’accueil, notifications autorisées. Sans app installée, iOS bloque les notifications web ([pas-à-pas](/phone-alerts)).",
          "Notification reçue : touchez-la, apple.com s’ouvre, payez en choisissant le retrait dans ce magasin.",
        ] },
        { t: "table", head: ["Formule", "USD / mois", "Alertes"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "1 alerte = 1 magasin × 1 variante précise. Consultation gratuite ; même vitesse pour toutes les formules ([tarifs](/pricing))" },
        { t: "note", text: "**Notre conseil :** pour le Duo, une alerte sur chaque magasin à portée. Pour les 18 Pro et Pro Max, vérifiez d’abord le stock à l’instant : il suffit parfois." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const p = code === "us" ? "" : `/${code}`;
  const count = plural(L(code), rt.n, { one: "# remise en stock confirmée", other: "# remises en stock confirmées" });
  const where = rt.storesTotal === 1 ? "" : ` (${N(code, rt.stores)}/${N(code, rt.storesTotal)} magasins)`;
  const when = rt.n === 0
    ? `Registre vide depuis l’ouverture du fil, le 2 novembre. La page [heures de remise en stock de l’iPhone Duo ${IN[code]}](${rt.path}) se remplira heure par heure.`
    : rt.peakHour != null
      ? `${cap(count)}${where} depuis le 2 novembre, avec un créneau dominant : **${hour(L(code), rt.peakHour, true)} (heure du magasin)**. [Ventilation complète](${rt.path}).`
      : `Pas encore de créneau fiable : ${count}${where} depuis le 2 novembre, sur trop peu de jours. [Ventilation complète](${rt.path}).`;
  return [
    { q: `${cap(IN[code])}, combien d’Apple Store ont l’iPhone Duo à l’instant ?`, a: `{{duo.storesNow}}/${N(code, k)} au dernier contrôle ({{asOf}}). Noms des magasins et variantes : [iPhone Duo ${IN[code]}](${p}/in-stock/iphone-duo), relu toutes les 15 secondes.` },
    { q: `${cap(IN[code])}, à quelle heure l’iPhone Duo revient-il en stock ?`, a: when },
    { q: `RestockWire repère un retour en stock ${IN[code]} en combien de temps ?`, a: `Fil des 5 secondes pour les magasins sous alerte, des 15 secondes pour ${k === 1 ? `l’Apple Store ${IN[code]}` : `l’ensemble des Apple Store ${IN[code]}`}. Tout « disponible » est recontrôlé dans la seconde, puis la notification part : environ 3 secondes jusqu’à votre téléphone.` },
    { q: "Consulter le stock, c’est payant ?", a: "Non. Stock à la minute, carte et fil des remises en stock sont libres d’accès. Seules les alertes sont payantes, en dollars américains : Plus $5/mois (10), Pro $10 (20), Max $20 (50), sans engagement ([tarifs](/pricing))." },
    taxFaq(code, NAME[code]),
    { q: "L’alerte bloque-t-elle un téléphone à mon nom ?", a: `Non. Seul l’achat avec retrait sur apple.com bloque l’appareil. L’alerte sert à arriver au paiement avant les autres ([conditions de retrait Apple](${pickupHelpFr(code).url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (code) => `RestockWire — iPhone en retrait, ${NAME[code]}`,
  offer: "Consultation libre (stock, carte, fil des remises en stock) ; alertes à partir de $5 par mois",
  itemList: (code) => `Apple Store ${IN[code]}`,
  restockTimesChip: "Créneaux du stock",
  storesByRegion: (code) => `Les magasins, ${noun(COUNTRIES[code]).one} par ${noun(COUNTRIES[code]).one}`,
  browse: (code) => `${cap(IN[code])}, lieu par lieu`,
  selloutH2: (code) => `${cap(IN[code])}, le stock d’iPhone tient combien de temps ?`,
  selloutLabel: (code) => `dans tout le réseau Apple ${IN[code]}`,
  last24Label: (code) => IN[code],
  newsroom: "Apple Newsroom, 23 octobre 2026 (en anglais) — arrivée de l’iPhone Duo dans les Apple Store",
};

/** <title> et H1 d’un magasin : son nom tel qu’on le cherche, puis ce que la page apporte. */
export function storeTitleVariants(lead: string, region: string | null): string[] {
  const r = region ? ` (${region})` : "";
  return [
    `${lead}${r} : iPhone en retrait à la minute, horaires`,
    `${lead}${r} : iPhone en retrait, horaires`,
    `${lead}${r} : iPhone en retrait`,
    `${lead} : iPhone en retrait à la minute, horaires`,
    `${lead} : iPhone en retrait, horaires`,
    `${lead} : iPhone en retrait`,
    `${lead} : iPhone`,
    `${lead}`,
  ];
}

function storeTitle(s: Store, region?: string): string {
  const lg = L(s.country);
  // Magasin baptisé du nom de sa ville ("Lille", "Brussels") : on écrit "Apple Store Lille", comme on le cherche.
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
