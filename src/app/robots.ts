import type { MetadataRoute } from "next";
import { INTL_CODES } from "@/lib/apple/countries";
import { NATIVE_LOCALES } from "@/lib/i18n/locales";

/** Search and AI answer engines are welcome everywhere public; private areas stay out for everyone. */
const PRIVATE = ["/admin", "/account", "/api/", "/checkout/"];
/**
 * Filtered views that are never meant for Google's index: every place-level product page (noindex for Google) and
 * the map / restock-log filters (canonical to /live-map and /restock-log). Location pages link to about 13,500 of
 * them, so Google crawling them would waste a young site's crawl budget on pages it discards; Google's advice for
 * faceted URLs you don't need indexed is to block crawling in robots.txt. National product pages
 * (/in-stock/{product}) and every /apple-stores page stay open. Every other country repeats the three under its prefix.
 */
export const FACETS = ["/in-stock/*/", "/live-map?", "/restock-log?", ...[...INTL_CODES, ...NATIVE_LOCALES.map((l) => l.id)].flatMap((p) => [`/${p}/in-stock/*/`, `/${p}/live-map?`, `/${p}/restock-log?`])];
/** The map and restock-log filters alone: the only views closed to Bing and the answer engines. */
export const FILTERS = FACETS.filter((f) => !f.includes("/in-stock/"));
/**
 * Bing and the answer-engine / AI crawlers: every public page, product pages at every level included (owner
 * 2026-11-18: "所有页面都对 ai 爬虫开放", "第二个网站也全部放开"). One group for all of them; Google keeps "*".
 */
export const NAMED_AGENTS = [
  "Bingbot",
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot", "Applebot-Extended",
  "DuckAssistBot", "Amazonbot", "meta-externalagent", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://restockwire.com";
  const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "1";
  if (!indexable) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: [...PRIVATE, ...FACETS] },
      { userAgent: NAMED_AGENTS, allow: "/", disallow: [...PRIVATE, ...FILTERS] },
    ],
    // Only Google's scope here: /sitemap-wide.xml (every other page) is submitted to Bing directly, so Google never
    // reads a list of pages it is blocked from (lib/seo/widePages.ts).
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
