/**
 * /apple-pickup-status and /{cc}/apple-pickup-status: "Is Apple's in-store pickup check working right now?" — a live
 * verdict from RestockWire's own lookups (lib/content/insight.ts pickupStatus), the last 24 hours per hour, what a
 * stall looks like and what to do. Every country, English tree and native versions.
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
import { ALL_CODES, COUNTRIES, prefixOf, type Country } from "@/lib/apple/countries";
import { pickupStatus, type PickupStatus } from "@/lib/content/insight";
import { alertHref } from "@/lib/seo/enrich";
import { dict } from "@/lib/i18n/dict";
import { pageLocale, t } from "@/lib/i18n/server";
import { englishLocale, type Lang, type Locale } from "@/lib/i18n/locales";
import { countryLabel } from "@/lib/i18n/places";
import { LANG_TAG, num } from "@/lib/i18n/format";
import type { StatusView } from "@/lib/i18n/dict/en/insight";
import { ChipLinks, Keys, SITE, Section, Table, familyHreflang, familyIn, familyUrl, otherCountries, pctIn, secsIn, stampIn, td, rowTh, whereOf } from "./frame";

const load = cache((cc: Country["cc"]) => pickupStatus(cc));

function viewOf(s: PickupStatus, c: Country, lang: Lang): StatusView {
  const day = s.hours.reduce((a, h) => ({ r: a.r + h.requests, f: a.f + h.failures }), { r: 0, f: 0 });
  const hourFmt = new Intl.DateTimeFormat(LANG_TAG[lang], { timeZone: c.timeZone, hour: "numeric" });
  return {
    w: whereOf(c, lang), verdict: s.verdict,
    answered: num(lang, s.answered), stores: num(lang, s.stores), never: num(lang, s.never),
    age: secsIn(lang, s.medianAgeSec), oldest: secsIn(lang, s.oldestAgeSec),
    failLastHour: pctIn(lang, s.lastHour.requests ? s.lastHour.failures / s.lastHour.requests : 0, 1) ?? "0%",
    failDay: pctIn(lang, day.r ? day.f / day.r : 0, 1) ?? "0%",
    roughHours: s.rough.length, roughList: s.rough.slice(0, 6).map((h) => hourFmt.format(new Date(h.hour))).join(", "),
    updated: stampIn(lang, s.at, c),
  };
}

export async function statusMetadata(c: Country, loc: Locale = englishLocale(c.cc)): Promise<Metadata> {
  const D = dict(loc.lang).insight.status;
  const v = viewOf(await load(c.cc), c, loc.lang);
  const title = D.title(v.w);
  const url = familyUrl("status", loc);
  return {
    title: { absolute: `${title} · RestockWire` }, description: D.meta(v),
    alternates: { canonical: url, languages: familyHreflang("status", loc) },
    openGraph: { type: "article", siteName: "RestockWire", title, description: D.meta(v), url },
  };
}

const TONE = { ok: "ok", slow: "warn", down: "warn", unknown: "muted" } as const;

export async function StatusPage({ country: c }: { country: Country }) {
  const loc = pageLocale();
  const lang = loc.lang;
  const D = t().insight;
  const S = D.status;
  const s = await load(c.cc);
  const v = viewOf(s, c, lang);
  const others = await Promise.all(ALL_CODES.filter((k) => k !== c.cc).map(async (k) => ({ k, s: await load(k) })));
  const title = S.title(v.w);
  const url = familyUrl("status", loc);
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? c.timeZone;
  const hourFmt = new Intl.DateTimeFormat(LANG_TAG[lang], { timeZone: c.timeZone, hour: "numeric", day: "numeric", month: "short" });
  const faq = S.faq(v);
  const ld = {
    "@context": "https://schema.org", "@type": "WebPage", name: title, url: `${SITE}${url}`, dateModified: s.at,
    publisher: { "@type": "Organization", name: "RestockWire", url: SITE },
    about: { "@type": "Thing", name: "Apple Store in-store pickup availability" },
  };
  const homeHref = loc.native ? `/${loc.id}` : prefixOf(c.cc) || "/";
  return (
    <div className="mx-auto max-w-4xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: homeHref, label: c.cc === "us" ? "RestockWire" : lang === "en" ? c.short : countryLabel(c.cc, lang) }, { label: D.nav.status }]} />
      <h1 className="display mt-2 text-3xl sm:text-5xl">{S.h1(v.w)}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{S.answer(v)}</p>
      <p className="mt-2 text-sm text-ink-3">{D.nav.updated(v.updated)}</p>
      <StatGrid cols={4} className="mt-6">
        <Stat value={S.verdictWord(s.verdict)} label={`${v.answered}/${v.stores} · ${S.tiles.answered}`} tone={TONE[s.verdict]} size="sm" live={s.verdict === "ok"} />
        <Stat value={v.age ?? "–"} label={S.tiles.age} size="sm" />
        <Stat value={v.failLastHour} label={S.tiles.failHour} size="sm" tone={s.lastHour.requests && s.lastHour.failures / s.lastHour.requests >= 0.05 ? "warn" : "plain"} />
        <Stat value={v.failDay} label={S.tiles.failDay} size="sm" />
      </StatGrid>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={alertHref({ model: "duo", country: c.cc })} className="btn btn-primary">{D.nav.alertCta}</Link>
        <Link href={`${homeHref === "/" ? "" : homeHref}/restock-log`} className="btn btn-ghost">{D.nav.logCta}</Link>
      </div>

      <Section id="now" h2={S.nowH2} lead={S.nowLead(v)}><Keys items={S.nowPoints(v)} /></Section>

      <Section id="day" h2={S.dayH2} lead={S.dayLead(v)}>
        {s.hours.length > 0 && (
          <Table caption={S.hourCaption(zone)} head={S.hourHead}>
            {[...s.hours].reverse().map((h) => (
              <tr key={h.hour}>
                <th scope="row" className={rowTh}>{hourFmt.format(new Date(h.hour))}</th>
                <td className={td}>{num(lang, h.requests)}</td>
                <td className={td}>{num(lang, h.failures)}</td>
                <td className={`${td} ${h.requests && h.failures / h.requests >= 0.05 ? "font-semibold text-warn" : ""}`}>{pctIn(lang, h.requests ? h.failures / h.requests : 0, 1)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Figure id="status-store-counter" />

      <Section id="why" h2={S.whyH2} lead={S.whyLead}><Keys items={S.whyPoints} /></Section>
      <Section id="do" h2={S.doH2} lead={S.doLead}><Keys items={S.doSteps} /></Section>
      <Figure id="status-phone-check" />
      <Section id="method" h2={S.methodH2} lead={S.methodPoints[0].replace(/\*\*/g, "")}><Keys items={S.methodPoints.slice(1)} /></Section>

      <section className="pane mt-6 p-5 sm:p-7" aria-labelledby="other-h">
        <h2 id="other-h" className="text-2xl font-bold">{S.otherH2}</h2>
        <ul className="ios-list mt-4">
          {others.map(({ k, s: o }) => {
            const link = otherCountries("status", loc).find((l) => l.label === (lang === "en" ? COUNTRIES[k].short : countryLabel(k, lang)));
            return (
              <li key={k} className="ios-row flex items-center justify-between gap-3 px-4 py-2.5">
                <Link href={link?.href ?? "#"} className="text-[0.9375rem] font-medium text-ink hover:underline">{link?.label ?? k}</Link>
                <span className={`inline-flex items-center gap-2 text-sm ${o.verdict === "ok" ? "text-ok" : o.verdict === "unknown" ? "text-ink-3" : "text-warn"}`}><span className={`dot ${o.verdict === "ok" ? "dot-ok" : o.verdict === "unknown" ? "" : "dot-warn"}`} aria-hidden />{S.verdictWord(o.verdict)} · {num(lang, o.answered)}/{num(lang, o.stores)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-8"><RichFaq items={faq} facts={emptyFacts(c.cc)} /></div>
      <p className="mt-6 text-sm text-ink-3">{D.nav.cite}</p>
      <ChipLinks items={[{ href: familyUrl("reports", loc), label: D.nav.reports }, ...(familyIn("ranking", c.cc) ? [{ href: familyUrl("ranking", loc), label: D.nav.fastest }] : []), ...(familyIn("compare", c.cc) ? [{ href: familyUrl("compare", loc), label: D.nav.compare }] : [])]} />
    </div>
  );
}
