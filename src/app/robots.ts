import type { MetadataRoute } from "next";
import { INTL_CODES } from "@/lib/apple/countries";
import { NATIVE_LOCALES } from "@/lib/i18n/locales";

/** Search and AI answer engines are welcome everywhere public; private areas stay out for everyone. */
const PRIVATE = ["/admin", "/account", "/api/", "/checkout/"];
/**
 * Filtered views, never pages of their own: the map and restock-log filters (canonical to /live-map and /restock-log).
 * Every other public page is open to every crawler since 2026-11-18 (owner: "所有页面都对 ai 爬虫开放", then for Google
 * too: "全部开放并提交"); before that "*" (Googlebot) was also kept out of every place-level product page (/in-stock/*\/).
 * Every other country repeats the two under its prefix.
 */
export const FILTERS = ["/live-map?", "/restock-log?", ...[...INTL_CODES, ...NATIVE_LOCALES.map((l) => l.id)].flatMap((p) => [`/${p}/live-map?`, `/${p}/restock-log?`])];
/**
 * Search, answer-engine and AI crawlers named on purpose, with exactly the rules of "*" (a named group replaces "*"
 * for that agent, so the rules are repeated, once, for all of them).
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
      { userAgent: "*", allow: "/", disallow: [...PRIVATE, ...FILTERS] },
      { userAgent: NAMED_AGENTS, allow: "/", disallow: [...PRIVATE, ...FILTERS] },
    ],
    // /sitemap-wide.xml: the product pages beyond /sitemap.xml (lib/seo/widePages.ts), an index of per-tree files.
    sitemap: [`${base}/sitemap.xml`, `${base}/sitemap-wide.xml`],
    host: base,
  };
}
