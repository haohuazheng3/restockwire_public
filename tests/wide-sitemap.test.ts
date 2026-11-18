import { afterAll, beforeAll, describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { SITEMAPS } from "@/lib/gsc";
import robots from "@/app/robots";
import { TREE_IDS, WIDE_FILES, wideProductEntries } from "@/lib/seo/widePages";

/** Owner 2026-11-18: every page indexable and submitted ("全部开放并提交"); /sitemap-wide.xml lists the product pages beyond /sitemap.xml. */
describe("/sitemap-wide.xml: every product page /sitemap.xml does not list", () => {
  const before = process.env.NEXT_PUBLIC_INDEXABLE;
  beforeAll(() => { process.env.NEXT_PUBLIC_INDEXABLE = "1"; });
  afterAll(() => { process.env.NEXT_PUBLIC_INDEXABLE = before; });
  const us = TREE_IDS.find((t) => t.id === "us")!;
  const usPlaces = wideProductEntries(us, "places").map((e) => e.path);
  const usStores = wideProductEntries(us, "stores").map((e) => e.path);

  it("lists product pages at every level, each its own canonical, no duplicates", () => {
    expect(usPlaces).toContain("/in-stock/iphone-duo/california");
    expect(usPlaces).toContain("/in-stock/iphone-duo-512gb-night-sky");
    expect(usStores).toContain("/in-stock/iphone-duo/new-york/new-york/fifthavenue");
    expect(usPlaces.length + usStores.length).toBeLessThan(45_000);
    expect(usStores.length).toBeLessThan(25_000); // one file well under the 50,000-URL limit and the response size limit
    expect(new Set([...usPlaces, ...usStores]).size).toBe(usPlaces.length + usStores.length);
    const ja = wideProductEntries(TREE_IDS.find((t) => t.id === "ja-jp")!, "places").map((e) => e.path);
    expect(ja.length).toBeGreaterThan(0);
    expect(ja.every((p) => p.startsWith("/ja-jp/"))).toBe(true);
  });

  it("does not repeat what /sitemap.xml lists (national model pages; US storage and color pages)", async () => {
    const main = new Set((await sitemap()).map((e) => new URL(e.url).pathname));
    for (const p of ["/in-stock/iphone-duo", "/in-stock/iphone-duo-512gb", "/in-stock/iphone-18-pro-max-burgundy", "/uk/in-stock/iphone-duo", "/ja-jp/in-stock/iphone-duo"]) expect(main.has(p), p).toBe(true);
    const wide = TREE_IDS.flatMap((t) => [...wideProductEntries(t, "places"), ...wideProductEntries(t, "stores")]).map((e) => e.path);
    expect(wide.filter((p) => main.has(p))).toEqual([]);
    expect(wide).toContain("/uk/in-stock/iphone-duo-256gb");
  });

  it("is one file per tree and level, listed in robots.txt and submitted to Search Console", () => {
    expect(WIDE_FILES).toHaveLength(TREE_IDS.length * 2);
    expect(robots().sitemap).toEqual(["https://restockwire.com/sitemap.xml", "https://restockwire.com/sitemap-wide.xml"]);
    expect(SITEMAPS).toEqual(robots().sitemap);
  });
});
