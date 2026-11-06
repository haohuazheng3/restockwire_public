/**
 * Spanish (Spain): place — the copy builders of the country pages (/es-es/…): titles, Answer-First intros,
 * keyword sections, price/IVA sections and FAQs, built from Spain's live numbers. Same functions, arguments and
 * return shapes as English (lib/seo/countryCopy.ts). Titles open with the queries Spain actually types: the store
 * or city name after Apple Store, the model name, and the model plus precio.
 */
import type { Dict } from "../en";
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { INTL_TRACKING_SINCE, priceOf, priceRange, scarcest, pairsPct, duoStoresNow, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import { fitTitleW, list, stamp } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, regionLabel } from "@/lib/i18n/places";
import type { Block, Faq } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { content } from "./content";
import { L, n, pc, money, pais, enPais, dePais, noun, cap, impuesto, taxNote, lasH, apples, tiendas, reposiciones, ciudades, v, tc, aprox } from "./words";

/** While the 14-day window still reaches the first tracked day, say so instead of claiming 30 days. */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 14 * 86400_000 ? "desde el inicio del seguimiento (2 de noviembre)" : "en los 14 días más recientes";
}

/** "2 nov, 15:04 CET" in the country's zone. */
const whenIn = (cc: CountryCode, iso: string | Date): string => stamp(L, iso, COUNTRIES[cc].timeZone, true);

/** The region or city of a place input, in Spanish ("Madrid", "Málaga"). */
const nameOf = (i: IntlPlaceInput): string => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));
const apple = (s: Store): string => appleStoreLabel(s, L);
/** "2 tiendas" → "las dos tiendas"; one store: "la tienda". */
const theStores = (x: number): string => (x === 1 ? "la tienda" : x === 2 ? "las dos tiendas" : x === 3 ? "las tres tiendas" : `las ${n(x)} tiendas`);
/** After a colon: "ninguna de las 5 tiendas tiene" / "ninguna de las dos tiendas tiene" / "la única tienda no tiene". */
const noneOf = (x: number): string => (x === 1 ? "la única tienda no tiene" : `ninguna de ${theStores(x)} tiene`);

/* ------------------------------------------------------------------ impuestos (IVA, GST/HST) */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Un iPhone Duo 256GB sale por unos ${money(c, t.total)} en ${region}: los ${money(c, duo)} de Apple más el ${pc(t.rate)} de ${CA_PROVINCE_TAX[region!].label}.`;
    return `${cap(money(c, duo))} sin impuestos: ese es el precio base del iPhone Duo 256GB. En el mostrador, la provincia de la tienda añade entre un 5 % y un 15 %.`;
  }
  const r = includedRate(c);
  if (r == null) return `${cap(money(c, duo))} es todo lo que pagas por un iPhone Duo 256GB al recogerlo: Hong Kong no cobra impuesto sobre las ventas.`;
  return `${cap(money(c, duo))} es todo lo que pagas por un iPhone Duo 256GB al recogerlo ${enPais(cc)}, con el ${pc(r)} de ${impuesto(c)} incluido.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** Your Europe in Spanish for the EU countries; every other country keeps its tax authority's page. */
const EU_ES = { label: "Your Europe (UE): el IVA de cada Estado miembro", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_es.htm" };
const taxSource = (cc: Exclude<CountryCode, "us">) => (TAX_SOURCES[cc].url.includes("europa.eu") ? EU_ES : TAX_SOURCES[cc]);

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = taxSource(cc as Exclude<CountryCode, "us">);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      return {
        id: "price-with-tax",
        h2: `¿Cuánto cuesta el ${m.name} en ${placeName} con impuestos?`,
        lead: `**Unos ${money(c, withProvinceTax(base, region!)!.total)}** por el ${m.name} 256GB en una tienda de ${placeName}: los **${money(c, base)} sin impuestos** de Apple más ${t.hst ? `el ${pc(t.hst)} de HST` : t.pst ? `${pc(t.gst)} de GST más ${pc(t.pst)} de ${t.label.split(" + ")[1]}` : `solo el ${pc(t.gst)} federal de GST`} de ${region}.`,
        blocks: [
          { t: "table", head: ["iPhone", "Precio en apple.com", `Con ${pc(t.total)} de ${t.label}`], rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]), caption: `Lo que cuesta cada iPhone en ${region} con ${t.label} (${pc(t.total)})`, source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}) · precios: apple.com/ca` },
          { t: "note", text: "**El tipo lo marca la tienda de recogida:** decide su provincia, no tu dirección." },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `¿Cuánto cuesta el ${m.name} en Canadá con impuestos, por provincia?`,
      lead: `**Desde ${money(c, withProvinceTax(base, cheapest)!.total)} en ${cheapest} hasta ${money(c, withProvinceTax(base, dearest)!.total)} en ${dearest}** por un ${m.name} 256GB: los ${money(c, base)} de Apple no incluyen impuestos, y la provincia de la tienda de recogida suma entre un ${pc(CA_PROVINCE_TAX[cheapest].total)} y un ${pc(CA_PROVINCE_TAX[dearest].total)}.`,
      blocks: [{
        t: "table",
        head: ["Provincia", "Impuesto", "Tipo", `${m.short} 256GB con impuestos`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pc(CA_PROVINCE_TAX[p].total), money(c, withProvinceTax(base, p)!.total)]),
        caption: "Impuestos sobre una recogida en tienda, en cada provincia con Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}) · precios: apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = impuesto(c);
  return {
    id: "price",
    h2: `¿Cuánto cuesta el ${m.name} ${enPais(cc)}? ${money(c, base)}, ${taxNote(c)}`,
    lead: r == null
      ? `**${money(c, base)}, exactamente el precio de apple.com**, por el ${m.name} 256GB al recogerlo en ${placeName}: Hong Kong **no cobra impuesto sobre las ventas** ni IVA.`
      : `**${money(c, base)}** por el ${m.name} 256GB al recogerlo en ${placeName}, con el **${pc(r)} de ${tn} ya incluido** (${money(c, beforeTax(c, base))} sin ${tn}); en el mostrador no se suma nada.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Precio en apple.com"] : ["iPhone", "Precio en apple.com", `Sin el ${pc(r)} de ${tn}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `Precios de Apple ${enPais(cc)}, tal como se pagan al recoger${r == null ? "" : ` (${tn} incluido)`}`,
      source: `[${src.label}](${src.url}) · precios: apple.com/${c.buyPath ?? c.shopPath}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `¿Cuál es el precio del iPhone Duo en ${placeName} con impuestos?`, a: `Unos ${money(c, t.total)} el de 256GB: el ${pc(t.rate)} de ${CA_PROVINCE_TAX[region!].label} de ${region} sobre los ${money(c, duo)} de Apple, que cobra la tienda de recogida.` }
      : { q: "¿Los precios de Apple en Canadá incluyen impuestos?", a: `No: el iPhone Duo 256GB cuesta ${money(c, duo)} sin impuestos. La provincia de la tienda de recogida suma GST, HST o el impuesto provincial, del 5 % en Alberta al 14,975 % en Quebec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "¿Se paga impuesto sobre las ventas por un iPhone en Hong Kong?", a: `No: Hong Kong no tiene impuesto sobre las ventas ni IVA. El iPhone Duo 256GB cuesta ${money(c, duo)} al recogerlo, exactamente lo que marca apple.com.` }
    : { q: `¿Los precios de Apple ${enPais(cc)} ya incluyen el ${impuesto(c)}?`, a: `Sí: los ${money(c, duo)} de un iPhone Duo 256GB incluyen el ${pc(r)} de ${impuesto(c)}. En el mostrador de recogida no se añade nada más.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = nameOf(i);
  const all = k === 1 ? "" : ` en ${theStores(k)}`;
  if (i.kind === "state" && i.regionSlug) {
    // "Madrid y provincia": how Spain names a city with the province around it (the city page is "Apple Store Madrid").
    const nn = noun(COUNTRIES[i.cc]);
    return fitTitleW([
      `Apple Store ${w} y ${nn.one}: recogida del iPhone Duo${all}, en directo`,
      `Apple Store ${w} y ${nn.one}: recogida del iPhone Duo en directo`,
      `Apple Store ${w} y ${nn.one}: stock de iPhone ahora`,
      `Apple Store ${w}: stock de iPhone`,
    ]);
  }
  return fitTitleW([
    `Apple Store ${w}: recogida del iPhone Duo${all}, en directo`,
    `Apple Store ${w}: recogida del iPhone Duo en directo`,
    `Apple Store ${w}: stock de iPhone ahora`,
    `Apple Store ${w}: stock de iPhone`,
  ]);
}

/** The description's price clause. */
function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `; Duo: unos ${money(c, t.total)} ya con impuestos (${region})` : `; Duo: ${money(c, duo)} antes de impuestos`; }
  return `; Duo: ${money(c, duo)}, ${taxNote(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = nameOf(i);
  const duo = i.stockNow.duo, pm = i.stockNow["18-pro-max"];
  return fitTitleW([
    `${n(duo)} de ${apples(k)} en ${w} ${v(duo, "tiene", "tienen")} ahora el iPhone Duo para recogida, ${n(pm)} el 18 Pro Max. Tienda por tienda, con horas de reposición${priceBit(i.cc, i.region)}.`,
    `${n(duo)} de ${apples(k)} en ${w} ${v(duo, "tiene", "tienen")} ahora el iPhone Duo, ${n(pm)} el 18 Pro Max. En directo por tienda, con horas de reposición.`,
  ], 155);
}

/** One sentence, live state first. */
function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = nameOf(i);
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (${ciudades(i.cities)} en total)` : "";
  const duo = i.stockNow.duo;
  return `**${n(duo)}** de los **${apples(k)}** de ${w}${cities} ${v(duo, "tiene", "tienen")} en este momento un iPhone Duo disponible para recogida; el iPhone 18 Pro Max está en **${n(i.stockNow["18-pro-max"])}** y el iPhone 18 Pro, en **${n(i.stockNow["18-pro"])}**.`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**Sí, en ${n(have.length)} de ${tiendas(k)}**: ${list(L, have.map(apple), 4, (x) => `${n(x)} más`)} ${v(have.length, "tiene", "tienen")} un iPhone Duo para recogida en este momento.`;
  if (st.month > 0) return `**Ahora mismo, no**: ${noneOf(k)} un iPhone Duo, aunque ${k === 1 ? "lo ha repuesto" : "entre todas lo han repuesto"} **${st.month === 1 ? "una vez" : `${n(st.month)} veces`}** ${sinceWhen()}.`;
  return `**Ahora mismo, no**: ${noneOf(k)} un iPhone Duo, y no hay ninguna reposición confirmada del Duo ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Última reposición del Duo aquí:** ${whenIn(i.cc, st.lastRestock.at)} en ${apple(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Confirmadas ${sinceWhen()}:** ${reposiciones(st.month)} del Duo en las tiendas de ${w}`);
  if (st.medianMs != null) items.push(`**Lo que dura el stock:** ${aprox(fmtDuration(st.medianMs, L))} de mediana antes de que el Duo vuelva a agotarse`);
  const which = k === 1 ? "en la tienda" : k <= 3 ? `en ${theStores(k)}` : `en las ${n(Math.min(k, 5))} tiendas más cercanas`;
  items.push(`**La vía más rápida para conseguir uno:** [vigila el iPhone Duo en ${w}](${alert}) ${which} a las que de verdad irías; las tiendas con alertas se comprueban cada 5 segundos`);
  items.push("**Una regla de alerta** es una tienda × una configuración exacta, y el aviso llega unos 3 segundos después de que una segunda comprobación confirme la reposición");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Esto cambia en un minuto:** una alerta ve la próxima reposición mucho antes que cualquier recarga de apple.com." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = nameOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pmConfigs = catalogFor("18-pro-max", i.cc).length;
  const pm = i.stockNow["18-pro-max"];
  return [
    { id: "iphone-duo", h2: `¿En qué Apple Store de ${w} hay iPhone Duo ahora mismo?`, lead: duoLead(i), blocks: duoPoints(i, w, alert) },
    {
      id: "iphone-18-pro-max",
      h2: `¿Hay stock del iPhone 18 Pro Max en ${w}?`,
      lead: pm > 0
        ? `**Sí, en ${n(pm)} de ${tiendas(k)}**, con el **${pc(pairsPct(i, "18-pro-max"))}** de las ${n(k * pmConfigs)} combinaciones tienda × configuración de ${w} disponibles en este momento.`
        : `**Ahora mismo, no**: ${noneOf(k)} un iPhone 18 Pro Max para recogida.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Lo más difícil de encontrar ahora:** ${list(L, scarce.map((x) => `${tc(x.label)} (${n(x.stores)} de ${tiendas(k)})`))}`] : []),
        `**iPhone 18 Pro:** ${n(i.stockNow["18-pro"])} de ${tiendas(k)}, con el ${pc(pairsPct(i, "18-pro"))} de sus combinaciones disponibles`,
        `**Confirmadas ${sinceWhen()}:** ${i.max.month ? `${reposiciones(i.max.month)} del 18 Pro Max` : "cero, de momento, para el 18 Pro Max"}`,
        ...(i.max.medianMs != null ? [`**Lo que dura el stock:** ${aprox(fmtDuration(i.max.medianMs, L))} de mediana antes de que un Pro Max vuelva a agotarse`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const p = pais(cc);
  const all = k === 1 ? "" : k === 2 ? " en las dos tiendas" : ` en las ${n(k)} tiendas`;
  return fitTitleW([
    `Apple Store ${p}: recogida del iPhone Duo${all}, en directo`,
    `Apple Store ${p}: recogida del iPhone Duo en directo`,
    `Apple Store ${p}: stock de iPhone en directo`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return fitTitleW([
    ...(k > 1 ? [`Stock de iPhone ${enPais(cc)}: recogida en directo en los ${apples(k)}`] : []),
    `Stock de iPhone ${enPais(cc)}: recogida en directo en ${k === 1 ? "su Apple Store" : "cada Apple Store"}`,
    `Stock de iPhone ${enPais(cc)}: recogida en directo`,
  ], 70);
}

function homeH1(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `Stock de iPhone para recogida, en directo, en el Apple Store ${dePais(cc)}` : `Stock de iPhone para recogida, en directo, en los ${apples(k)} ${dePais(cc)}`;
}

function allStoresPhrase(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `el Apple Store ${dePais(cc)} (no hay otro)` : `los ${apples(k)} ${dePais(cc)}`;
}

/** Where the stores are: a city count, plus the region count when the country has regions. */
function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const k = storesOf(cc).length;
  if (k === 1) return `en ${cityLabel(cc, cities[0].name, L)}`;
  if (cities.length === 1) return `todos en ${cityLabel(cc, cities[0].name, L)}`;
  if (!c.regionNoun || regions.length === 1) return `en ${ciudades(cities.length)}`;
  const nn = noun(c);
  return `en ${ciudades(cities.length)} de ${n(regions.length)} ${regions.length === 1 ? nn.one : nn.other}`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const all = k === 1 ? "El Apple Store" : k === 2 ? "Los dos Apple Store" : `Los ${apples(k)}`;
  return {
    title: fitTitleW([`¿Hay stock del ${m.name} ${enPais(cc)}? ${all}, en directo`, `¿Hay stock del ${m.name} ${enPais(cc)}? En directo`, `Stock del ${m.name} ${enPais(cc)}`], 70),
    h2: [`¿Qué Apple Store ${dePais(cc)} tienen ahora el ${m.name}?`, priceSection(cc, pais(cc), undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  const from = cc === "ca" ? `**${money(c, r.low)}** sin impuestos` : `**${money(c, r.low)}**, ${taxNote(c)}`;
  const head = inStock === 0
    ? (k === 1 ? `En este momento el Apple Store ${dePais(cc)} **no tiene** el ${m.name} para recogida` : `En este momento **ninguno** de los ${apples(k)} ${dePais(cc)} tiene el ${m.name} para recogida`)
    : `En este momento **${n(inStock)} de ${n(k)}** Apple Store ${dePais(cc)} ${v(inStock, "tiene", "tienen")} el ${m.name} para recogida`;
  return `${head} (cada tienda se comprueba **cada 15 segundos**); precios desde ${from}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fitTitleW([
    `${n(inStock)} de ${apples(k)} ${dePais(cc)} ${v(inStock, "tiene", "tienen")} el ${m.name} para recogida en este momento. Tienda por tienda y configuración por configuración, desde ${money(c, r.low)}${cc === "ca" ? " sin impuestos" : ""}, con horas de reposición.`,
    `${n(inStock)} de ${apples(k)} ${dePais(cc)} ${v(inStock, "tiene", "tienen")} ahora el ${m.name}. Stock para recogida en directo por tienda y configuración, horas de reposición y alertas.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, n(catalogFor(m.key, cc).length), n(storesNow[m.key] ?? 0), n(restocks[m.key] ?? 0)]);
}

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  const cur = c.currency === "EUR" ? "euros" : c.currency;
  return fitTitleW([
    `Stock para recogida del iPhone Duo, 18 Pro y 18 Pro Max en ${allStoresPhrase(cc)}, comprobado cada 15 segundos. ${k === 1 ? "Precios" : "Horas de reposición y precios"} en ${cur}, y un aviso en cuanto tu tienda repone.`,
    `iPhone Duo, 18 Pro y 18 Pro Max: recogida en ${allStoresPhrase(cc)}, revisada cada 15 segundos. Horas de reposición, precios en ${cur} y avisos.`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return `Última reposición confirmada del iPhone Duo ${enPais(cc)}: **{{duo.lastRestock}}**. En este momento **{{duo.storesNow}} de ${n(k)}** Apple Store tienen un Duo para recogida, **{{pm.storesNow}}** un iPhone 18 Pro Max y **{{pro.storesNow}}** un iPhone 18 Pro.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  const stores = storesOf(cc);
  return [
    {
      id: "iphone-stock",
      h2: `¿Qué iPhone hay en stock ${enPais(cc)} ahora mismo?`,
      lead: `La tabla lo responde en directo: la disponibilidad de recogida en tienda de la propia apple.com para cada configuración en ${allStoresPhrase(cc)}, comprobada cada 15 segundos${k > 1 ? ` y desglosada por tienda, por ${c.regionNoun ? noun(c).one : "ciudad"} y por configuración` : ""}.`,
      blocks: [
        { t: "table", head: ["Modelo", "Configuraciones", "Tiendas con stock ahora", "Reposiciones confirmadas"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `La comprobación ${enPais(cc)}, a {{asOf}}` },
        { t: "ul", items: [
          "**Confirmado quiere decir dos veces:** un cambio solo se publica cuando una segunda comprobación coincide, así que una respuesta errónea de apple.com nunca aparece como una reposición o un agotamiento",
          "**La primera vez que se ve algo no es una reposición:** una configuración vista por primera vez solo marca el punto de partida",
          `**El registro es la fuente:** cada cambio confirmado va al [registro de reposiciones](${i.restocksPath}), que dibuja los gráficos de reposición de ${i.index?.indexable ? `[las páginas de cada tienda](${i.index.path})` : "la página de la tienda"}`,
          `**Cobertura:** ${spreadPhrase(cc)}, con los precios y las referencias de la propia Apple (apple.com/${c.buyPath ?? c.shopPath}); las tiendas con alertas se comprueban cada 5 segundos`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, pais(cc)),
    {
      id: "alerts",
      h2: `¿Cómo funcionan las alertas de reposición ${enPais(cc)}?`,
      lead: `Tú eliges ${k === 1 ? "la tienda" : "las tiendas"} y el iPhone exacto; cuando ${k === 1 ? "la tienda" : "una de ellas"} lo pone disponible para recogida, te llega un aviso al móvil unos 3 segundos después de confirmarse la reposición.`,
      blocks: [
        { t: "ol", items: [
          k === 1 ? `Elige el iPhone, la capacidad y el color en **Recibe alertas**; la tienda es ${apple(stores[0])}, en ${cityLabel(cc, stores[0].city, L)}.` : "Elige el iPhone, la capacidad y el color en **Recibe alertas** y marca las tiendas a las que puedes llegar; las más cercanas salen primero, con los kilómetros por carretera y el tiempo en coche.",
          "En un iPhone, añade RestockWire a tu pantalla de inicio y permite las notificaciones: iOS solo entrega notificaciones web a una app instalada ([cómo instalarla](/phone-alerts)).",
          "Al llegar el aviso, tócalo: te deja en apple.com, eliges «Recogida» en esa tienda y pagas.",
        ] },
        { t: "table", head: ["Plan", "Al mes (USD)", "Reglas de alerta"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Una regla = una tienda × una configuración exacta; consultar sigue siendo gratis y la velocidad es la misma en todos los planes ([precios](/pricing))" },
        { t: "note", text: "**Nuestra opinión:** el Duo merece alertas en todas las tiendas a las que puedas llegar; para el 18 Pro y el Pro Max, mira antes las cifras en directo." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const when = rt.n === 0
    ? `Cero confirmadas desde el inicio del seguimiento (2 de noviembre). [Reposiciones del iPhone Duo hora a hora ${enPais(cc)}](${rt.path}) las irá sumando por hora local y por día.`
    : rt.peakHour != null
      ? `La mayoría llega hacia **${lasH(rt.peakHour)}, hora local**: ${reposiciones(rt.n)} confirmadas en ${n(rt.stores)} de ${tiendas(rt.storesTotal)} desde el 2 de noviembre. [Hora a hora y día a día](${rt.path}).`
      : `${cap(reposiciones(rt.n))} confirmadas en ${n(rt.stores)} de ${tiendas(rt.storesTotal)} desde el 2 de noviembre, en muy pocos días todavía para señalar una hora habitual. [Hora a hora y día a día](${rt.path}).`;
  return [
    { q: `¿En cuántas tiendas Apple ${dePais(cc)} hay hoy un iPhone Duo?`, a: `{{duo.storesNow}} de ${n(k)}, según la revisión más reciente ({{asOf}}). [iPhone Duo ${enPais(cc)}, tienda a tienda](${p}/in-stock/iphone-duo) se renueva cada 15 segundos.` },
    { q: `¿A qué hora vuelve el iPhone Duo a las tiendas ${dePais(cc)}?`, a: when },
    { q: `¿Con qué rapidez ve RestockWire una reposición ${enPais(cc)}?`, a: `Las tiendas con alertas se comprueban cada 5 segundos, y todos los Apple Store ${dePais(cc)}, cada 15; un primer «disponible» se vuelve a comprobar en menos de un segundo. La reposición confirmada llega a tu móvil unos 3 segundos después.` },
    { q: "¿Necesito un plan para consultar el stock?", a: "No: el stock en directo, el mapa y el registro de reposiciones son gratis. Un plan añade reglas de alerta, con cobro en dólares estadounidenses: Plus, $5 al mes por 10; Pro, $10 por 20, y Max, $20 por 50. Cancelas cuando quieras ([precios](/pricing))." },
    taxFaq(cc, pais(cc)),
    { q: "¿Una alerta me reserva el móvil?", a: `No; eso solo lo hace un pedido en apple.com con recogida en tienda. La alerta te lleva el primero al pago, y Apple te guarda la unidad en cuanto has pagado ([ayuda de Apple sobre la recogida](${pickupHelp(cc).url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire: stock de iPhone ${enPais(cc)}`,
  offer: "El stock en directo, el mapa y el registro de reposiciones son gratis; los planes de alertas empiezan en $5 al mes",
  itemList: (cc: CountryCode) => `Apple Store ${dePais(cc)}`,
  restockTimesChip: "Horas de reposición",
  storesByRegion: (cc: CountryCode) => `Tiendas por ${noun(COUNTRIES[cc]).one}`,
  browse: (cc: CountryCode) => `Stock por lugar ${enPais(cc)}`,
  selloutH2: (cc: CountryCode) => `¿Cuánto dura una reposición de iPhone ${enPais(cc)}?`,
  selloutLabel: (cc: CountryCode) => `en las tiendas Apple ${dePais(cc)}`,
  last24Label: (cc: CountryCode) => enPais(cc),
  newsroom: "Apple Newsroom, 23 de octubre de 2026: lanzamiento mundial del iPhone Duo en tienda",
};

/** Store page title from content.titles.store; a store named after its city gets Apple Store + city. */
function storeTitle(s: Store, region?: string): string {
  const city = cityLabel(s.country ?? "us", s.city, L);
  const own = apple(s);
  const name = own === `Apple ${city}` ? `Apple Store ${city}` : own;
  const shown = region && !name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  return fitTitleW(content.titles.store(name, shown));
}

/** Source links: Apple's help and store list (served in Spanish at the same URLs) and the Spanish tax page where there is one. */
function sources(code: Exclude<CountryCode, "us">) {
  const help = pickupHelp(code);
  const listSrc = storeListSource(code);
  return {
    pickupHelp: { label: `Apple: ayuda de envío y recogida (${pais(code)}): qué llevar al recoger`, url: help.url },
    storeList: { label: `Apple: lista de tiendas (${pais(code)})`, url: listSrc.url },
    tax: taxSource(code),
  };
}

export const place: Dict["place"] = {
  sinceWhen,
  /** Spanish readers know which Valencia: no country suffix. */
  placeLabel: (_cc: CountryCode, name: string) => name,
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
  sources,
};
