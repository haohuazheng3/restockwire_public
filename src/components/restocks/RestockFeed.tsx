import { PendingLink as Link } from "@/components/ui/PendingLink";
import { cityLine, mapPath, modelKeyFor, appleBuyUrl, type ModelKey, type Store, appleName } from "@/lib/apple/catalog";
import type { RestockRow } from "@/lib/stock/queries";
import { productFor, productPath, storePlace } from "@/lib/seo/products";
import { t, pageLocale } from "@/lib/i18n/server";
import type { Lang } from "@/lib/i18n/locales";
import { appleStoreLabel, cityLabel, configLabel, storeLabel } from "@/lib/i18n/places";
import { LocalTime } from "@/components/site/LocalTime";
import { Swatch } from "@/components/stores/ConfigTable";

const BagIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
const MapIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>
);

/** "Austin, TX" in the US; elsewhere the city in the page's language. */
const cityIn = (s: Store, lang: Lang) => (lang === "en" || s.country === "us" ? cityLine(s) : cityLabel(s.country, s.city, lang));

/**
 * Restocks and sell-outs as an iOS grouped list (redesign 2026-11-07): one row per event on a single panel, a
 * status disc on the leading edge (green = on the shelf now, grey = gone again), the store as the title, the
 * configuration as the subtitle, the time and the two actions trailing. Separators are inset past the disc.
 */
export function RestockFeed({ rows, model, showModel = true, emptyText }: { rows: RestockRow[]; model?: ModelKey; showModel?: boolean; emptyText?: string }) {
  const d = t().modules.feed;
  const lang = pageLocale().lang;
  if (rows.length === 0) return <p className="ios-list px-4 py-6 text-center text-sm text-ink-3">{emptyText ?? d.empty}</p>;
  return (
    <ul className="ios-list @container">
      {rows.map((r) => {
        const available = r.nowAvailable ?? r.kind === "restock";
        const key = modelKeyFor(r.item.model);
        const config = productFor(key, r.item.storage, r.item.color);
        const here = storePlace(r.store);
        const when = <LocalTime iso={r.at.toISOString()} withAgo={false} />;
        return (
          <li key={r.id} className="ios-row flex min-w-0 items-center gap-3 px-4 py-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${available ? "bg-ok text-[var(--ok-ink)]" : "bg-[var(--fill-2)] text-ink-3"}`} aria-hidden>
              {available
                ? <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7" /></svg>
                : <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 8h8" /></svg>}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-baseline justify-between gap-3">
                <Link href={productPath(productFor(key), here)} className="min-w-0 truncate text-[0.9375rem] font-semibold text-ink hover:underline">
                  {lang === "en" ? r.store.name : storeLabel(r.store, lang)}<span className="font-normal text-ink-3"> · {cityIn(r.store, lang)}</span>
                </Link>
                <span className="hidden shrink-0 text-xs tabular-nums text-ink-3 @md:inline">{r.kind === "soldout" ? d.soldOutAt(when) : available ? d.since(when) : d.restockedAt(when)}</span>
              </div>
              {/* Narrow lists (a phone, the home page's left column): the time gets a line of its own. */}
              <div className="text-xs tabular-nums text-ink-3 @md:hidden">{r.kind === "soldout" ? d.soldOutAt(when) : available ? d.since(when) : d.restockedAt(when)}</div>
              <div className="mt-0.5 flex min-w-0 items-center justify-between gap-3">
                <Link href={productPath(config, here)} className="inline-flex min-w-0 items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
                  <Swatch color={r.item.color} className="h-2.5 w-2.5" />
                  <span className="truncate">{showModel ? `${r.item.model.replace("iPhone ", "")} ` : ""}{configLabel(r.item, lang)}</span>
                  <span className={`ms-1 shrink-0 text-xs font-medium ${available ? "text-ok" : "text-ink-3"}`}>{available ? d.available : d.soldOut}</span>
                </Link>
                <span className="flex shrink-0 items-center gap-1.5">
                  {available && <a href={appleBuyUrl(r.item, r.store.country)} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 items-center gap-1 rounded-full bg-accent px-2.5 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)]" aria-label={d.buyAria(r.item.model, configLabel(r.item, lang))} title={d.buy}><BagIcon /></a>}
                  <Link href={`${mapPath(r.store.country)}?store=${r.storeNumber}&model=${model ?? key}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--fill-1)] text-accent hover:bg-[var(--fill-2)]" aria-label={d.mapAria(lang === "en" ? appleName(r.store) : appleStoreLabel(r.store, lang))} title={d.map}><MapIcon /></Link>
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
