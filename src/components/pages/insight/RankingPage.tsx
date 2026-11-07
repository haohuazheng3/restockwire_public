/**
 * /fastest-selling-apple-stores and /{cc}/…: which Apple Stores sell out the iPhone Duo fastest (wire.ts selloutRanking,
 * STATS_DAYS), with each store's restock count — and, from the bottom of the table, where a buyer still has time.
 * Countries with five stores or more.
 */
import type { Metadata } from "next";
import { cache } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Related";
import { Figure } from "@/components/content/Figure";
import { RichFaq } from "@/components/content/RichFaq";
import { Stat, StatGrid } from "@/components/ui/Viz";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { emptyFacts } from "@/lib/content/facts";
import { storeByNumber, storePath } from "@/lib/apple/catalog";
import { prefixOf, type Country } from "@/lib/apple/countries";
import { selloutRanking } from "@/lib/content/wire";

/** This page ranks a store from 5 timed restocks (the wire module uses 3): one odd restock must not set either end. */
const PAGE_MIN_PAIRS = 5;
import { sellouts } from "@/lib/stock/sellouts";
import { storeWindows } from "@/lib/content/insight";
import { STATS_DAYS } from "@/lib/stock/window";
import { alertHref } from "@/lib/seo/enrich";
import { dict } from "@/lib/i18n/dict";
import { pageLocale, t } from "@/lib/i18n/server";
import { englishLocale, pathInLocale, type Lang, type Locale } from "@/lib/i18n/locales";
import { appleStoreLabel, countryLabel } from "@/lib/i18n/places";
import { num } from "@/lib/i18n/format";
import type { RankView } from "@/lib/i18n/dict/en/insight";
import { ChipLinks, Keys, SITE, Section, Table, familyHreflang, familyIn, familyUrl, otherCountries, secsIn, td, rowTh, whereOf } from "./frame";

const load = cache(async (cc: Country["cc"]) => {
  const [all, country] = await Promise.all([selloutRanking({ country: cc, model: "duo" }), sellouts({ country: cc, model: "duo" })]);
  const rank = { ...all, minPairs: PAGE_MIN_PAIRS, rows: all.rows.filter((r) => r.n >= PAGE_MIN_PAIRS) };
  const windows = await storeWindows(rank.rows.map((r) => r.storeNumber));
  return { rank, country, windows: new Map(windows.map((w) => [w.storeNumber, w])) };
});

const storeName = (n: string, lang: Lang) => { const s = storeByNumber(n); return s ? (lang === "en" ? `Apple ${s.name}` : appleStoreLabel(s, lang)) : n; };

async function viewOf(c: Country, lang: Lang): Promise<RankView> {
  const { rank, country } = await load(c.cc);
  const f = rank.rows[0], l = rank.rows.length > 1 ? rank.rows[rank.rows.length - 1] : undefined;
  return {
    w: whereOf(c, lang), days: num(lang, STATS_DAYS), ranked: num(lang, rank.rows.length), minPairs: num(lang, PAGE_MIN_PAIRS),
    fastest: f ? storeName(f.storeNumber, lang) : null, fastestSec: f ? secsIn(lang, f.medianSec) : null, fastestN: f ? num(lang, f.n) : null,
    slowest: l ? storeName(l.storeNumber, lang) : null, slowestSec: l ? secsIn(lang, l.medianSec) : null,
    spread: f && l ? secsIn(lang, l.medianSec - f.medianSec) : null,
    countryMedian: secsIn(lang, country.byModel.duo?.medianSec ?? country.summary.medianSec),
  };
}

export async function rankingMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const D = dict(loc.lang).insight.ranking;
  const v = await viewOf(c, loc.lang);
  const url = familyUrl("ranking", loc);
  return {
    title: { absolute: `${D.title(v.w)} · RestockWire` }, description: D.meta(v),
    alternates: { canonical: url, languages: familyHreflang("ranking", loc) },
    openGraph: { type: "article", siteName: "RestockWire", title: D.title(v.w), description: D.meta(v), url },
  };
}

export async function RankingPage({ country: c }: { country: Country }) {
  const loc = pageLocale();
  const lang = loc.lang;
  const D = t().insight;
  const K = D.ranking;
  const v = await viewOf(c, lang);
  const { rank, windows } = await load(c.cc);
  const url = familyUrl("ranking", loc);
  const title = K.title(v.w);
  const home = loc.native ? `/${loc.id}` : prefixOf(c.cc) || "/";
  const storeHref = (n: string) => { const s = storeByNumber(n); return s ? (loc.native ? pathInLocale(storePath(s), loc) : storePath(s)) : "#"; };
  const ld = {
    "@context": "https://schema.org", "@type": "ItemList", name: title, url: `${SITE}${url}`, numberOfItems: rank.rows.length,
    itemListElement: rank.rows.slice(0, 20).map((r, i) => ({ "@type": "ListItem", position: i + 1, name: storeName(r.storeNumber, lang), url: `${SITE}${storeHref(r.storeNumber)}` })),
  };
  const slow = [...rank.rows].reverse().slice(0, 5);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: home, label: c.cc === "us" ? "RestockWire" : lang === "en" ? c.short : countryLabel(c.cc, lang) }, { label: D.nav.fastest }]} />
      <h1 className="display mt-2 text-3xl sm:text-5xl">{K.h1(v.w)}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{K.answer(v)}</p>
      <StatGrid cols={4} className="mt-6">
        <Stat value={v.fastestSec ?? "–"} label={K.tiles.fastest} tone="accent" size="sm" />
        <Stat value={v.slowestSec ?? "–"} label={K.tiles.slowest} size="sm" />
        <Stat value={v.ranked} label={K.tiles.ranked} />
        <Stat value={v.countryMedian ?? "–"} label={K.tiles.country} size="sm" />
      </StatGrid>

      <Section id="fast" h2={K.fastH2} lead={K.fastLead(v)}>
        {rank.rows.length > 0 && (
          <Table head={K.head} min="34rem">
            {rank.rows.map((r, i) => (
              <tr key={r.storeNumber}>
                <td className={td}>{num(lang, i + 1)}</td>
                <th scope="row" className={rowTh}><Link href={storeHref(r.storeNumber)} className="hover:underline">{storeName(r.storeNumber, lang)}</Link></th>
                <td className={`${td} font-semibold`}>{secsIn(lang, r.medianSec)}</td>
                <td className={td}>{secsIn(lang, r.fastestSec)}</td>
                <td className={td}>{num(lang, r.n)}</td>
                <td className={td}>{num(lang, windows.get(r.storeNumber)?.restocks ?? 0)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Figure id="ranking-queue" />

      <Section id="slow" h2={K.slowH2} lead={K.slowLead(v)}>
        {slow.length > 1 && <ChipLinks items={slow.map((r) => ({ href: storeHref(r.storeNumber), label: `${storeName(r.storeNumber, lang)} · ${secsIn(lang, r.medianSec)}` }))} />}
      </Section>
      <Section id="means" h2={K.meansH2} lead={K.meansPoints(v)[0]}><Keys items={K.meansPoints(v).slice(1)} /></Section>
      <Figure id="ranking-checkout" />
      <Section id="method" h2={K.methodH2} lead={K.methodPoints(v)[0].replace(/\*\*/g, "")}><Keys items={K.methodPoints(v).slice(1)} /></Section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={alertHref({ model: "duo", country: c.cc })} className="btn btn-primary">{D.nav.alertCta}</Link>
        {familyIn("compare", c.cc) && <Link href={familyUrl("compare", loc)} className="btn btn-ghost">{D.nav.compare}</Link>}
      </div>
      <section className="pane mt-6 p-5 sm:p-7"><h2 className="text-xl font-bold">{D.nav.otherCountries}</h2><ChipLinks items={otherCountries("ranking", loc)} /></section>
      <div className="mt-8"><RichFaq items={K.faq(v)} facts={emptyFacts(c.cc)} /></div>
      <p className="mt-6 text-sm text-ink-3">{D.nav.cite}</p>
    </div>
  );
}
