import { INTL_CODES } from "@/lib/apple/countries";
import { MODELS } from "@/lib/apple/catalog-core";
import { NATIVE_LOCALES } from "@/lib/i18n/locales";

/**
 * RestockWire's index scope (owner, 2026-11-06: "先做第 1 条"). The site shares its store data and page inventory
 * with an older sister site, so for its first months it asks search engines to index a deliberately smaller set
 * than it serves: the US tree (home, guides, question pages, the three model pages, every state, city and store
 * page), and for each other country only its home, its store index, its restock log and its restock-times page.
 * Everything else stays live and linked but carries `X-Robots-Tag: noindex, follow` (set by the proxy) and is left
 * out of the sitemap: every native-language tree, other countries' region/city/store/model/map pages, the US
 * state/city restock-times pages, and the US storage/color product pages.
 *
 * Widen it later by deleting a rule here: the sitemap and the header both follow this one function.
 */
const INTL = new Set<string>(INTL_CODES);
const NATIVE = new Set<string>(NATIVE_LOCALES.map((l) => l.id));
const MODEL_SLUGS = new Set(MODELS.map((m) => m.slug));
const INTL_KEPT = new Set(["", "apple-stores", "restock-log", "when-does-iphone-duo-restock"]);
/**
 * RestockWire's own page families (2026-11-07): the sister site has nothing like them, so they are indexed in every
 * country and every language version, native ones included. Single pages, and the two families with one more segment.
 */
const OWN_PAGES = new Set(["apple-pickup-status", "fastest-selling-apple-stores", "restock-alerts-on-apple-watch", "restock-alerts-in-focus-mode", "restock-alerts-on-android"]);
const OWN_TREES = new Set(["restock-reports", "compare-apple-stores"]);
const own = (seg: string[]) => (seg.length === 2 && (OWN_PAGES.has(seg[1]) || OWN_TREES.has(seg[1]))) || (seg.length === 3 && OWN_TREES.has(seg[1]));

export function inIndexScope(pathname: string): boolean {
  const seg = pathname.replace(/\/+$/, "").split("/").slice(1);
  const first = seg[0] ?? "";
  if (NATIVE.has(first)) return own(seg);
  if (INTL.has(first)) return own(seg) || (seg.length <= 2 && INTL_KEPT.has(seg[1] ?? ""));
  if (first === "when-does-iphone-duo-restock") return seg.length === 1;
  if (first === "in-stock") return seg.length <= 2 && (seg.length === 1 || MODEL_SLUGS.has(seg[1]));
  return true;
}

export const OUT_OF_SCOPE_ROBOTS = "noindex, follow";
