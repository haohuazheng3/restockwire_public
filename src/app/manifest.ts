import type { MetadataRoute } from "next";
import { cookies } from "next/headers";
import { LANG_COOKIE, nativeLocale } from "@/lib/i18n/locales";

// Read per request: the app remembers the language it was installed in (below).
export const dynamic = "force-dynamic";

/**
 * Installable web app: Web Push in Safari requires `display: standalone`. On iOS the Home Screen app keeps a
 * separate cookie store, so the language the person was reading in when they installed it rides in start_url
 * (?lang=ja-jp); the proxy makes it their language on the app's first launch (docs/i18n.md §6).
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const loc = nativeLocale((await cookies()).get(LANG_COOKIE)?.value);
  const lang = loc ? `&lang=${loc.id}` : "";
  return {
    name: "RestockWire",
    short_name: "RestockWire",
    description: "A phone alert the second an iPhone Duo, 18 Pro or 18 Pro Max is back for pickup at your Apple Stores, with live stock and each store's restock hours.",
    id: "/",
    start_url: `/account?from=app${lang}`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0d12",
    theme_color: "#0f0f12",
    categories: ["shopping", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My alerts", url: `/account?from=app${lang}`, icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Stock map", url: "/live-map?from=app", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
