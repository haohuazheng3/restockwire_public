/**
 * "On the wire · iPhone Duo {here}": the bulletin a place page opens with (lib/content/wireNow.ts says why and where).
 * The wire's order: the newest listing first → what is listed at this moment → four 14-day tiles → the dated method
 * line → one quotable paragraph → the last three listings as a grouped list → alerts pushed. Server component; every
 * number comes from `WireNow`, every string from the dictionary (12 languages). Apple-style tiles and grouped rows
 * (Viz.Stat, .ios-row), never a card grid.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { PART_INDEX, storeByNumber, storePath, storeTimeZone, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import type { WireListing, WireNow as WireNowData } from "@/lib/content/wireNow";
import { t, pageLocale } from "@/lib/i18n/server";
import { clock, day, num, stamp } from "@/lib/i18n/format";
import { appleStoreLabel, configLabel } from "@/lib/i18n/places";
import type { Lang } from "@/lib/i18n/locales";
import { Stat, StatGrid } from "@/components/ui/Viz";
import { Swatch } from "@/components/stores/ConfigTable";

export interface WireNowProps {
  d: WireNowData;
  /** The place phrase with its preposition: "in Michigan", "in the UK", "at Apple Somerset". */
  label: string;
  /** The bare name: "Michigan", "Apple Somerset". */
  name: string;
  /** One store (a store page): sentences count configurations, not stores. */
  one?: boolean;
  stores: Store[];
  country?: CountryCode;
  /** The place's restock-hour page, when it has one. */
  restockTimesHref?: string | null;
  alertHref?: string;
}

/* ---------------------------------------------------------------- formats */

function stampIn(iso: string, tz: string, lang: Lang): string {
  if (lang !== "en") return stamp(lang, iso, tz, true);
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
}
const N = (n: number, lang: Lang) => (lang === "en" ? n.toLocaleString("en-US") : num(lang, n));
const pct = (x: number) => `${Math.round(x * 100)}%`;

type Units = { secs: (n: number) => string; mins: (n: number) => string };
/** "45 s", "7 min", "1 h 10 min": a lifetime, through the dictionary's units. */
function dur(sec: number, u: Units): string {
  if (sec < 100) return u.secs(Math.max(1, Math.round(sec)));
  if (sec < 5400) return u.mins(Math.round(sec / 60));
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return m ? `${h} h ${u.mins(m)}` : `${h} h`;
}
/** "about 75 seconds" / "about 3 minutes" in the English paragraph; other languages use their own units. */
function about(sec: number, lang: Lang, u: Units): string {
  if (lang !== "en") return dur(sec, u);
  if (sec < 100) return `about ${Math.max(5, Math.round(sec / 5) * 5)} seconds`;
  if (sec < 3600) return `about ${Math.round(sec / 60)} minutes`;
  return `about ${(sec / 3600).toFixed(1)} hours`;
}
function lifetime(r: WireListing, w: Units & { upRange: (a: string, b: string) => string; upAbout: (x: string) => string; stillUp: (x: string) => string }): string | null {
  if (r.upSec != null) return w.stillUp(dur(r.upSec, w));
  if (r.highSec == null) return null;
  const low = r.lowSec ?? 0;
  const a = dur(low, w), b = dur(r.highSec, w);
  return a === b || low === 0 ? w.upAbout(b) : w.upRange(a, b);
}

/* ---------------------------------------------------------------- component */

export function WireNow({ d, label, name, one = false, stores, country = "us", restockTimesHref, alertHref }: WireNowProps) {
  const lang = pageLocale().lang;
  const w = t().modules.wireNow;
  const F = t().views.restockTimes.fmt;
  const checkNote = t().pages.common.checkNote;
  const byNumber = new Map(stores.map((s) => [s.storeNumber, s]));
  const storeOf = (n: string) => byNumber.get(n) ?? storeByNumber(n);
  const storeLink = (n: string): ReactNode => { const s = storeOf(n); return s ? <Link href={storePath(s)} className="font-medium text-accent underline-offset-2 hover:underline">{appleStoreLabel(s, lang)}</Link> : n; };
  const cfg = (p: string) => { const i = PART_INDEX.get(p); return i ? configLabel(i, lang) : p; };
  const colorOf = (p: string) => PART_INDEX.get(p)?.color ?? "";
  // One zone: stamps in it; a country across zones: its reference zone (store-level times use the store's own zone).
  const tz = d.zones.length === 1 ? d.zones[0] : COUNTRIES[country].timeZone;
  const tzOf = (n: string) => { const s = storeOf(n); return s ? storeTimeZone(s) : tz; };
  const nowStamp = stampIn(d.checkedAt ?? d.at, tz, lang);

  /* 1. the wire line: the newest listing */
  const last = d.last;
  const wireLine: ReactNode = last
    ? w.lastUp({ config: cfg(last.partNumber), store: one ? null : storeLink(last.storeNumber), when: stampIn(last.at, tzOf(last.storeNumber), lang), up: lifetime(last, w) })
    : w.neverYet(label, d.days);

  /* 2. this moment */
  let verdict: ReactNode;
  if (d.listed.length === 0) verdict = one ? w.nothingOne({ stamp: nowStamp, name }) : w.nothing({ stamp: nowStamp, n: d.storesTotal, label });
  else if (one) {
    const parts = d.listed[0].parts;
    const list = parts.slice(0, 8).map((p, i) => <span key={p}>{i ? ", " : ""}{w.configItem(cfg(p))}</span>);
    verdict = w.listedOne({ stamp: nowStamp, k: d.listed[0].configs, total: d.configsTotal, name, list });
  } else {
    const shown = d.listed.slice(0, 5);
    const list = <>{shown.map((x, i) => <span key={x.storeNumber}>{i ? ", " : ""}{w.storeItem(storeLink(x.storeNumber), x.configs)}</span>)}{d.listed.length > shown.length ? ` +${d.listed.length - shown.length}` : ""}</>;
    verdict = w.listed({ stamp: nowStamp, k: d.listed.length, n: d.storesTotal, label, list });
  }
  const others = w.others({ pro: d.others.pro, max: d.others.max, one, configs: 16 });

  /* 3. tiles (14-day window) */
  const range = F.range(d.window.from, d.window.to);
  const todayTile = <Stat key="today" value={N(d.today, lang)} label={w.tToday} tone="muted" />;
  const tiles: ReactNode[] = [<Stat key="n" value={N(d.n, lang)} label={w.tRestocks(d.days)} tone="accent" />];
  if (d.within60 != null) tiles.push(<Stat key="gone" value={pct(d.within60)} label={w.tGone60} tone="warn" />);
  else if (!one && d.restockStores > 0) tiles.push(<Stat key="stores" value={N(d.restockStores, lang)} label={w.tStores(d.storesTotal)} />);
  if (d.longest7dSec != null) tiles.push(<Stat key="longest" value={d.longest7dSec < 100 ? N(Math.round(d.longest7dSec), lang) : N(Math.round(d.longest7dSec / 60), lang)} unit={d.longest7dSec < 100 ? "s" : "min"} label={w.tLongest} />);
  if (d.pattern) tiles.push(<Stat key="window" value={pct(d.window.share)} label={w.tWindow(range)} />);
  if (tiles.length < 4) tiles.push(todayTile);
  const cols = (tiles.length >= 4 ? 4 : tiles.length === 3 ? 3 : 2) as 2 | 3 | 4;

  /* 5. the quotable paragraph */
  const busiest = d.peakHour != null ? F.range(d.peakHour, d.peakHour + 1) : null;
  const median = d.medianSec != null ? about(d.medianSec, lang, w) : null;
  const summary: string | null = d.unknown
    ? w.unknown
    : d.pattern && busiest
      ? w.summary({ range, zone: w.zone(d.zones.length === 1 ? d.zones[0] : null), pct: pct(d.window.share), n: d.n, stores: d.storesTotal, label, days: d.days, busiest, busiestN: d.peakCount, config: d.topPart ? cfg(d.topPart.partNumber) : null, k: d.topPart?.restocks ?? 0, median, one })
      : d.n > 0 ? w.tooFew({ n: d.n, label, days: d.days, one, stores: d.storesTotal }) : null;

  // Freshness for crawlers and answer engines: dateModified = the newest read, with the dataset the bulletin states.
  const since = new Date(Date.parse(d.at) - d.days * 86400_000).toISOString().slice(0, 10);
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    dateModified: d.checkedAt ?? d.at,
    mainEntity: {
      "@type": "Dataset",
      name: w.eyebrow(label),
      description: summary ?? plainText(wireLine),
      temporalCoverage: `${since}/${d.at.slice(0, 10)}`,
      creator: { "@type": "Organization", name: "RestockWire", url: "https://restockwire.com" },
      isAccessibleForFree: true,
      variableMeasured: ["in-store pickup listing per store and configuration", "restocks confirmed by two agreeing reads", "seconds a listing stayed up"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <section className="pane p-5 sm:p-6" aria-label={w.eyebrow(label)} data-block="wire-now">
        <p className="eyebrow inline-flex items-center gap-2"><span className="dot dot-ok dot-live" aria-hidden /> {w.eyebrow(label)}</p>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-ink">{wireLine}</p>
        <p className="mt-1 max-w-3xl leading-relaxed text-ink-2">{verdict} {others}</p>
        {tiles.length > 0 && <StatGrid cols={cols} className="mt-4">{tiles}</StatGrid>}
        <p className="mt-3 text-xs text-ink-3">
          <time dateTime={d.checkedAt ?? d.at}>{w.wireTime(nowStamp)}</time> · {w.reads(checkNote)} · {w.window(d.days)} · {w.method}
        </p>
        {summary && (
          <p className="mt-4 max-w-3xl leading-relaxed text-ink-2">
            {summary}
            {restockTimesHref && <> <Link href={restockTimesHref} className="font-medium text-accent underline-offset-2 hover:underline">{w.hourByHour}</Link></>}
          </p>
        )}
        {d.lastThree.length > 0 && (
          <div className="mt-4">
            <h3 className="eyebrow">{w.lastThree(d.lastThree.length, label)}</h3>
            <ol className="ios-list mt-2">
              {d.lastThree.map((r) => {
                const life = lifetime(r, w);
                const z = tzOf(r.storeNumber);
                return (
                  <li key={`${r.storeNumber}-${r.partNumber}-${r.at}`} className="ios-row flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="flex w-9 shrink-0 justify-center"><Swatch color={colorOf(r.partNumber)} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{cfg(r.partNumber)}{!one && storeOf(r.storeNumber) ? <> · {storeLink(r.storeNumber)}</> : null}</span>
                      {life && <span className="block text-xs text-ink-3">{life}</span>}
                    </span>
                    <time dateTime={r.at} className="shrink-0 text-end tabular-nums text-ink-2"><span className="block">{clock(lang, r.at, z)}</span><span className="block text-xs text-ink-3">{day(lang, r.at, z)}</span></time>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        {(d.alerts && d.alerts.sent > 0) || alertHref ? (
          <p className="mt-3 text-sm text-ink-2">
            {d.alerts && d.alerts.sent > 0 ? w.alerts({ sent: d.alerts.sent, stores: d.alerts.stores, total: d.storesTotal, days: d.alerts.days, label, one }) : null}
            {alertHref && <> <Link href={alertHref} className="font-medium text-accent underline-offset-2 hover:underline">{w.alertMe(name)} →</Link></>}
          </p>
        ) : null}
      </section>
    </>
  );
}

/** The sentence as plain text for the Dataset description (strings and the text of simple elements). */
function plainText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (typeof node === "object" && "props" in node) return plainText((node as { props: { children?: ReactNode } }).props.children);
  return "";
}
