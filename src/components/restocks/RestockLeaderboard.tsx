/**
 * "Which stores restocked the iPhone Duo most here? Last 7 days": the top stores by confirmed restocks with each one's
 * share of the place's restocks and a link to its page (lib/content/wire.ts, restockLeaderboard), plus — on a
 * country page — the same count by state or region. `limit` 5 gives the compact home-page version. Never empty:
 * with no restock it says so in one line.
 */
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Leaderboard } from "@/lib/content/wire";
import { hasStatePage, statePath, storeByNumber, storePath } from "@/lib/apple/catalog";
import type { CountryCode } from "@/lib/apple/countries";
import { t, pageLocale } from "@/lib/i18n/server";
import { regionLabel } from "@/lib/i18n/places";
import { Measured } from "@/components/ui/Viz";
import { share, storeName } from "./wireFormat";

export function RestockLeaderboard({ data, label, what = "iPhone Duo", limit = 10, regions, country = "us", id = "restock-leaderboard", heading = "h2" }: {
  data: Leaderboard;
  label: string;
  what?: string;
  limit?: number;
  /** The region noun ("state", "province") to add the by-region table; omitted on a place page. */
  regions?: string | null;
  country?: CountryCode;
  id?: string;
  heading?: "h2" | "h3";
}) {
  const w = t().wire.leaderboard;
  const lang = pageLocale().lang;
  const H = heading;
  const rows = data.rows.filter((r) => storeByNumber(r.storeNumber)).slice(0, limit);
  const link = (n: string) => { const s = storeByNumber(n)!; return <Link href={storePath(s)} className="underline-offset-2 hover:underline">{storeName(lang, s)}</Link>; };
  const top = rows[0];

  let lead: React.ReactNode;
  if (data.unknown) lead = w.unknown;
  else if (!top) lead = w.none(what, label, data.days);
  else lead = w.lead({ store: link(top.storeNumber), n: top.n, total: data.total, share: share(lang, top.share), label, days: data.days });

  const max = Math.max(1, ...rows.map((r) => r.n));
  const regionRows = regions ? data.regions.slice(0, limit) : [];
  const Bar = ({ n, first }: { n: number; first: boolean }) => <span className="hidden h-1.5 flex-1 sm:block" aria-hidden><span className={`block h-1.5 rounded-full ${first ? "bg-accent" : "bg-accent/40"}`} style={{ width: `${Math.max(4, (n / max) * 100)}%` }} /></span>;
  return (
    <section id={id} className="pane p-5" aria-labelledby={`${id}-h`}>
      <H id={`${id}-h`} className="text-xl font-semibold">{w.title(what, label, data.days)}</H>
      <p className="mt-2 text-sm text-ink-2">{lead}</p>
      {!data.unknown && top && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[26rem] border-collapse text-sm">
            <caption className="sr-only">{w.caption(what, label, data.days)}</caption>
            <thead>
              <tr className="border-b border-line-2 text-start text-ink">
                <th scope="col" className="w-8 py-2 pe-2 font-semibold">{w.thRank}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thStore}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thRestocks}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thShare}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.storeNumber} className="border-b border-line">
                  <td className="num py-2 pe-2 text-ink-3">{i + 1}</td>
                  <th scope="row" className="py-2 pe-3 text-start font-medium text-ink">{link(r.storeNumber)}</th>
                  <td className="py-2 pe-3"><span className="flex items-center gap-2"><span className="num w-8 shrink-0 font-semibold text-ink">{r.n}</span><Bar n={r.n} first={i === 0} /></span></td>
                  <td className="num py-2 pe-3">{share(lang, r.share)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-ink-3">{w.footnote(rows.length, data.stores, data.total)}</p>
        </div>
      )}
      {!data.unknown && regions && regionRows.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-ink">{w.regionsTitle(regions)}</h3>
          <table className="mt-2 w-full min-w-[26rem] border-collapse text-sm">
            <caption className="sr-only">{w.regionsCaption(what, label, data.days, regions)}</caption>
            <thead>
              <tr className="border-b border-line-2 text-start text-ink">
                <th scope="col" className="w-8 py-2 pe-2 font-semibold">{w.thRank}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thRegion(regions)}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thRestocks}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thStores}</th>
                <th scope="col" className="py-2 pe-3 font-semibold">{w.thShare}</th>
              </tr>
            </thead>
            <tbody>
              {regionRows.map((r, i) => {
                const name = regionLabel(country, r.region, lang);
                return (
                  <tr key={r.region} className="border-b border-line">
                    <td className="num py-2 pe-2 text-ink-3">{i + 1}</td>
                    <th scope="row" className="py-2 pe-3 text-start font-medium text-ink">{hasStatePage(r.region, country) ? <Link href={statePath(r.region, country)} className="underline-offset-2 hover:underline">{name}</Link> : name}</th>
                    <td className="num py-2 pe-3 font-semibold text-ink">{r.n}</td>
                    <td className="num py-2 pe-3">{r.stores}</td>
                    <td className="num py-2 pe-3">{share(lang, r.share)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Measured title={w.measuredTitle}>{w.measured(what)}</Measured>
    </section>
  );
}
