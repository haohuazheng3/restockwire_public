import { NextResponse } from "next/server";
import { CACHE_BYPASS_HEADER } from "@/lib/pageCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/page-cache?p=/apple-stores/… — the CDN-cacheable copy of a public page.
 *
 * Every page renders dynamically (the root layout reads the request's language), so Vercel's CDN never caches them
 * and each crawler hit used to run a function and query the database. The proxy rewrites anonymous document requests
 * here; this handler fetches the page from the site itself (marked so the proxy lets it through) and returns it with
 * a function-level Cache-Control the CDN honours: 60 s fresh, served stale for up to 10 min while it refreshes.
 * Live numbers on the page still refresh in the browser (/api/live). Signed-in readers, client-side navigations (RSC)
 * and app pages never come here (src/lib/pageCache.ts decides).
 */
const PASS_HEADERS = ["content-type", "x-robots-tag", "link", "content-language", "location", "x-nextjs-cache"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams.get("p") ?? "/";
  if (!p.startsWith("/") || p.startsWith("//") || p.startsWith("/api/")) return NextResponse.json({ error: "bad path" }, { status: 400 });
  let res: Response;
  try {
    res = await fetch(new URL(p, url.origin), {
      headers: { [CACHE_BYPASS_HEADER]: "1", accept: "text/html", "accept-language": req.headers.get("accept-language") ?? "", "user-agent": req.headers.get("user-agent") ?? "restockwire-page-cache" },
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return new NextResponse("upstream timeout", { status: 504, headers: { "cache-control": "no-store" } });
  }
  const headers = new Headers();
  for (const h of PASS_HEADERS) { const v = res.headers.get(h); if (v) headers.set(h, v); }
  const cacheable = res.status === 200 || res.status === 404 || res.status === 301 || res.status === 308;
  headers.set("cache-control", cacheable ? (res.status === 200 ? "public, max-age=0, s-maxage=60, stale-while-revalidate=600" : "public, max-age=0, s-maxage=600") : "no-store");
  headers.set("x-page-cache", "1");
  return new NextResponse(res.status >= 300 && res.status < 400 ? null : res.body, { status: res.status, headers });
}
