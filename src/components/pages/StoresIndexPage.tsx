/**
 * A country's store index: /apple-stores (the US, "list of apple stores") and /{cc}/apple-stores ("apple stores in
 * {country}", the SEO plan §12; body in StoresIndexIntl.tsx). Same skeleton — live cards, how many stores and where,
 * every region, restock charts, FAQ, sources — with the US keeping its sales-tax angle and other countries
 * their own tax rule. Austria and Belgium have one store each: their /apple-stores is that store's page (308).
 */
import type { Metadata } from "next";
import { STATS_DAYS } from "@/lib/stock/window";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { cache } from "react";
import { citiesWithStores, cityPath, statePath, statesWithStores, storesOf, catalogFor, partNumbersFor, DEFAULT_MODEL, MODELS } from "@/lib/apple/catalog";
import { prefixOf, type Country } from "@/lib/apple/countries";
import { alertHref, faq, peakOf, itemListJsonLd } from "@/lib/seo/enrich";
import { storesWithStockNow, storesStock, stockByStore, placeStats, restockStats, restockReportStats } from "@/lib/stock/queries";
import { alertsSentAt, stockFromRows, wireNowFrom } from "@/lib/content/wireNow";
import { WireNow } from "@/components/restocks/WireNow";
import { t as dictT } from "@/lib/i18n/server";
import { BrowseModels, BrowsePopular } from "@/components/seo/Browse";
import { LinkRow, RelatedBlock } from "@/components/seo/Related";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlaceStatStrip } from "@/components/seo/StatStrip";
import { ModelPlaceCards } from "@/components/seo/ModelPlaceCards";
import { US as US_PLACE } from "@/lib/seo/products";
import { Faq } from "@/components/seo/Faq";
import { DailyBars } from "@/components/restocks/DailyBars";
import { RestockClock } from "@/components/restocks/RestockClock";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { sellouts } from "@/lib/stock/sellouts";
import { Figure } from "@/components/content/Figure";
import { SourceList } from "@/components/content/RichFaq";
import { emptyFacts } from "@/lib/content/facts";
import { SALES_TAX, SALES_TAX_SOURCE } from "@/content/sales-tax";
import { hubFaq } from "@/lib/seo/placeCopy";
import { storesIndexTitle } from "@/lib/seo/countryCopy";
import { treeOf } from "@/lib/seo/tree";
import { hreflangFor } from "./shared";
import { englishLocale, pathInLocale, type Locale } from "@/lib/i18n/locales";
import { dict } from "@/lib/i18n/dict";

/**
 * Bound keywords (DataForSEO, the SEO plan §10): "list of apple stores" 210/mo, KD 0 (title and H1); "how many
 * apple stores in the us" gets its own section (320/mo at KD 30); "apple store locations" 22,200, KD 100 (the
 * heading of the state list). The page used to target "apple stores by state", which measures 10.
 */
function hubTitle(c: Country): string {
  if (c.cc !== "us") return storesIndexTitle(c.cc);
  return `List of Apple Stores, US — ${storesOf("us").length} by State, Live iPhone Stock`;
}

/** Nationwide numbers, all cached (60 s): 1 + 3 + 1 queries; another country also reads its stores' stock (one query). */
export const loadIndex = cache(async (cc: Country["cc"]) => {
  const stores = storesOf(cc);
  const tz = cc === "us" ? "America/New_York" : treeOf(cc).root.tz;
  const numbers = stores.map((s) => s.storeNumber);
  const [stockNow, pstats, stats, stock, duo, max, reports, sell, duoClock, duoReports, duoSell, duoRows, alerts] = await Promise.all([
    storesWithStockNow(undefined, cc),
    placeStats({ tz, country: cc }),
    restockStats(numbers, tz, STATS_DAYS),
    cc === "us" ? Promise.resolve(new Map()) : storesStock(numbers),
    placeStats({ model: "duo", tz, country: cc }),
    cc === "us" ? Promise.resolve(null) : placeStats({ model: "18-pro-max", tz, country: cc }),
    restockReportStats(numbers, tz, STATS_DAYS, undefined, undefined, cc),
    sellouts({ country: cc }),
    // iPhone Duo only for the bulletin, the clock and the tiles (2026-11-08).
    restockStats(numbers, tz, STATS_DAYS, "duo"),
    restockReportStats(numbers, tz, STATS_DAYS, "duo", undefined, cc),
    sellouts({ country: cc, parts: partNumbersFor("duo", [], [], cc) }),
    stockByStore("duo", {}, cc),
    alertsSentAt(numbers),
  ]);
  const now = wireNowFrom({ stores, stock: stockFromRows(duoRows), others: { pro: stockNow["18-pro"], max: stockNow["18-pro-max"] }, clock: duoClock, stats: duo, sell: duoSell, alerts, configsTotal: catalogFor("duo", cc).length });
  return { stockNow, pstats, stats, stock, duo, max, reports, sell, duoClock, duoReports, now };
});

export async function storesIndexMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const d = await loadIndex(c.cc);
  const D = dict(loc.lang);
  const title = c.cc === "us" ? hubTitle(c) : D.place.storesIndexTitle(c.cc);
  const n = storesOf(c.cc).length;
  const description = c.cc === "us"
    ? `${d.stockNow.duo} US Apple Stores list the iPhone Duo for pickup right now. Here are all ${n}, by state and city, with live iPhone Duo, 18 Pro and Pro Max stock.`.slice(0, 160)
    : D.views.storesIndex.metaDescription(c, n, statesWithStores(c.cc).length, citiesWithStores(c.cc).length, d.stockNow.duo, d.stockNow["18-pro-max"]).slice(0, 160);
  const url = loc.native ? pathInLocale(`${prefixOf(c.cc)}/apple-stores`, loc) : `${prefixOf(c.cc)}/apple-stores`;
  return { title, description, alternates: { canonical: url, languages: hreflangFor("stores", loc) }, openGraph: { type: "website", siteName: "RestockWire", title, description, url } };
}

/** The US index. Another country's is StoresIndexIntl.tsx (a module of its own, so the US page loads none of its client code). */
export async function StoresIndexPage({ country: c }: { country: Country }) {
  const STORES = storesOf("us");
  const d = await loadIndex("us");
  const states = statesWithStores();
  const cities = citiesWithStores();
  const alert = alertHref({ model: DEFAULT_MODEL });
  // Four questions; the store count already has its own section above, so the FAQ skips it.
  const hub = hubFaq();
  const duoNow = { q: "Where can I pick up an iPhone Duo in the US today?", a: d.stockNow.duo === 0 ? `Nowhere right now: 0 of ${STORES.length} stores list it. The iPhone Duo stock page and the live map flip the moment one does, and alerts go out first.` : `At ${d.stockNow.duo} of ${STORES.length} stores, as of the last check. The iPhone Duo stock page lists each store and configuration and refreshes every 15 seconds.` };
  const questions = [duoNow, ...faq({ kind: "state", place: "the US", stores: STORES, stockNow: d.stockNow, stats: d.pstats, peak: peakOf(d.duoClock), omit: ["count", "stock"] }), hub.taxFree];
  const W = dictT().modules.wireNow;
  const top = [...states].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 10);
  const thin = states.filter((s) => s.count <= 2).map((s) => s.name);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <JsonLd data={itemListJsonLd("US Apple Store list", STORES)} />
      <h1 className="display text-3xl sm:text-5xl">{hubTitle(c)}</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2">Live now: <b className="text-ink">{d.stockNow.duo}</b> US stores offer an iPhone Duo for pickup, <b className="text-ink">{d.stockNow["18-pro-max"]}</b> an iPhone 18 Pro Max, <b className="text-ink">{d.stockNow["18-pro"]}</b> an 18 Pro. The full count is <b className="text-ink">{STORES.length} Apple Stores</b> in {cities.length} cities, spread over {states.length - 1} states plus Washington, D.C. Open your state below; a tag flags the three without sales tax.</p>
      <div className="mt-6 flex flex-wrap gap-2"><Link href={`/live-map?model=${DEFAULT_MODEL}`} className="btn btn-ghost btn-sm">Live map</Link><Link href="/restock-log" className="btn btn-ghost btn-sm">Restock log</Link><Link href={alert} className="btn btn-primary btn-sm">Alert me</Link></div>
      {/* The bulletin first (lib/content/wireNow.ts). */}
      <div className="mt-5"><WireNow d={d.now} label="in the US" name="the US" stores={STORES} country="us" restockTimesHref="/when-does-iphone-duo-restock" alertHref={alert} /></div>

      <div className="mt-6"><ModelPlaceCards place={US_PLACE} stockNow={d.stockNow} of={STORES.length} unit="stores listing it" /></div>
      <div className="mt-3"><PlaceStatStrip stores={STORES.length} cities={cities.length} stockNow={d.stockNow} stats={d.duo} model="duo" scoped="Duo" /></div>

      <section className="mt-10 max-w-3xl" aria-labelledby="how-many">
        <h2 id="how-many" className="text-2xl font-semibold">How many Apple Stores does the US have?</h2>
        <p className="mt-2 leading-relaxed text-ink-2">{hub.count.a}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="mb-2 text-start text-xs text-ink-3">Top ten states by Apple Store count, from Apple&apos;s retail store list</caption>
            <thead><tr className="text-start text-ink-3"><th className="py-1.5 pe-4 font-medium">State</th><th className="py-1.5 pe-4 font-medium">Apple Stores</th><th className="py-1.5 font-medium">Cities</th></tr></thead>
            <tbody className="divide-y divide-line">
              {top.map((s) => <tr key={s.slug}><td className="py-1.5 pe-4"><Link href={statePath(s.name)} className="hover:underline">{s.name}</Link></td><td className="py-1.5 pe-4 tabular-nums">{s.count}</td><td className="py-1.5 tabular-nums">{cities.filter((x) => x.state === s.name).length}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="mt-10 text-2xl font-semibold">Every US state with an Apple Store, busiest first</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...states].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).map((s) => {
          const mine = cities.filter((x) => x.state === s.name).sort((a, b) => b.stores.length - a.stores.length || a.name.localeCompare(b.name));
          return (
            <li key={s.slug} className="pane-2 min-w-0 p-4">
              <Link href={statePath(s.name)} className="flex items-center justify-between gap-2 font-semibold hover:underline"><span>{s.name}</span><span className="shrink-0 text-sm font-normal text-ink-3">{s.count} Apple Store{s.count > 1 ? "s" : ""}{SALES_TAX[s.name] ? (SALES_TAX[s.name].combined === 0 ? " · tax-free" : ` · tax ${SALES_TAX[s.name].combined}%`) : ""}</span></Link>
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs">
                {mine.map((x) => <Link key={x.slug} href={cityPath(x.state, x.name)} className="text-ink-2 hover:text-ink hover:underline">{x.name}{x.stores.length > 1 ? ` (${x.stores.length})` : ""}</Link>)}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="pane p-5">
          <h2 className="text-xl font-semibold">iPhone Duo restock hours across the US</h2>
          <div className="mt-3"><RestockClock stats={d.duoClock} label="across the US" reports={d.duoReports} /></div>
          <p className="mt-2 text-xs text-ink-3">{W.allModels({ n: d.pstats.month, days: d.pstats.days, peak: peakOf(d.stats)?.hour ?? null })}</p>
        </section>
        <section className="pane p-5">
          <h2 className="text-xl font-semibold">How many seconds does a US restock last?</h2>
          <div className="mt-3"><SellOutTimes data={d.sell} label="across the US" showStore /></div>
        </section>
        <section className="pane p-5">
          <h2 className="text-xl font-semibold">The past {d.pstats.days} days</h2>
          <div className="mt-3"><DailyBars stats={d.duo} label="across the US" /></div>
        </section>
        <Faq items={questions} title="Quick answers" />
        <div className="space-y-4">
          <Figure id="apple-store-glass-canopy" className="my-0" />
          <Figure id="phone-map" className="my-0" />
          <div className="pane p-5"><SourceList sources={[{ label: "Apple retail store list (official)", url: "https://www.apple.com/retail/storelist/" }, SALES_TAX_SOURCE]} facts={emptyFacts()} /></div>
        </div>
      </div>

      <RelatedBlock>
        <BrowsePopular />
        <LinkRow title="States with one or two stores" links={thin.map((n) => ({ href: statePath(n), label: n }))} />
        <BrowseModels />
        <LinkRow title="More" links={[{ href: "/restock-log", label: "Restock log" }, { href: "/live-map", label: "Live map" }, { href: "/phone-alerts", label: "Home Screen app" }, { href: "/how-restock-alerts-work", label: "How alerts work" }, { href: "/pricing", label: "Pricing" }, ...MODELS.map((m) => ({ href: `/in-stock/${m.slug}`, label: `${m.name}, live stock` }))]} />
      </RelatedBlock>
    </div>
  );
}

