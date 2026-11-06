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
    for (const p of ["/ja-jp", "/ja-jp/apple-stores", "/de-at/restock-log", "/jp/apple-stores/tokyo", "/jp/apple-stores/tokyo/ginza", "/jp/in-stock/iphone-duo", "/jp/live-map", "/when-does-iphone-duo-restock/california", "/when-does-iphone-duo-restock/california/los-angeles", "/in-stock/iphone-duo-512gb", "/in-stock/iphone-duo/california"]) expect(inIndexScope(p), p).toBe(false);
  });
});
