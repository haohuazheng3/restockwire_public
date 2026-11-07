import { signalGuides, SIGNAL_HUB, SIGNAL_REVIEWED } from "@/content/signals/guides";
import type { MetadataRoute } from "next";
import { MODELS, STORES, statesWithStores, citiesWithStores, storePath, cityPath, hasStatePage, storesOf, placeTarget, mapPath, restocksPath } from "@/lib/apple/catalog";
import { INTL_CODES, prefixOf, type CountryCode } from "@/lib/apple/countries";
import { latestEventPerStore } from "@/lib/stock/queries";
import { PRODUCTS, US, productPath, isIndexedProductPage } from "@/lib/seo/products";
import { NATIVE_LOCALES, pathInLocale } from "@/lib/i18n/locales";
import { blogSitemapEntries } from "@/lib/blog/sitemap";
import { inIndexScope } from "@/lib/seo/indexScope";
import { GUIDE_SLUGS, comparePairs, hasRankingPage, reportWeeks } from "@/lib/content/insight";
import { ALL_CODES } from "@/lib/apple/countries";

/** Regenerated hourly: lastModified of a store/city/state page is its latest real availability event when one is known. */
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/**
 * Another country's indexable pages (the SEO plan §12): its home, its store index (unless it collapses into the only
 * store), every region and city page that is its place's page (placeTarget), every store, the three model
 * pages, the restock log and the map. Nothing that redirects or is noindex.
 */
export function countryEntries(cc: Exclude<CountryCode, "us">, base: string, now: Date, latestOf: (storeNumbers: string[]) => Date): Entry[] {
  const p = prefixOf(cc);
  const stores = storesOf(cc);
  const out: Entry[] = [{ url: `${base}${p}`, lastModified: latestOf(stores.map((s) => s.storeNumber)), changeFrequency: "hourly", priority: 0.9 }];
  if (placeTarget(cc)?.indexable) out.push({ url: `${base}${p}/apple-stores`, lastModified: latestOf(stores.map((s) => s.storeNumber)), changeFrequency: "hourly", priority: 0.85 });
  for (const r of statesWithStores(cc)) {
    const t = placeTarget(cc, r.slug);
    if (t?.indexable) out.push({ url: `${base}${t.path}`, lastModified: latestOf(t.stores.map((s) => s.storeNumber)), changeFrequency: "hourly", priority: 0.85 });
  }
  for (const c of citiesWithStores(cc)) {
    const t = placeTarget(cc, c.stateSlug, c.slug);
    if (t?.indexable) out.push({ url: `${base}${t.path}`, lastModified: latestOf(t.stores.map((s) => s.storeNumber)), changeFrequency: "hourly", priority: 0.8 });
  }
  for (const s of stores) out.push({ url: `${base}${storePath(s)}`, lastModified: latestOf([s.storeNumber]), changeFrequency: "hourly", priority: 0.8 });
  for (const m of MODELS) out.push({ url: `${base}${p}/in-stock/${m.slug}`, lastModified: now, changeFrequency: "always", priority: 0.75 });
  out.push({ url: `${base}${restocksPath(cc)}`, lastModified: now, changeFrequency: "hourly", priority: 0.5 });
  out.push({ url: `${base}${mapPath(cc)}`, lastModified: now, changeFrequency: "hourly", priority: 0.5 });
  // The country's restock-times question page (the SEO plan §13): its numbers change with every restock.
  out.push({ url: `${base}${p}/when-does-iphone-duo-restock`, lastModified: latestOf(stores.map((s) => s.storeNumber)), changeFrequency: "hourly", priority: 0.7 });
  return out;
}

/**
 * The iPhone Duo question pages (the SEO plan §13): one answer page per question people put to search and answer
 * engines. Their numbers are live, so they change with the restock log.
 */
export const QUESTION_PAGES = ["/when-does-iphone-duo-restock", "/how-fast-does-iphone-duo-sell-out", "/iphone-duo-restock-alerts", "/iphone-duo-in-stock-near-me", "/how-to-buy-an-iphone-duo-in-store", "/iphone-duo-most-restocked-stores", "/apple-store-pickup-explained", "/iphone-duo-restock-checkout-guide", "/is-iphone-duo-back-in-stock", "/iphone-duo-availability-checker", "/where-to-buy-iphone-duo-today"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://restockwire.com";
  const now = new Date();
  const [latest, ...intlLatest] = await Promise.all([latestEventPerStore(), ...INTL_CODES.map((cc) => latestEventPerStore(cc))]);
  const all = Object.assign({}, latest, ...intlLatest) as Record<string, string>;
  const latestOf = (storeNumbers: string[]): Date => {
    let best: Date | null = null;
    for (const n of storeNumbers) { const iso = all[n]; if (iso) { const d = new Date(iso); if (!best || d > best) best = d; } }
    return best ?? now;
  };
  const statics = ["", "/how-restock-alerts-work", "/pricing", "/phone-alerts", "/live-map", "/restock-log", "/about", "/contact", "/privacy", "/terms", "/refunds", "/apple-stores"].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 }));
  const signalPages: MetadataRoute.Sitemap = [SIGNAL_HUB, ...signalGuides.map((g) => `/${g.slug}`)].map((path) => ({ url: `${base}${path}`, lastModified: new Date(SIGNAL_REVIEWED), changeFrequency: "weekly", priority: 0.7 }));
  const questions = QUESTION_PAGES.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.8 }));
  // "When does the iPhone Duo restock in {state / city}?" (docs/research.md §8.3 B): one page per US state with a page of
  // its own and per two-plus-store city, under the national restock-times page; its numbers change with every restock.
  const restockPlaces = [
    ...statesWithStores().filter((s) => hasStatePage(s.name)).map((s) => ({ url: `${base}/when-does-iphone-duo-restock/${s.slug}`, lastModified: latestOf(STORES.filter((x) => x.state === s.name).map((x) => x.storeNumber)), changeFrequency: "hourly" as const, priority: 0.75 })),
    ...citiesWithStores().filter((c) => c.stores.length > 1).map((c) => ({ url: `${base}/when-does-iphone-duo-restock/${c.stateSlug}/${c.slug}`, lastModified: latestOf(c.stores.map((x) => x.storeNumber)), changeFrequency: "hourly" as const, priority: 0.75 })),
  ];
  const models = MODELS.map((m) => ({ url: `${base}/in-stock/${m.slug}`, lastModified: now, changeFrequency: "always" as const, priority: 0.8 }));
  const states = statesWithStores().filter((s) => hasStatePage(s.name)).map((s) => ({ url: `${base}/apple-stores/${s.slug}`, lastModified: latestOf(STORES.filter((x) => x.state === s.name).map((x) => x.storeNumber)), changeFrequency: "hourly" as const, priority: 0.9 }));
  const cities = citiesWithStores().filter((c) => c.stores.length > 1).map((c) => ({ url: `${base}${cityPath(c.state, c.name)}`, lastModified: latestOf(c.stores.map((x) => x.storeNumber)), changeFrequency: "hourly" as const, priority: 0.85 }));
  const stores = STORES.map((s) => ({ url: `${base}${storePath(s)}`, lastModified: latestOf([s.storeNumber]), changeFrequency: "hourly" as const, priority: 0.8 }));

  // Product pages: only the national page of each model, storage size and color, minus the storage sizes whose
  // keyword has no opening (NOT_INDEXED_PRODUCTS). Every place-level product page and every exact configuration
  // stays out of the index (noindex, follow): the /apple-stores page of a place already answers "iPhone Duo in
  // <place>", and one indexed page per place keeps the site free of near-duplicates.
  const products: MetadataRoute.Sitemap = PRODUCTS.filter((p) => (p.kind === "storage" || p.kind === "color") && isIndexedProductPage(p, US)).map((p) => ({ url: `${base}${productPath(p, US)}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.5 }));
  const countries = INTL_CODES.flatMap((cc) => countryEntries(cc, base, now, latestOf));
  // Each country's pages in its own languages (docs/i18n.md §6): the same set under /{lang}-{cc}.
  const natives = NATIVE_LOCALES.flatMap((loc) => countryEntries(loc.cc as Exclude<CountryCode, "us">, base, now, latestOf).map((e) => ({ ...e, url: `${base}${pathInLocale(e.url.slice(base.length), loc)}` })));
  // The blog (lib/blog/sitemap.ts): /blog from its first post, categories with a post, every post; nothing while it is empty.
  const blog = blogSitemapEntries(base);
  // RestockWire's own families (components/pages/insight): every country, English tree and native versions alike.
  const weeksByCc = Object.fromEntries(await Promise.all(ALL_CODES.map(async (cc) => [cc, await reportWeeks(cc)] as const)));
  const ownFor = (cc: CountryCode, prefix: string): MetadataRoute.Sitemap => {
    const p = (slug: string) => `${base}${prefix}/${slug}`;
    const out: MetadataRoute.Sitemap = [
      { url: p("apple-pickup-status"), lastModified: now, changeFrequency: "always", priority: 0.7 },
      { url: p("restock-reports"), lastModified: now, changeFrequency: "daily", priority: 0.6 },
      ...weeksByCc[cc].map((w) => ({ url: p(`restock-reports/${w.week}`), lastModified: now, changeFrequency: (w.complete ? "monthly" : "hourly") as "monthly" | "hourly", priority: 0.6 })),
    ];
    if (hasRankingPage(cc)) out.push({ url: p("fastest-selling-apple-stores"), lastModified: now, changeFrequency: "hourly", priority: 0.7 });
    const pairs = comparePairs(cc);
    if (pairs.length) out.push({ url: p("compare-apple-stores"), lastModified: now, changeFrequency: "daily", priority: 0.5 }, ...pairs.map((x) => ({ url: p(`compare-apple-stores/${x.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.5 })));
    return out;
  };
  const guides = Object.values(GUIDE_SLUGS);
  const own: MetadataRoute.Sitemap = [
    ...ownFor("us", ""),
    ...guides.map((g) => ({ url: `${base}/${g}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...INTL_CODES.flatMap((cc) => ownFor(cc, prefixOf(cc))),
    ...NATIVE_LOCALES.flatMap((loc) => [...ownFor(loc.cc, `/${loc.id}`), ...guides.map((g) => ({ url: `${base}/${loc.id}/${g}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 }))]),
  ];
  // Only what is inside the index scope (lib/seo/indexScope.ts); the rest is served with noindex, follow.
  return [...signalPages, ...statics, ...questions, ...restockPlaces, ...models, ...states, ...cities, ...stores, ...products, ...blog, ...countries, ...natives, ...own].filter((e) => inIndexScope(new URL(e.url).pathname));
}
