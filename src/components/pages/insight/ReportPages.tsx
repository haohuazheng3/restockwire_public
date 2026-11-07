/**
 * Weekly restock reports: /restock-reports (the archive) and /restock-reports/{2026-w45} (one edition), per country and
 * language. An edition is the country's confirmed restock log for one Monday–Sunday week in its reference zone
 * (lib/content/insight.ts weekReport); a week gets an edition from REPORT_MIN_RESTOCKS restocks.
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
import { PART_INDEX, storeByNumber, storePath } from "@/lib/apple/catalog";
import { prefixOf, type Country } from "@/lib/apple/countries";
import { REPORT_MIN_RESTOCKS, reportWeeks, weekReport, type WeekReport } from "@/lib/content/insight";
import { alertHref } from "@/lib/seo/enrich";
import { dict } from "@/lib/i18n/dict";
import { pageLocale, t } from "@/lib/i18n/server";
import { englishLocale, pathInLocale, type Lang, type Locale } from "@/lib/i18n/locales";
import { appleStoreLabel, configLabel, countryLabel } from "@/lib/i18n/places";
import { num } from "@/lib/i18n/format";
import type { ReportView } from "@/lib/i18n/dict/en/insight";
import { ChipLinks, Keys, SITE, Section, Table, familyHreflang, familyUrl, otherCountries, pctIn, rangeIn, secsIn, td, rowTh, whereOf } from "./frame";

const loadWeeks = cache((cc: Country["cc"]) => reportWeeks(cc));
const loadWeek = cache((cc: Country["cc"], week: string) => weekReport(cc, week));

const storeName = (n: string, lang: Lang) => { const s = storeByNumber(n); return s ? (lang === "en" ? `Apple ${s.name}` : appleStoreLabel(s, lang)) : n; };
const partName = (p: string, lang: Lang) => { const i = PART_INDEX.get(p); return i ? configLabel(i, lang) : p; };

function viewOf(r: WeekReport, c: Country, lang: Lang): ReportView {
  const W = dict(lang).insight.reports.weekdays;
  const maxDay = r.byDay.reduce((a, n, i) => (n > r.byDay[a] ? i : a), 0);
  const minDay = r.byDay.reduce((a, n, i) => (n < r.byDay[a] ? i : a), 0);
  // A change only between two complete, fully tracked weeks (a running or launch week would mislead).
  const change = r.prev && r.prev.restocks > 0 && r.complete && !r.prevPartial && r.trackedDays === 7 ? (r.restocks - r.prev.restocks) / r.prev.restocks : null;
  const dir = change == null ? null : change > 0.15 ? "up" : change < -0.15 ? "down" : "flat";
  const signed = change == null ? null : `${change > 0 ? "+" : change < 0 ? "−" : ""}${pctIn(lang, Math.abs(change))}`;
  const top = r.topStores[0], tp = r.duoParts[0], lp = r.duoParts[r.duoParts.length - 1];
  return {
    w: whereOf(c, lang), range: rangeIn(lang, r.start, r.end), complete: r.complete, trackedDays: r.trackedDays,
    restocks: num(lang, r.restocks), stores: num(lang, r.stores), configs: num(lang, r.configs),
    duo: num(lang, r.byModel.duo), pro: num(lang, r.byModel["18-pro"]), proMax: num(lang, r.byModel["18-pro-max"]),
    topStore: top ? storeName(top.storeNumber, lang) : null, topStoreN: top ? num(lang, top.n) : null,
    topConfig: tp ? partName(tp.partNumber, lang) : null, topConfigN: tp ? num(lang, tp.n) : null,
    lastConfig: lp && r.duoParts.length > 1 ? partName(lp.partNumber, lang) : null,
    busiestDay: r.restocks ? W[maxDay] : null, busiestDayN: r.restocks ? num(lang, r.byDay[maxDay]) : null,
    quietDay: r.restocks && minDay !== maxDay ? W[minDay] : null,
    medianSell: r.sell.n >= 5 ? secsIn(lang, r.sell.medianSec) : null, within60: r.sell.n >= 5 ? pctIn(lang, r.sell.within60) : null, sellN: num(lang, r.sell.n),
    prevRestocks: r.prev ? num(lang, r.prev.restocks) : null, change: signed, changeDir: dir,
    prevMedianSell: r.prev ? secsIn(lang, r.prev.medianSec) : null,
  };
}

const homeOf = (c: Country, loc: Locale) => (loc.native ? `/${loc.id}` : prefixOf(c.cc) || "/");
const countryCrumb = (c: Country, lang: Lang) => (c.cc === "us" ? "RestockWire" : lang === "en" ? c.short : countryLabel(c.cc, lang));

/* ------------------------------------------------------------------------------------------ archive */

export async function reportsIndexMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const D = dict(loc.lang).insight.reports;
  const w = whereOf(c, loc.lang);
  const url = familyUrl("reports", loc);
  return {
    title: { absolute: `${D.indexTitle(w)} · RestockWire` }, description: D.indexMeta(w),
    alternates: { canonical: url, languages: familyHreflang("reports", loc) },
    openGraph: { type: "website", siteName: "RestockWire", title: D.indexTitle(w), description: D.indexMeta(w), url },
  };
}

export async function ReportsIndexPage({ country: c }: { country: Country }) {
  const loc = pageLocale();
  const lang = loc.lang;
  const D = t().insight;
  const R = D.reports;
  const w = whereOf(c, lang);
  const weeks = await loadWeeks(c.cc);
  const rows = await Promise.all(weeks.map(async (x) => ({ ...x, rep: await loadWeek(c.cc, x.week) })));
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <Breadcrumbs items={[{ href: homeOf(c, loc), label: countryCrumb(c, lang) }, { label: D.nav.reports }]} />
      <h1 className="display mt-2 text-3xl sm:text-5xl">{R.indexH1(w)}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{R.indexLead(w, rows.length)}</p>
      <Figure id="reports-delivery-boxes" eager />
      {rows.length > 0 && (
        <ul className="ios-list mt-6">
          {rows.map((x) => (
            <li key={x.week} className="ios-row">
              <Link href={familyUrl("reports", loc, `/${x.week}`)} className="flex items-center justify-between gap-3 px-4 py-3 text-[0.9375rem] font-medium text-ink">
                <span>{x.rep ? rangeIn(lang, x.rep.start, x.rep.end) : x.week}</span>
                <span className="text-sm font-normal text-ink-3">{R.indexRow("", num(lang, x.restocks), x.complete).replace(/^ · /, "")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <section className="pane mt-6 p-5 sm:p-7"><h2 className="text-xl font-bold">{D.nav.otherCountries}</h2><ChipLinks items={otherCountries("reports", loc)} /></section>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ edition */

export async function reportMetadata(c: Country, week: string, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const r = await loadWeek(c.cc, week);
  if (!r) return {};
  const D = dict(loc.lang).insight.reports;
  const v = viewOf(r, c, loc.lang);
  const url = familyUrl("reports", loc, `/${week}`);
  const thin = r.restocks < REPORT_MIN_RESTOCKS;
  return {
    title: { absolute: `${D.title(v.w, v.range)} · RestockWire` }, description: D.meta(v),
    alternates: { canonical: url },
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "article", siteName: "RestockWire", title: D.title(v.w, v.range), description: D.meta(v), url },
  };
}

export async function ReportPage({ country: c, week }: { country: Country; week: string }) {
  const loc = pageLocale();
  const lang = loc.lang;
  const r = (await loadWeek(c.cc, week))!;
  const D = t().insight;
  const R = D.reports;
  const v = viewOf(r, c, lang);
  const url = familyUrl("reports", loc, `/${week}`);
  const title = R.title(v.w, v.range);
  const weeks = (await loadWeeks(c.cc)).filter((x) => x.week !== week);
  const storeHref = (n: string) => { const s = storeByNumber(n); return s ? (loc.native ? pathInLocale(storePath(s), loc) : storePath(s)) : "#"; };
  const ld = {
    "@context": "https://schema.org", "@type": "Article", headline: title, url: `${SITE}${url}`,
    datePublished: `${r.start}T00:00:00Z`, dateModified: new Date().toISOString(),
    author: { "@type": "Organization", name: "RestockWire", url: SITE }, publisher: { "@type": "Organization", name: "RestockWire", url: SITE },
  };
  const dayMax = Math.max(1, ...r.byDay);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: homeOf(c, loc), label: countryCrumb(c, lang) }, { href: familyUrl("reports", loc), label: D.nav.reports }, { label: v.range }]} />
      <h1 className="display mt-2 text-3xl sm:text-5xl">{R.h1(v.w, v.range)}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{R.answer(v)}</p>
      {!r.complete && <p className="mt-2 text-sm text-ink-3">{R.running}</p>}
      {r.trackedDays < 7 && r.complete && <p className="mt-2 text-sm text-ink-3">{R.partial(r.trackedDays)}</p>}
      <StatGrid cols={4} className="mt-6">
        <Stat value={v.restocks} label={R.tiles.restocks} tone="accent" />
        <Stat value={v.stores} label={R.tiles.stores} />
        <Stat value={v.medianSell ?? "–"} label={R.tiles.sell} size="sm" />
        <Stat value={v.change ?? "–"} label={R.tiles.change} size="sm" tone={v.changeDir === "up" ? "ok" : v.changeDir === "down" ? "warn" : "plain"} />
      </StatGrid>

      <Section id="count" h2={R.countH2} lead={R.countLead(v)} />

      <Section id="stores" h2={R.storesH2} lead={R.storesLead(v)}>
        {r.topStores.length > 0 && (
          <Table head={R.storesHead}>
            {r.topStores.map((x, i) => (
              <tr key={x.storeNumber}>
                <td className={td}>{num(lang, i + 1)}</td>
                <th scope="row" className={rowTh}><Link href={storeHref(x.storeNumber)} className="hover:underline">{storeName(x.storeNumber, lang)}</Link></th>
                <td className={td}>{num(lang, x.n)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Figure id="reports-iphone-boxes" />

      <Section id="configs" h2={R.configsH2} lead={R.configsLead(v)}>
        {r.duoParts.length > 0 && (
          <Table head={R.configsHead}>
            {r.duoParts.map((x) => (
              <tr key={x.partNumber}><th scope="row" className={rowTh}>{partName(x.partNumber, lang)}</th><td className={td}>{num(lang, x.n)}</td></tr>
            ))}
          </Table>
        )}
      </Section>

      <Section id="sell" h2={R.sellH2} lead={`${R.sellLead(v)} ${R.sellPrev(v)}`.trim()} />

      <Section id="days" h2={R.daysH2} lead={R.daysLead(v)}>
        <Table head={R.daysHead}>
          {r.byDay.map((n, i) => (
            <tr key={i}>
              <th scope="row" className={rowTh}>{R.weekdays[i]}</th>
              <td className={td}><span className="inline-flex items-center gap-2"><span className="inline-block h-2 rounded-full bg-accent" style={{ width: `${Math.max(2, (n / dayMax) * 140)}px` }} aria-hidden />{num(lang, n)}</span></td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section id="prev" h2={R.prevH2} lead={R.prevLead(v)}>{!r.complete && <p className="mt-2 text-sm text-ink-3">{R.prevNote}</p>}</Section>
      <Section id="read" h2={R.readH2} lead={R.readPoints(v)[0]}><Keys items={R.readPoints(v).slice(1)} /></Section>
      <Section id="method" h2={R.methodH2} lead={R.methodPoints[0].replace(/\*\*/g, "")}><Keys items={R.methodPoints.slice(1)} /></Section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={alertHref({ model: "duo", country: c.cc })} className="btn btn-primary">{D.nav.alertCta}</Link>
        <Link href={`${homeOf(c, loc) === "/" ? "" : homeOf(c, loc)}/restock-log`} className="btn btn-ghost">{D.nav.logCta}</Link>
      </div>

      {weeks.length > 0 && (
        <section className="pane mt-6 p-5 sm:p-7">
          <h2 className="text-xl font-bold">{R.archiveH2}</h2>
          <ChipLinks items={weeks.map((x) => ({ href: familyUrl("reports", loc, `/${x.week}`), label: x.week.replace("-w", " · W") }))} />
        </section>
      )}
      <div className="mt-8"><RichFaq items={R.faq(v)} facts={emptyFacts(c.cc)} /></div>
      <p className="mt-6 text-sm text-ink-3">{D.nav.cite}</p>
    </div>
  );
}
