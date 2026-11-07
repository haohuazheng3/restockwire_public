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
 * Restocks and sell-outs as wire copy: one ruled line per event, the time first in mono, then the state tag
 * ("Available" / "Sold out", the state now), the store, the configuration and the two actions. A line whose
 * configuration has sold out again is greyed. (Redesign 2026-11-06: a list, not a grid of cards.)
 */
export function RestockFeed({ rows, model, showModel = true, emptyText }: { rows: RestockRow[]; model?: ModelKey; showModel?: boolean; emptyText?: string }) {
  const d = t().modules.feed;
  const lang = pageLocale().lang;
  if (rows.length === 0) return <p className="border-y border-line py-6 text-center text-sm text-ink-3">{emptyText ?? d.empty}</p>;
  return (
    <ul className="@container border-t-2 border-rule">
      {rows.map((r) => {
        const available = r.nowAvailable ?? r.kind === "restock";
        const key = modelKeyFor(r.item.model);
        const config = productFor(key, r.item.storage, r.item.color);
        const here = storePlace(r.store);
        const when = <LocalTime iso={r.at.toISOString()} withAgo={false} />;
        return (
          <li key={r.id} className={`grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 border-b border-line py-2.5 @xl:grid-cols-[11.5rem_auto_minmax(0,1fr)_minmax(0,1fr)_auto] ${available ? "" : "text-ink-2 opacity-70"}`}>
            <span className="col-span-3 font-mono text-[11px] uppercase tracking-[.08em] text-ink-3 @xl:col-span-1 @xl:text-xs @xl:normal-case @xl:tracking-normal">{r.kind === "soldout" ? d.soldOutAt(when) : available ? d.since(when) : d.restockedAt(when)}</span>
            <span className={`justify-self-start px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.12em] ${available ? "bg-ok text-[var(--ok-ink)]" : "border border-line-2 text-ink-3"}`}>{available ? d.available : d.soldOut}</span>
            <Link href={productPath(productFor(key), here)} className="block min-w-0 truncate">
              <span className="font-display text-[1.05rem] font-semibold text-ink hover:underline">{lang === "en" ? r.store.name : storeLabel(r.store, lang)}</span>
              <span className="text-xs text-ink-3"> · {cityIn(r.store, lang)}</span>
            </Link>
            <Link href={productPath(config, here)} className="col-start-2 col-end-3 inline-flex min-w-0 items-center gap-1.5 text-sm text-ink-2 hover:text-ink hover:underline @xl:col-auto">
              <Swatch color={r.item.color} className="h-2.5 w-2.5" />
              <span className="truncate">{showModel ? `${r.item.model.replace("iPhone ", "")} ` : ""}{configLabel(r.item, lang)}</span>
            </Link>
            <span className="col-start-3 row-start-2 flex shrink-0 justify-end gap-1 @xl:col-auto @xl:row-auto">
              <Link href={`${mapPath(r.store.country)}?store=${r.storeNumber}&model=${model ?? key}`} className="inline-flex h-8 w-8 items-center justify-center border border-line text-ink-2 hover:border-rule hover:text-ink" aria-label={d.mapAria(lang === "en" ? appleName(r.store) : appleStoreLabel(r.store, lang))} title={d.map}><MapIcon /></Link>
              {available && <a href={appleBuyUrl(r.item, r.store.country)} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 w-8 items-center justify-center border border-rule bg-ink text-on-ink hover:bg-accent" aria-label={d.buyAria(r.item.model, configLabel(r.item, lang))} title={d.buy}><BagIcon /></a>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
