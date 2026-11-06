/**
 * "Which stores sell out the iPhone Duo fastest here?": the place's stores ranked by the median time their restocks
 * stayed listed over the last 30 days (lib/content/wire.ts, selloutRanking — the pairing of lib/stock/sellouts.ts),
 * fastest first, each with its count of timed sell-outs; one sentence names the fastest and the slowest. Stores need
 * 3 timed sell-outs to be ranked; with fewer than two ranked stores it says "not enough data yet" in one line.
 */
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { SelloutRanking } from "@/lib/content/wire";
import { storeByNumber, storePath } from "@/lib/apple/catalog";
import { t, pageLocale } from "@/lib/i18n/server";
import { secs } from "@/lib/i18n/format";
import { Measured } from "@/components/ui/Viz";
import { storeName } from "./wireFormat";

export function SellOutRanking({ data, label, what = "iPhone Duo", storesTotal, limit = 12, id = "sellout-ranking", heading = "h2" }: {
  data: SelloutRanking;
  label: string;
  what?: string;
  /** Stores in the place, for "8 of 12 stores ranked". */
  storesTotal: number;
  limit?: number;
  id?: string;
  heading?: "h2" | "h3";
}) {
  const w = t().wire.ranking;
  const lang = pageLocale().lang;
  const H = heading;
  const rows = data.rows.filter((r) => storeByNumber(r.storeNumber));
  const link = (n: string) => { const s = storeByNumber(n)!; return <Link href={storePath(s)} className="underline-offset-2 hover:underline">{storeName(lang, s)}</Link>; };
  const ranked = rows.length >= 2;

  let lead: React.ReactNode;
  if (data.unknown) lead = w.unknown;
  else if (!ranked) lead = w.thin(label, rows.length, data.minPairs, data.days);
  else lead = w.lead({ label, fastest: link(rows[0].storeNumber), fastSec: secs(lang, rows[0].medianSec), slowest: link(rows[rows.length - 1].storeNumber), slowSec: secs(lang, rows[rows.length - 1].medianSec), days: data.days });

  const shown = rows.slice(0, limit);
  const slowest = Math.max(1, ...shown.map((r) => r.medianSec));
  return (
    <section id={id} className="pane p-5" aria-labelledby={`${id}-h`}>
      <H id={`${id}-h`} className="text-xl font-semibold">{w.title(what, label)}</H>
      <p className="mt-2 text-sm text-ink-2">{lead}</p>
      {!data.unknown && ranked && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <caption className="sr-only">{w.caption(what, label, data.days, data.minPairs)}</caption>
            <thead>
              <tr className="border-b border-line-2 text-start text-ink">
                <th scope="col" className="w-8 py-2 pe-2 font-semibold">{w.thRank}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thStore}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thMedian}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thFastest}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thPairs}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={r.storeNumber} className="border-b border-line">
                  <td className="num py-2 pe-2 text-ink-3">{i + 1}</td>
                  <th scope="row" className="py-2 pe-3 text-start font-medium text-ink">{link(r.storeNumber)}</th>
                  <td className="py-2 pe-3">
                    <span className="flex items-center gap-2">
                      <span className="num w-14 shrink-0 font-semibold text-ink">{secs(lang, r.medianSec)}</span>
                      <span className="hidden h-1.5 flex-1 sm:block" aria-hidden><span className={`block h-1.5 rounded-full ${i === 0 ? "bg-accent" : "bg-ink/25"}`} style={{ width: `${Math.max(4, (r.medianSec / slowest) * 100)}%` }} /></span>
                    </span>
                  </td>
                  <td className="num py-2 pe-3">{secs(lang, r.fastestSec)}</td>
                  <td className="num py-2 pe-3">{r.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-ink-3">{w.footnote(rows.length, storesTotal)}</p>
        </div>
      )}
      <Measured title={w.measuredTitle}>{w.measured(data.minPairs)}</Measured>
    </section>
  );
}
