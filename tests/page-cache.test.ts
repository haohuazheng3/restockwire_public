import { describe, expect, it } from "vitest";
import { CACHE_BYPASS_HEADER, servePageCache, type PageRequest } from "@/lib/pageCache";

const req = (o: Partial<{ method: string; pathname: string; search: string; headers: Record<string, string>; cookies: string[] }> = {}): PageRequest => {
  const h = { accept: "text/html,application/xhtml+xml", ...(o.headers ?? {}) } as Record<string, string>;
  return { method: o.method ?? "GET", pathname: o.pathname ?? "/apple-stores/california", search: o.search ?? "", headers: { get: (n) => h[n.toLowerCase()] ?? null }, hasCookie: (n) => (o.cookies ?? []).includes(n) };
};

describe("servePageCache", () => {
  it("caches anonymous document requests of public pages", () => {
    expect(servePageCache(req(), "rw_lang")).toBe(true);
    expect(servePageCache(req({ pathname: "/" }), "rw_lang")).toBe(true);
    expect(servePageCache(req({ pathname: "/jp/in-stock/iphone-duo" }), "rw_lang")).toBe(true);
  });
  it("never caches signed-in readers, language cookies, RSC navigations or its own upstream fetch", () => {
    expect(servePageCache(req({ cookies: ["__session"] }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ cookies: ["__client_uat"] }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ cookies: ["rw_lang"] }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ headers: { rsc: "1" } }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ headers: { "next-router-prefetch": "1" } }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ headers: { [CACHE_BYPASS_HEADER]: "1" } }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ method: "POST" }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ headers: { accept: "application/json" } }), "rw_lang")).toBe(false);
  });
  it("never caches app pages, the sign-in flow or files", () => {
    for (const p of ["/account", "/account/cancel", "/pricing", "/phone-alerts", "/checkout/success", "/admin", "/api/live", "/sitemap.xml", "/icon.svg"]) expect(servePageCache(req({ pathname: p }), "rw_lang")).toBe(false);
    expect(servePageCache(req({ pathname: "/", search: "?signin=1" }), "rw_lang")).toBe(false);
  });
});
