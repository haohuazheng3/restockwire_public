/**
 * Store vs store: /compare-apple-stores (every pair of a country) and /compare-apple-stores/{a}-vs-{b}. Each pair is a
 * store and its nearest neighbour in the same city (insight.ts comparePairs): restocks and iPhone Duo restocks over
 * STATS_DAYS, the usual hour (siteFacts thresholds), the median listing time and the newest restock, side by side.
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
import { storePath, storeTimeZone, type Store } from "@/lib/apple/catalog";
import { prefixOf, type Country } from "@/lib/apple/countries";
import { comparePairs, findPair, storeWindows } from "@/lib/content/insight";
import { siteFacts } from "@/lib/content/siteFacts";
import { sellouts } from "@/lib/stock/sellouts";
import { STATS_DAYS } from "@/lib/stock/window";
import { alertHref } from "@/lib/seo/enrich";
import { dict } from "@/lib/i18n/dict";
import { pageLocale, t } from "@/lib/i18n/server";
import { englishLocale, pathInLocale, type Lang, type Locale } from "@/lib/i18n/locales";
import { appleStoreLabel, cityLabel, countryLabel } from "@/lib/i18n/places";
import { LANG_TAG, num } from "@/lib/i18n/format";
import type { CompareSide, CompareView } from "@/lib/i18n/dict/en/insight";
import { ChipLinks, Keys, SITE, Section, familyHreflang, familyUrl, hourIn, otherCountries, secsIn, whereOf } from "./frame";

const nameOf = (s: Store, lang: Lang) => (lang === "en" ? `Apple ${s.name}` : appleStoreLabel(s, lang));
const distanceIn = (km: number, c: Country, lang: Lang) => (c.unit === "mi" ? `${num(lang, Math.round(km * 0.621 * 10) / 10)} mi` : `${num(lang, km)} km`);

const loadPair = cache(async (cc: Country["cc"], slug: string) => {
  const p = findPair(cc, slug);
  if (!p) return null;
  const [facts, windows, sa, sb] = await Promise.all([siteFacts(), storeWindows([p.a.storeNumber, p.b.storeNumber]), sellouts({ storeNumbers: [p.a.storeNumber], model: "duo" }), sellouts({ storeNumbers: [p.b.storeNumber], model: "duo" })]);
  return { p, facts, windows: new Map(windows.map((w) => [w.storeNumber, w])), sell: { a: sa.byModel.duo ?? sa.summary, b: sb.byModel.duo ?? sb.summary } };
});

function side(s: Store, lang: Lang, d: NonNullable<Awaited<ReturnType<typeof loadPair>>>, which: "a" | "b"): CompareSide {
  const w = d.windows.get(s.storeNumber);
  const pat = d.facts.patterns[s.storeNumber];
  const sell = d.sell[which];
  const stamp = w?.lastAt ? new Intl.DateTimeFormat(LANG_TAG[lang], { timeZone: storeTimeZone(s), month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(w.lastAt)) : null;
  return {
    name: nameOf(s, lang), restocks: num(lang, w?.restocks ?? 0), duo: num(lang, w?.duoRestocks ?? 0),
    peak: pat?.peakHour != null ? hourIn(lang, pat.peakHour) : null,
    medianSell: sell.n >= 3 ? secsIn(lang, sell.medianSec) : null, sellN: num(lang, sell.n), last: stamp,
  };
}

function viewOf(c: Country, lang: Lang, d: NonNullable<Awaited<ReturnType<typeof loadPair>>>): CompareView {
  const a = side(d.p.a, lang, d, "a"), b = side(d.p.b, lang, d, "b");
  const ra = d.windows.get(d.p.a.storeNumber)?.restocks ?? 0, rb = d.windows.get(d.p.b.storeNumber)?.restocks ?? 0;
  const sa = d.sell.a, sb = d.sell.b;
  // A "lasts longer" verdict only from 5+ timed restocks on each side and a gap of 15 % or more; anything less is noise.
  const solid = sa.n >= 5 && sb.n >= 5 && sa.medianSec != null && sb.medianSec != null && Math.abs(sa.medianSec - sb.medianSec) / Math.max(1, Math.min(sa.medianSec, sb.medianSec)) >= 0.15;
  const slower = solid ? (sa.medianSec! > sb.medianSec! ? "a" : "b") : null;
  const hi = Math.max(ra, rb), lo = Math.min(ra, rb);
  return {
    w: whereOf(c, lang), city: cityLabel(c.cc, d.p.a.city, lang), a, b, distance: distanceIn(d.p.km, c, lang), days: num(lang, STATS_DAYS),
    more: ra === rb ? "tie" : ra > rb ? "a" : "b", slower,
    ratio: lo > 0 && hi / lo >= 1.2 ? `${num(lang, Math.round((hi / lo) * 10) / 10)}×` : null,
  };
}

const home = (c: Country, loc: Locale) => (loc.native ? `/${loc.id}` : prefixOf(c.cc) || "/");
const crumb = (c: Country, lang: Lang) => (c.cc === "us" ? "RestockWire" : lang === "en" ? c.short : countryLabel(c.cc, lang));
const storeUrl = (s: Store, loc: Locale) => (loc.native ? pathInLocale(storePath(s), loc) : storePath(s));

/* ------------------------------------------------------------------------------------------ index */

export async function compareIndexMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const D = dict(loc.lang).insight.compare;
  const w = whereOf(c, loc.lang);
  const url = familyUrl("compare", loc);
  return {
    title: { absolute: `${D.indexTitle(w)} · RestockWire` }, description: D.indexMeta(w),
    alternates: { canonical: url, languages: familyHreflang("compare", loc) },
    openGraph: { type: "website", siteName: "RestockWire", title: D.indexTitle(w), description: D.indexMeta(w), url },
  };
}

export async function CompareIndexPage({ country: c }: { country: Country }) {
  const loc = pageLocale();
  const lang = loc.lang;
  const D = t().insight;
  const pairs = comparePairs(c.cc);
  const byCity = new Map<string, typeof pairs>();
  for (const p of pairs) byCity.set(p.a.city, [...(byCity.get(p.a.city) ?? []), p]);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <Breadcrumbs items={[{ href: home(c, loc), label: crumb(c, lang) }, { label: D.nav.compare }]} />
      <h1 className="display mt-2 text-3xl sm:text-5xl">{D.compare.indexH1(whereOf(c, lang))}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{D.compare.indexLead(num(lang, pairs.length))}</p>
      <Figure id="compare-two-stores" eager />
      {[...byCity.entries()].sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0])).map(([city, list]) => (
        <section key={city} className="mt-6">
          <h2 className="mb-2 ps-1 text-[0.8125rem] font-semibold text-ink-3">{cityLabel(c.cc, city, lang)}</h2>
          <ul className="ios-list">
            {list.map((p) => (
              <li key={p.slug} className="ios-row">
                <Link href={familyUrl("compare", loc, `/${p.slug}`)} className="flex items-center justify-between gap-3 px-4 py-3 text-[0.9375rem] font-medium text-ink">
                  <span>{nameOf(p.a, lang)} · {nameOf(p.b, lang)}</span>
                  <span className="shrink-0 text-sm font-normal text-ink-3">{distanceIn(p.km, c, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="pane mt-6 p-5 sm:p-7"><h2 className="text-xl font-bold">{D.nav.otherCountries}</h2><ChipLinks items={otherCountries("compare", loc)} /></section>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ one pair */

export async function compareMetadata(c: Country, slug: string, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const d = await loadPair(c.cc, slug);
  if (!d) return {};
  const D = dict(loc.lang).insight.compare;
  const v = viewOf(c, loc.lang, d);
  const url = familyUrl("compare", loc, `/${slug}`);
  return {
    title: { absolute: `${D.title(v.a.name, v.b.name)} · RestockWire` }, description: D.meta(v),
    alternates: { canonical: url },
    openGraph: { type: "article", siteName: "RestockWire", title: D.title(v.a.name, v.b.name), description: D.meta(v), url },
  };
}

export async function ComparePage({ country: c, slug }: { country: Country; slug: string }) {
  const loc = pageLocale();
  const lang = loc.lang;
  const d = (await loadPair(c.cc, slug))!;
  const D = t().insight;
  const K = D.compare;
  const v = viewOf(c, lang, d);
  const url = familyUrl("compare", loc, `/${slug}`);
  const title = K.title(v.a.name, v.b.name);
  const others = comparePairs(c.cc).filter((p) => p.slug !== slug && p.a.city === d.p.a.city);
  const ld = { "@context": "https://schema.org", "@type": "WebPage", name: title, url: `${SITE}${url}`, dateModified: new Date().toISOString(), publisher: { "@type": "Organization", name: "RestockWire", url: SITE } };
  const rows: [string, string | null, string | null][] = [
    [K.rows.restocks, v.a.restocks, v.b.restocks],
    [K.rows.duo, v.a.duo, v.b.duo],
    [K.rows.peak, v.a.peak, v.b.peak],
    [K.rows.sell, v.a.medianSell, v.b.medianSell],
    [K.rows.sellN, v.a.sellN, v.b.sellN],
    [K.rows.last, v.a.last, v.b.last],
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: home(c, loc), label: crumb(c, lang) }, { href: familyUrl("compare", loc), label: D.nav.compare }, { label: `${v.a.name} · ${v.b.name}` }]} />
      <h1 className="display mt-2 text-3xl sm:text-5xl">{K.h1(v.a.name, v.b.name)}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{K.answer(v)}</p>
      <StatGrid cols={2} className="mt-6">
        <Stat value={v.a.restocks} label={`${v.a.name} · ${K.rows.restocks}`} tone={v.more === "a" ? "accent" : "plain"} />
        <Stat value={v.b.restocks} label={`${v.b.name} · ${K.rows.restocks}`} tone={v.more === "b" ? "accent" : "plain"} />
      </StatGrid>

      <section className="pane mt-6 overflow-hidden" aria-label={K.tableCaption(v.days)}>
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-line px-5 py-3 text-sm font-semibold text-ink">
          <span className="text-ink-3">{K.tableCaption(v.days)}</span>
          <Link href={storeUrl(d.p.a, loc)} className="truncate hover:underline">{v.a.name}</Link>
          <Link href={storeUrl(d.p.b, loc)} className="truncate hover:underline">{v.b.name}</Link>
        </div>
        {rows.map(([label, x, y]) => (
          <div key={label} className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-line px-5 py-2.5 text-sm last:border-0">
            <span className="text-ink-3">{label}</span>
            <span className="tabular-nums text-ink">{x ?? K.none}</span>
            <span className="tabular-nums text-ink">{y ?? K.none}</span>
          </div>
        ))}
      </section>

      <Section id="more" h2={K.moreH2} lead={K.moreLead(v)} />
      <Section id="hour" h2={K.hourH2} lead={K.hourLead(v)} />
      <Figure id="compare-pickup-bag" />
      <Section id="sell" h2={K.sellH2} lead={K.sellLead(v)} />
      <Section id="pick" h2={K.pickH2} lead={K.pickPoints(v)[0]}><Keys items={K.pickPoints(v).slice(1)} /></Section>
      <Section id="method" h2={K.methodH2} lead={K.methodPoints(v)[0]}><Keys items={K.methodPoints(v).slice(1)} /></Section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={alertHref({ model: "duo", store: d.p.a.storeNumber, country: c.cc })} className="btn btn-primary">{D.nav.alertCta}</Link>
      </div>
      <section className="pane mt-6 p-5 sm:p-7">
        <h2 className="text-xl font-bold">{K.storePages}</h2>
        <ChipLinks items={[{ href: storeUrl(d.p.a, loc), label: v.a.name }, { href: storeUrl(d.p.b, loc), label: v.b.name }]} />
        {others.length > 0 && (<><h2 className="mt-4 text-xl font-bold">{K.otherPairs}</h2><ChipLinks items={others.map((p) => ({ href: familyUrl("compare", loc, `/${p.slug}`), label: `${nameOf(p.a, lang)} · ${nameOf(p.b, lang)}` }))} /></>)}
      </section>
      <div className="mt-8"><RichFaq items={K.faq(v)} facts={emptyFacts(c.cc)} /></div>
    </div>
  );
}
