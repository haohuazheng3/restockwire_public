import { afterAll, beforeAll, describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap, { allSitemapEntries } from "@/app/sitemap";
import { inIndexScope, OUT_OF_SCOPE_ROBOTS, GOOGLE_NOINDEX } from "@/lib/seo/indexScope";
import { TREE_IDS, WIDE_FILES, wideProductEntries } from "@/lib/seo/widePages";

/** Owner 2026-11-18: every page open to Bing and the answer engines; Google keeps the index scope. */
describe("/sitemap-wide.xml: every page outside Google's scope, for Bing and the answer engines", () => {
  const before = process.env.NEXT_PUBLIC_INDEXABLE;
  beforeAll(() => { process.env.NEXT_PUBLIC_INDEXABLE = "1"; });
  afterAll(() => { process.env.NEXT_PUBLIC_INDEXABLE = before; });
  const us = TREE_IDS.find((t) => t.id === "us")!;
  const usPlaces = wideProductEntries(us, "places").map((e) => e.path);
  const usStores = wideProductEntries(us, "stores").map((e) => e.path);

  it("the noindex is addressed to Google only", () => {
    expect(OUT_OF_SCOPE_ROBOTS).toBe("googlebot: noindex, follow");
    expect(GOOGLE_NOINDEX).toEqual({ index: true, follow: true, googleBot: { index: false, follow: true } });
  });

  it("lists product pages at every level, each its own canonical, none in Google's scope, no duplicates", () => {
    expect(usPlaces).toContain("/in-stock/iphone-duo/california");
    expect(usPlaces).toContain("/in-stock/iphone-duo-256gb");
    expect(usPlaces).not.toContain("/in-stock/iphone-duo"); // in scope: /sitemap.xml
    expect(usStores).toContain("/in-stock/iphone-duo/new-york/new-york/fifthavenue");
    expect(usPlaces.length + usStores.length).toBeLessThan(45_000);
    expect(usStores.length).toBeLessThan(25_000); // one file well under the 50,000-URL limit and the response size limit
    expect(new Set([...usPlaces, ...usStores]).size).toBe(usPlaces.length + usStores.length);
    const ja = wideProductEntries(TREE_IDS.find((t) => t.id === "ja-jp")!, "places").map((e) => e.path);
    expect(ja.length).toBeGreaterThan(0);
    expect(ja.every((p) => p.startsWith("/ja-jp/"))).toBe(true);
    expect([...usPlaces, ...usStores, ...ja].filter((p) => inIndexScope(p))).toEqual([]);
  });

  it("pages.xml is exactly the listable pages /sitemap.xml leaves out", async () => {
    const all = (await allSitemapEntries()).map((e) => e.url);
    const main = new Set((await sitemap()).map((e) => e.url));
    const wide = all.filter((u) => !inIndexScope(new URL(u).pathname));
    expect(wide.length).toBeGreaterThan(0);
    expect(wide.filter((u) => main.has(u))).toEqual([]);
    expect(main.size + wide.length).toBe(all.length);
  });

  it("is one file per tree and level plus pages.xml, and robots.txt does not list it (Google never reads it)", () => {
    expect(WIDE_FILES[0]).toBe("pages");
    expect(WIDE_FILES).toHaveLength(1 + TREE_IDS.length * 2);
    expect(robots().sitemap).toBe("https://restockwire.com/sitemap.xml");
  });
});
