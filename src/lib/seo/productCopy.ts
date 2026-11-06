/** Titles, descriptions, FAQ and structured data for the product × place pages. Short, answer-first, and only what the data says. */
import { catalogFor, itemFor, modelByKey, stateCodeOf, storeLocality, appleName } from "../apple/catalog";
import { COUNTRIES, formatDistance, formatPrice, type CountryCode } from "../apple/countries";
import type { PlaceStats, RestockStats } from "../stock/queries";
import { fitTitle, fmtDuration, fmtPrice, listWords, peakOf, plural, type FaqItem } from "./enrich";
import { inPlace, productPath, type Place, type Product } from "./products";
import type { StoreLine } from "./productData";

const BASE = "https://restockwire.com";

const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
/** "34 mi" in the US, "55 km" where the country signs in km. */
const dist = (place: Place, miles: number) => (ccOf(place) === "us" ? `${Math.round(miles)} mi` : formatDistance(COUNTRIES[ccOf(place)], miles));

export function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  if (place.level === "country" && ccOf(place) !== "us") {
    const inName = COUNTRIES[ccOf(place)].inName;
    return fitTitle([...(inStock > 0 ? [`${plural(inStock, "Apple Store")} ${inName} list the ${product.name} now`] : []), `${product.name} ${inName}: pickup stock, live`, `${product.short} ${inName}: pickup stock`, `${product.short} pickup stock`]);
  }
  if (place.level === "country") return fitTitle([...(inStock > 0 ? [`${product.name}: ${plural(inStock, "Apple Store")} list it for pickup now`] : []), `${product.name} pickup stock at every US Apple Store`, `${product.name}: live pickup stock`, `${product.short} pickup stock`]);
  if (place.level === "store") {
    const s = place.store!;
    return fitTitle([`${product.name} at ${appleName(s)}: ${inStock > 0 ? "listed for pickup now" : "pickup stock and restocks"}`, `${product.short} at ${appleName(s)}: ${inStock > 0 ? "in stock now" : "stock"}`, `${product.short} at ${appleName(s)}`, `${product.short} at ${s.name}`, `${product.short} · ${s.name.replace(/^The /, "")}`]);
  }
  return fitTitle([`${product.name} in ${place.name}: ${inStock} of ${n} stores list it now`, `${product.name} in ${place.name}: pickup stock, live`, `${product.short} in ${place.name}: in stock now?`, `${product.short} in ${place.name}`]);
}

export function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const week = `${plural(stats.week, "restock")} this week`;
  if (place.level === "store") {
    const s = place.store!;
    return fitTitle([
      `${product.name} at ${appleName(s)}, ${ccOf(place) === "us" ? `${s.city} ${stateCodeOf(s)}` : storeLocality(s)}: ${inStock > 0 ? "listed for pickup at the last read" : "not listed for pickup right now"}, ${week}. When this store restocks, how long it lasts, and an alert for the next one.`,
      `${product.name} at ${appleName(s)}: ${inStock > 0 ? "in stock now" : "not in stock now"}, ${week}. Restock hours and alerts.`,
    ], 155);
  }
  const where = place.level === "country" ? (ccOf(place) === "us" ? "US Apple Stores" : `Apple Stores ${COUNTRIES[ccOf(place)].inName}`) : `Apple Stores in ${place.name}`;
  return fitTitle([
    `${inStock} of ${place.stores.length} ${where} list the ${product.name} for pickup at this minute, ${week}. Store by store, with restock hours and a phone alert for the next one.`,
    `${product.name}: ${inStock} of ${place.stores.length} ${where} have it now, ${week}. Live by store, restock hours, alerts.`,
  ], 155);
}

/** Three or four short, data-driven questions; every answer is one sentence. */
export function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const at = inPlace(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const nearestBit = nearest ? `; the nearest store listing it is ${appleName(nearest)} in ${nearest.city}, ${dist(place, nearest.distance)} away` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `Is the ${product.name} in stock ${at} right now?`,
      a: l && l.available.length > 0
        ? `Yes${product.parts.length > 1 ? `: ${listWords(l.available.map((i) => `${i.storage} ${i.color}`), 4)}` : ""}, listed for pickup at the last read.`
        : `Not at the last read${nearestBit}.`,
    });
  } else {
    out.push({
      q: `Which Apple Stores ${at} list the ${product.name} right now?`,
      a: inStock.length === 0
        ? `None at the last read${nearestBit}.`
        : `${plural(inStock.length, "store")} at the last read: ${listWords(inStock.map((l) => `${appleName(l.store)}`), 4)}.`,
    });
  }
  const peak = peakOf(clock);
  out.push({
    q: `How often does the ${product.name} come back ${at}?`,
    a: stats.month === 0 ? `No confirmed restock ${at} in the last ${stats.days} days.` : `${plural(stats.month, "confirmed restock")} in the last ${stats.days} days, ${stats.week} of them this week${peak ? `, clustering around ${peak.hour} local time` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `How long does a ${product.name} restock last ${at}?`, a: `About ${fmtDuration(stats.medianMs)} at the median before it sells out again.` });
  return out;
}

export function productJsonLdFor(product: Product, place: Place, inStock: number) {
  const m = modelByKey(product.model)!;
  const cc = ccOf(product);
  const items = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber));
  const prices = items.map((i) => i.price);
  const availability = inStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const one = product.parts.length === 1 ? itemFor(product.parts[0], cc) : undefined;
  const currency = COUNTRIES[cc].currency;
  return {
    "@context": "https://schema.org", "@type": "Product", name: product.name, brand: { "@type": "Brand", name: "Apple" }, model: m.name,
    ...(one ? { sku: one.partNumber, color: one.color } : {}),
    url: `${BASE}${productPath(product, place)}`,
    offers: one
      ? { "@type": "Offer", priceCurrency: currency, price: one.price, availability, seller: { "@type": "Organization", name: "Apple" } }
      : { "@type": "AggregateOffer", priceCurrency: currency, lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: items.length, availability, seller: { "@type": "Organization", name: "Apple" } },
  };
}

export function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => (cc === "us" ? fmtPrice(v) : formatPrice(COUNTRIES[cc], v));
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}
