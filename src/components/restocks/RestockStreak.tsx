/**
 * "iPhone Duo restock streaks and droughts here": days since the last confirmed restock, the longest quiet spell of
 * the last 30 days, this week's count against last week's (↑/↓) and the typical gap between restock drops — four
 * tiles and one sentence (lib/content/wire.ts, restockStreak). The "since" is computed at render time from the cached
 * ISO stamp, so a five-minute cache never freezes it. Never empty: with no restock it says so in one line.
 */
import type { Streak } from "@/lib/content/wire";
import { streakFacts } from "@/lib/content/wire";
import { t, pageLocale } from "@/lib/i18n/server";
import { Measured, Stat, StatGrid } from "@/components/ui/Viz";
import { span } from "./wireFormat";

export function RestockStreak({ data, label, what = "iPhone Duo", id = "restock-streak", heading = "h2", now = new Date() }: {
  data: Streak;
  label: string;
  what?: string;
  id?: string;
  heading?: "h2" | "h3";
  /** Tests pin the clock. */
  now?: Date;
}) {
  const w = t().wire.streak;
  const lang = pageLocale().lang;
  const f = streakFacts(data, now);
  const H = heading;
  const since = f.sinceSec == null ? null : f.sinceSec < 3600 * 2 ? w.today : f.sinceDays === 0 ? w.hoursAgo(Math.floor(f.sinceSec / 3600)) : w.daysAgo(f.sinceDays!);
  const trend = f.trend === "up" ? w.up : f.trend === "down" ? w.down : f.trend === "flat" ? w.flat : null;
  const arrow = f.trend === "up" ? "↑" : f.trend === "down" ? "↓" : f.trend === "flat" ? "→" : undefined;

  let lead: React.ReactNode;
  if (data.unknown) lead = w.unknown;
  else if (data.n === 0 || since == null) lead = w.none(label, data.days);
  else lead = w.lead({ label, since, longest: data.maxGapSec != null ? span(lang, data.maxGapSec) : null, thisWeek: data.thisWeek, lastWeek: data.lastWeek, trend, days: data.days });

  return (
    <section id={id} className="pane p-5" aria-labelledby={`${id}-h`}>
      <H id={`${id}-h`} className="text-xl font-semibold">{w.title(what, label)}</H>
      <p className="mt-2 text-sm text-ink-2">{lead}</p>
      {!data.unknown && data.n > 0 && (
        <StatGrid cols={4} className="mt-3">
          <Stat size="sm" value={f.sinceSec != null ? span(lang, f.sinceSec) : w.none2} label={w.tileSince} tone={f.sinceSec != null && f.sinceSec < 86400 ? "accent" : "plain"} />
          <Stat size="sm" value={data.maxGapSec != null ? span(lang, data.maxGapSec) : w.none2} label={w.tileLongest(data.days)} tone={data.maxGapSec != null ? "warn" : "muted"} />
          <Stat value={data.thisWeek} unit={arrow} label={w.tileWeek(data.lastWeek)} tone={f.trend === "up" ? "ok" : "plain"} />
          <Stat size="sm" value={data.medianGapSec != null ? span(lang, data.medianGapSec) : w.none2} label={w.tileMedian} tone={data.medianGapSec != null ? "plain" : "muted"} />
        </StatGrid>
      )}
      <Measured title={w.measuredTitle}>{w.measured}</Measured>
    </section>
  );
}
