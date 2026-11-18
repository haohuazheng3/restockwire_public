/**
 * /sitemap-wide.xml (server only: it walks every country's tree): every product page /sitemap.xml does not list, one
 * file per tree (the US, each country's English tree, each native version) and level: {tree}-places.xml (product ×
 * country/region/city) and {tree}-stores.xml (product × store). /sitemap.xml keeps the national model pages (every
 * tree) and the US national storage and color pages.
 *
 * 2026-11-18 (owner): first for Bing and the answer engines only ("所有页面都对 ai 爬虫开放"), the same day for Google
 * too ("全部开放并提交"): listed in robots.txt and submitted to Search Console and Bing.
 */
import { INTL_CODES, type CountryCode } from "../apple/countries";
import { NATIVE_LOCALES, pathInLocale, type Locale } from "../i18n/locales";
import { productPath, type Place, type Product } from "./products";
import { treeOf, type Tree } from "./tree";

export interface PageEntry { path: string; storeNumbers: string[] }

/** One tree: the US, a country's English tree or a native version of it. */
export interface TreeId { cc: CountryCode; loc?: Locale; id: string }
export const TREE_IDS: TreeId[] = [
  { cc: "us", id: "us" },
  ...INTL_CODES.map((cc) => ({ cc, id: cc })),
  ...NATIVE_LOCALES.map((loc) => ({ cc: loc.cc as CountryCode, loc, id: loc.id })),
];

export type WideLevel = "places" | "stores";
export const WIDE_FILES: string[] = TREE_IDS.flatMap((t) => [`${t.id}-places`, `${t.id}-stores`]);

/** "places" = the country, its regions and its two-plus-store cities; "stores" = its stores. */
function placesOf(t: Tree, level: WideLevel): Place[] {
  if (level === "stores") return t.stores.map((s) => t.storePlace(s));
  const regions = [...new Set(t.stores.map((s) => s.state))].map((r) => t.regionPlace(r)).filter((p): p is Place => Boolean(p));
  const cities = t.multiStoreCities().map((c) => t.cityPlace(c.state, c.name)).filter((p): p is Place => Boolean(p));
  return [t.root, ...regions, ...cities];
}

const selfCanonical = (t: Tree, pr: Product, p: Place) => productPath(pr, t.canonicalPlace(p)) === productPath(pr, p);

/** Listed in /sitemap.xml (app/sitemap.ts): a country's model pages, and in the US its storage and color pages too. */
const inMainSitemap = (tree: TreeId, pr: Product, p: Place) => p.level === "country" && (pr.kind === "model" || (tree.cc === "us" && (pr.kind === "storage" || pr.kind === "color")));

/** Every product page of one tree and level that is its own canonical and not in /sitemap.xml. */
export function wideProductEntries(tree: TreeId, level: WideLevel): PageEntry[] {
  const t = treeOf(tree.cc);
  const out: PageEntry[] = [];
  for (const pr of t.products) {
    for (const p of placesOf(t, level)) {
      if (!selfCanonical(t, pr, p) || inMainSitemap(tree, pr, p)) continue;
      const en = productPath(pr, p);
      const path = tree.loc ? pathInLocale(en, tree.loc) : en;
      out.push({ path, storeNumbers: p.stores.map((s) => s.storeNumber) });
    }
  }
  return out;
}
