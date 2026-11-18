/** /sitemap-wide/{pages | tree-places | tree-stores}.xml: one file of /sitemap-wide.xml (lib/seo/widePages.ts). */
import { allSitemapEntries } from "@/app/sitemap";
import { inIndexScope } from "@/lib/seo/indexScope";
import { TREE_IDS, wideProductEntries, type WideLevel } from "@/lib/seo/widePages";
import { entriesUrlset, latestByStore, urlset } from "@/lib/seo/sitemapXml";

export const revalidate = 3600;

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }): Promise<Response> {
  const { file } = await ctx.params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://restockwire.com";
  const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "1";
  if (file === "pages.xml") {
    if (!indexable) return entriesUrlset([]);
    return entriesUrlset((await allSitemapEntries()).filter((e) => !inIndexScope(new URL(e.url).pathname)));
  }
  const m = /^(.+)-(places|stores)\.xml$/.exec(file);
  const t = m && TREE_IDS.find((x) => x.id === m[1]);
  if (!m || !t) return new Response("Not found", { status: 404 });
  if (!indexable) return urlset([], {}, "");
  return urlset(wideProductEntries(t, m[2] as WideLevel), await latestByStore(), base);
}
