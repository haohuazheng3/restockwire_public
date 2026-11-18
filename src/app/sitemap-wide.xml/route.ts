/** /sitemap-wide.xml: the index of the product sitemaps beyond /sitemap.xml (lib/seo/widePages.ts). */
import { WIDE_FILES } from "@/lib/seo/widePages";
import { sitemapIndex } from "@/lib/seo/sitemapXml";

export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://restockwire.com";
  if (process.env.NEXT_PUBLIC_INDEXABLE !== "1") return sitemapIndex([]);
  return sitemapIndex(WIDE_FILES.map((f) => `${base}/sitemap-wide/${f}.xml`));
}
