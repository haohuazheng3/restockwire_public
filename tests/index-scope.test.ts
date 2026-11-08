import { describe, expect, it } from "vitest";
import { inIndexScope } from "@/lib/seo/indexScope";

describe("index scope", () => {
  it("keeps the US tree, guides and model pages", () => {
    for (const p of ["/", "/pricing", "/apple-stores", "/apple-stores/california", "/apple-stores/california/los-angeles/the-grove", "/in-stock/iphone-duo", "/when-does-iphone-duo-restock", "/blog", "/blog/x", "/live-map", "/restock-log"]) expect(inIndexScope(p), p).toBe(true);
  });
  it("keeps four pages per other country", () => {
    for (const p of ["/jp", "/jp/", "/jp/apple-stores", "/jp/restock-log", "/jp/when-does-iphone-duo-restock"]) expect(inIndexScope(p), p).toBe(true);
  });
  it("leaves native trees, other countries' place/model/map pages and US facets out", () => {
    // 2026-11-08: other countries' region/city restock-hour pages are served but, like the US ones, stay out while the scope is narrow.
    for (const p of ["/ja-jp", "/ja-jp/apple-stores", "/de-at/restock-log", "/jp/apple-stores/tokyo", "/jp/apple-stores/tokyo/ginza", "/jp/in-stock/iphone-duo", "/jp/live-map", "/when-does-iphone-duo-restock/california", "/when-does-iphone-duo-restock/california/los-angeles", "/uk/when-does-iphone-duo-restock/greater-london", "/ja-jp/when-does-iphone-duo-restock/tokyo/tokyo", "/in-stock/iphone-duo-512gb", "/in-stock/iphone-duo/california"]) expect(inIndexScope(p), p).toBe(false);
  });
});

describe("index scope: RestockWire's own families", () => {
  it("indexes them in every country and language version", () => {
    for (const p of ["/apple-pickup-status", "/jp/apple-pickup-status", "/ja-jp/apple-pickup-status", "/restock-reports/2026-w45", "/de-de/restock-reports/2026-w45", "/uk/compare-apple-stores/a-vs-b", "/fr-fr/fastest-selling-apple-stores", "/ja-jp/restock-alerts-on-apple-watch", "/restock-alerts-in-focus-mode"]) expect(inIndexScope(p), p).toBe(true);
    for (const p of ["/ja-jp/apple-pickup-status/x/y", "/ja-jp/live-map"]) expect(inIndexScope(p), p).toBe(false);
  });
});
