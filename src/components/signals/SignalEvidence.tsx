import { PendingLink as Link } from "@/components/ui/PendingLink";
import { pickupStatus, FRESH_SEC } from "@/lib/content/insight";
import { weekendSample } from "@/lib/content/signalData";
import { sellouts, fmtLife } from "@/lib/stock/sellouts";
import { PART_INDEX, STORE_INDEX, storePath } from "@/lib/apple/catalog";
import type { SignalGuide } from "@/content/signals/guides";
import styles from "./styles";
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const stamp = (date: string | Date) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" }).format(new Date(date)) + " UTC";
const age = (seconds: number | null) => seconds === null ? "Unknown" : `${Math.max(0, seconds).toLocaleString("en-US")} seconds`;
export async function SignalEvidence({ kind }: { kind: SignalGuide["evidence"] }) {
  if (kind === "weekends") {
    const sample = await weekendSample();
    return <section id="evidence" className={styles.evidence} aria-labelledby="evidence-title"><p className={styles.label}>Observed evidence · US · iPhone Duo</p><h2 id="evidence-title">Pickup changes by store-local weekday</h2>
      {!sample ? <p>The observation sample is unavailable. No weekday counts are inferred from missing data. Check back or open the current stock pages.</p> : <>
        <p>Rolling 14-day window · sampled <time dateTime={sample.at}>{stamp(sample.at)}</time> · cached up to 5 minutes.</p>
        <div className={styles.tableWrap}><table><caption>Confirmed store-configuration restocks, excluding first sightings. Counts are not units, shipments or probabilities.</caption><thead><tr><th scope="col">Local weekday</th><th scope="col">Events</th><th scope="col">Dates with events</th></tr></thead><tbody>{[1, 2, 3, 4, 5, 6, 0].map((day) => { const r = sample.rows[day]; return <tr key={day}><th scope="row">{weekdays[day]}</th><td>{r.events.toLocaleString("en-US")}</td><td>{r.dates}</td></tr>; })}</tbody></table></div>
        <p className={styles.note}>{sample.first && sample.last ? `Included events span ${stamp(sample.first)} to ${stamp(sample.last)}. ` : "No qualifying events in the available window. "}A date counts when at least one event occurred; it does not establish full-day monitoring. Today is incomplete. Raw counts do not rank the best day to buy.</p>
      </>}<Link href="/restock-reports">Read the dated weekly reports →</Link></section>;
  }
  if (kind === "checkout") {
    const result = await sellouts({ country: "us", model: "duo", days: 14, limit: 40 });
    const closed = result.recent.filter((r) => r.lowSec !== null && r.highSec !== null).slice(0, 5);
    return <section id="evidence" className={styles.evidence} aria-labelledby="evidence-title"><p className={styles.label}>Observed evidence · US · iPhone Duo</p><h2 id="evidence-title">Recent listing windows that closed</h2><p>A sample from the last 14 days. Durations run from the first positive observation to the recorded disappearance bounds; they do not measure individual checkout time.</p>
      {closed.length ? <div className={styles.tableWrap}><table><caption>Up to five closed listings among the 40 most recent restock records. Open listings are excluded.</caption><thead><tr><th scope="col">Store / configuration</th><th scope="col">First observed (UTC)</th><th scope="col">Disappearance interval</th></tr></thead><tbody>{closed.map((r) => { const s = STORE_INDEX.get(r.storeNumber); const item = PART_INDEX.get(r.partNumber); return <tr key={r.id}><th scope="row">{s ? <Link href={storePath(s)}>{s.name}</Link> : r.storeNumber}<span>{item ? `${item.storage} · ${item.color}` : r.partNumber}</span></th><td><time dateTime={new Date(r.at).toISOString()}>{stamp(r.at)}</time></td><td>{fmtLife(r.lowSec!, r.highSec!)}<span>{r.exact ? "Two recorded bounds" : "Lower bound estimated"}</span></td></tr>; })}</tbody></table></div> : <p>No closed listing sample is currently available. This is not evidence that nothing sold out; a missing or open sample cannot establish that.</p>}
      <p className={styles.note}>Listings missed between checks are absent. The end of a listing does not reveal how many devices sold. The underlying observation query is cached for up to a minute.</p><Link href="/how-fast-does-iphone-duo-sell-out">Explore the listing-duration analysis →</Link></section>;
  }
  const sample = await pickupStatus("us");
  return <section id="evidence" className={styles.evidence} aria-labelledby="evidence-title"><p className={styles.label}>Source freshness · US stores · all tracked models</p><h2 id="evidence-title">How old is the newest check at each store?</h2>
    {sample.unknown ? <p>The freshness sample is unavailable. This does not mean zero stock or zero delay. The article remains usable while the live sample recovers.</p> : <>
      <p>Sampled <time dateTime={sample.at}>{stamp(sample.at)}</time>. Cached up to 30 seconds; these are ages at that sample time.</p>
      <dl className={styles.metrics}><div><dt>Stores checked within {FRESH_SEC}s</dt><dd>{sample.answered} / {sample.stores}</dd></div><div><dt>Median newest-check age</dt><dd>{age(sample.medianAgeSec)}</dd></div><div><dt>Oldest newest-check age</dt><dd>{age(sample.oldestAgeSec)}</dd></div><div><dt>Stores with no recorded check</dt><dd>{sample.never}</dd></div></dl>
    </>}
    <p className={styles.note}>{kind === "delay" ? "This measures observation age, not notification delivery time. " : "This is a freshness summary, not a measured accuracy score. "}The newest check per store can hide older individual configurations. No account, order or device-delivery records are queried.</p><Link href="/apple-pickup-status">Open the fuller pickup status report →</Link></section>;
}
