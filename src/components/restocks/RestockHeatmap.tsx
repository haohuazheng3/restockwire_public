/**
 * "When does the iPhone Duo restock here? Weekday × hour": a 7 × 24 grid of confirmed restocks over the last 30 days,
 * each store counted in its own local time (lib/content/wire.ts, restockHeatmap). Cells are shaded on the brand's
 * amber ramp by count; the busiest cell is ringed and named; one sentence above says when most restocks land, under
 * the same thresholds as the restock-times module (5 restocks over 3 days for an hour, 14 days of span for a weekday).
 * Never empty: with nothing yet it still draws the empty grid under a one-line "not enough data yet".
 */
import type { Heatmap } from "@/lib/content/wire";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN } from "@/lib/content/siteFacts";
import { storeTimeZone, type Store } from "@/lib/apple/catalog";
import { t, pageLocale } from "@/lib/i18n/server";
import { weekdays } from "@/lib/i18n/format";
import { zoneName } from "@/components/stores/StoreInfo";
import { Measured } from "@/components/ui/Viz";
import { hourTick, hoursLabel, share } from "./wireFormat";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

/** The cell's fill: transparent at 0, then 18–100% of the accent by count against the busiest cell. */
export function heatShade(n: number, max: number): string | undefined {
  if (n <= 0 || max <= 0) return undefined;
  const k = Math.round(18 + (82 * n) / max);
  return `color-mix(in srgb, var(--accent) ${k}%, transparent)`;
}

export function RestockHeatmap({ data, label, what = "iPhone Duo", stores, id = "restock-heatmap", heading = "h2" }: {
  data: Heatmap;
  /** "in Ohio", "at Apple Somerset", "here". */
  label: string;
  /** The phone or configuration counted ("iPhone Duo", "iPhone Duo 512GB Night Sky"). */
  what?: string;
  /** The stores counted: one zone is named under the grid, several say "each store's own local time". */
  stores?: Store[];
  id?: string;
  heading?: "h2" | "h3";
}) {
  const w = t().wire.heatmap;
  const lang = pageLocale().lang;
  const days = weekdays(lang, "long");
  const short = weekdays(lang, "short");
  const max = Math.max(0, ...data.grid.flat());
  const zones = new Set((stores ?? []).map((s) => storeTimeZone(s)));
  const zone = zones.size === 1 ? zoneName([...zones][0], lang) : w.localTime;
  const H = heading;

  let lead: React.ReactNode;
  if (data.unknown) lead = w.unknown;
  else if (data.n === 0) lead = w.none(label, data.days);
  else if (!data.enough || !data.window) lead = w.thin(data.n, label, data.days, data.activeDays, PATTERN_MIN, PATTERN_MIN_DAYS);
  else if (data.peakWeekday != null) lead = w.pattern(label, days[data.peakWeekday], hoursLabel(lang, data.window.from, data.window.to), share(lang, data.window.share), data.n, data.days);
  else lead = w.patternHours(label, hoursLabel(lang, data.window.from, data.window.to), share(lang, data.window.share), data.n, data.spanDays);

  const peak = data.peak;
  return (
    <section id={id} className="pane p-5" aria-labelledby={`${id}-h`}>
      <H id={`${id}-h`} className="text-xl font-semibold">{w.title(what, label)}</H>
      <p className="mt-2 text-sm text-ink-2">{lead}</p>
      {!data.unknown && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] table-fixed border-separate border-spacing-[2px] text-[10px]">
            <caption className="sr-only">{w.caption(what, label, data.days)}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-10" />
                {HOURS.map((h) => <th key={h} scope="col" className="h-4 p-0 text-start font-normal text-ink-3" aria-label={hoursLabel(lang, h, h + 1)}>{hourTick(lang, h)}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.grid.map((row, d) => (
                <tr key={d}>
                  <th scope="row" className="pe-1 text-start font-medium text-ink-3" title={days[d]}>{short[d]}</th>
                  {row.map((n, h) => {
                    const top = peak != null && peak.weekday === d && peak.hour === h;
                    const text = w.cell(days[d], hoursLabel(lang, h, h + 1), n);
                    return (
                      <td key={h} title={text} aria-label={text} data-n={n}
                        className={`h-5 rounded-[3px] p-0 ${n ? "" : "bg-[var(--fill-1)]"} ${top ? "outline outline-2 outline-offset-[-1px] outline-ink" : ""}`}
                        style={n ? { background: heatShade(n, max) } : undefined} />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!data.unknown && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] text-ink-3">
          <span>{peak ? <b className="font-semibold text-ink">{w.busiest(days[peak.weekday], hoursLabel(lang, peak.hour, peak.hour + 1), peak.n)}</b> : null}{peak ? " · " : ""}{zone}</span>
          <span className="inline-flex items-center gap-1" aria-hidden>
            {w.legendFewer}
            {[1, 2, 3, 4].map((k) => <span key={k} className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: heatShade(k, 4) }} />)}
            {w.legendMore}
          </span>
        </div>
      )}
      <Measured title={w.measuredTitle}>{w.measured(PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN)}</Measured>
    </section>
  );
}
