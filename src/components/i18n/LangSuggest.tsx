"use client";
/**
 * On an English country page (/jp/…), a reader whose browser prefers that country's language gets one quiet line
 * linking to the same page in it (/ja-jp/…). Never a redirect (search engines and AI answer engines must see each
 * version at its own address), shown only after mount, dismissed for good with one tap.
 */
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "./LangProvider";
import { baseLang, localeFromSegment, localesOf, pathInLocale, type Lang, type Locale } from "@/lib/i18n/locales";

/** The offer, written in the language it offers. */
const OFFER: Partial<Record<string, string>> = {
  ja: "日本語版はこちら", ko: "한국어판으로 이동", "zh-TW": "切換至繁體中文版", "zh-HK": "切換至繁體中文版",
  de: "Zur deutschen Version", "de-CH": "Zur deutschen Version", fr: "Version française", "fr-CA": "Version française",
  it: "Versione italiana", es: "Versión en español", nl: "Naar de Nederlandse versie", sv: "Till den svenska versionen", ar: "النسخة العربية",
};
const KEY = "rw_lang_offer_off";

/** The native version of this page a browser asking for `wanted` languages should be offered, if any. */
export function offerFor(pathname: string, wanted: readonly string[]): Locale | null {
  const loc = localeFromSegment(pathname.split("/")[1]);
  if (!loc || loc.native) return null;
  const natives = localesOf(loc.cc).filter((l) => l.native);
  for (const w of wanted) {
    const tag = w.toLowerCase();
    const exact = natives.find((l) => l.tag.toLowerCase() === tag);
    if (exact) return exact;
    const fam = natives.find((l) => baseLang(l.lang) === baseLang((tag.startsWith("zh") ? (tag.includes("hk") ? "zh-HK" : "zh-TW") : tag.split("-")[0]) as Lang));
    if (fam) return fam;
    if (tag.startsWith("en")) return null; // English first: nothing to offer
  }
  return null;
}

export function LangSuggest() {
  const loc = useLocale();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const [to, setTo] = useState<Locale | null>(null);
  useEffect(() => {
    let off = false;
    try { off = localStorage.getItem(KEY) === "1"; } catch { /* private mode */ }
    const t = window.setTimeout(() => setTo(off || loc.native ? null : offerFor(pathname, navigator.languages ?? [navigator.language])), 0);
    return () => window.clearTimeout(t);
  }, [pathname, loc.native]);
  if (!to) return null;
  const qs = search?.toString();
  const href = `${pathInLocale(pathname, to)}${qs ? `?${qs}` : ""}`;
  return (
    <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between gap-3 px-4 text-sm" lang={to.tag}>
      <a href={href} dir={to.lang === "ar" ? "rtl" : undefined} className="font-medium text-accent underline-offset-2 hover:underline">{OFFER[to.lang] ?? to.tag} {to.lang === "ar" ? "←" : "→"}</a>
      <button type="button" aria-label="×" className="text-ink-3 hover:text-ink" onClick={() => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setTo(null); }}>×</button>
    </div>
  );
}
