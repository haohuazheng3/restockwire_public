/**
 * Restock-hour pages for the regions and cities of the 18 countries outside the US:
 * /{cc}/when-does-iphone-duo-restock/{region} and /{cc}/when-does-iphone-duo-restock/{region}/{city}, plus their
 * native versions under /{lang}-{cc}/…. Which places get one follows the /apple-stores rule to the letter
 * (placeTarget: one page per place): a region only where its own store page is indexable, a city only where it has
 * two or more stores. Every other place URL answers with the page its store URL collapses into — a store, a city's
 * restock-hour page, or the country's. Pure and database-free, so the proxy (seo/routes.ts), the sitemap and the
 * pages read the same answer.
 */
import { citiesWithStores, placeTarget, statesWithStores, type PlaceTarget, type Store } from "../apple/catalog";
import { prefixOf, type CountryCode } from "../apple/countries";

export const RESTOCK_TIMES_SLUG = "when-does-iphone-duo-restock";

/** A place with a restock-hour page of its own. */
export interface RestockPlacePage {
  level: "region" | "city";
  /** English data names (regionLabel / cityLabel put them in a language). */
  region: string;
  city?: string;
  regionSlug: string;
  citySlug?: string;
  /** /{cc}/when-does-iphone-duo-restock/{region}[/{city}] (English form). */
  path: string;
  /** The place's live store page. */
  storesPath: string;
  stores: Store[];
}

/** The restock-hour page that answers a store-tree target which is not a page of its own. */
function collapsed(cc: CountryCode, t: PlaceTarget): string {
  if (t.kind === "store") return t.path;
  if (t.kind === "stores") return `${prefixOf(cc)}/${RESTOCK_TIMES_SLUG}`;
  return t.path.replace(`${prefixOf(cc)}/apple-stores/`, `${prefixOf(cc)}/${RESTOCK_TIMES_SLUG}/`);
}

/**
 * Resolve /{cc}/when-does-iphone-duo-restock/{region}[/{city}]: the place's own page (`page`) or where it 308s
 * (`redirect`); null = no such place (a real 404).
 */
export function restockPlaceTarget(cc: CountryCode, regionSlug: string, citySlug?: string): { page: RestockPlacePage } | { redirect: string } | null {
  const t = placeTarget(cc, regionSlug, citySlug);
  if (!t || t.level === "country") return null;
  if (!t.indexable) return { redirect: collapsed(cc, t) };
  const own = `${prefixOf(cc)}/${RESTOCK_TIMES_SLUG}/${regionSlug}${citySlug !== undefined ? `/${citySlug}` : ""}`;
  return {
    page: {
      level: t.level, region: t.region!, city: t.city, regionSlug, citySlug,
      path: own, storesPath: t.path, stores: t.stores,
    },
  };
}

/** Every place page of a country: its regions (alphabetical), then its cities (by region, then name). */
export function restockPlacePages(cc: CountryCode): { regions: RestockPlacePage[]; cities: RestockPlacePage[] } {
  const pageOf = (r: ReturnType<typeof restockPlaceTarget>) => (r && "page" in r ? r.page : null);
  const regions = statesWithStores(cc).map((r) => pageOf(restockPlaceTarget(cc, r.slug))).filter((p): p is RestockPlacePage => Boolean(p));
  const cities = citiesWithStores(cc).map((c) => pageOf(restockPlaceTarget(cc, c.stateSlug, c.slug))).filter((p): p is RestockPlacePage => Boolean(p));
  return { regions, cities };
}

/**
 * The restock-hour page of a place outside the US, by its English region (and city) name: its own page, or the
 * page the place collapses into (a store, a city, the country). The US is handled by restockTimesPath.
 */
export function intlRestockTimesPath(cc: CountryCode, stateName: string, city?: string): string {
  const region = statesWithStores(cc).find((r) => r.name === stateName);
  if (!region) return `${prefixOf(cc)}/${RESTOCK_TIMES_SLUG}`;
  const c = city === undefined ? undefined : citiesWithStores(cc).find((x) => x.state === stateName && x.name === city);
  const r = restockPlaceTarget(cc, region.slug, c?.slug);
  if (!r) return `${prefixOf(cc)}/${RESTOCK_TIMES_SLUG}`;
  return "page" in r ? r.page.path : r.redirect;
}
