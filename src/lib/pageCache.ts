/**
 * Which requests the proxy sends to the CDN-cacheable copy (/api/page-cache). Pure: tested in tests/page-cache.test.ts.
 * Only anonymous, plain document GETs of public pages: no Clerk session, no language cookie (its header links differ),
 * no client-side navigation (RSC / prefetch requests), no app or admin pages, no sign-in flow, and never the copy's own
 * upstream fetch (CACHE_BYPASS_HEADER).
 */
export const CACHE_BYPASS_HEADER = "x-rw-page-origin";

export interface PageRequest {
  method: string;
  pathname: string;
  search: string;
  headers: { get(name: string): string | null };
  hasCookie(name: string): boolean;
}

const NOT_CACHED_PREFIXES = ["/account", "/pricing", "/phone-alerts", "/checkout", "/admin", "/api/", "/_next", "/__not_found__"];

export function servePageCache(r: PageRequest, langCookie: string): boolean {
  if (r.method !== "GET") return false;
  if (r.headers.get(CACHE_BYPASS_HEADER)) return false;
  if (r.headers.get("rsc") || r.headers.get("next-router-prefetch") || r.headers.get("next-router-state-tree") || r.headers.get("next-action")) return false;
  if (!(r.headers.get("accept") ?? "").includes("text/html")) return false;
  if (r.hasCookie("__session") || r.hasCookie("__client_uat") || r.hasCookie(langCookie)) return false;
  if (NOT_CACHED_PREFIXES.some((p) => r.pathname === p.replace(/\/$/, "") || r.pathname.startsWith(p.endsWith("/") ? p : `${p}/`))) return false;
  if (/(^|[?&])(signin|next|session_id|checkout)=/.test(r.search)) return false;
  // Files (with an extension) are static assets or metadata routes, served and cached by Next itself.
  if (/\.[a-z0-9]{2,5}$/i.test(r.pathname)) return false;
  return true;
}
