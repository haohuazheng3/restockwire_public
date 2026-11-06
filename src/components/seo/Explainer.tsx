import { PendingLink as Link } from "@/components/ui/PendingLink";
import { ALERT_RULE } from "@/lib/seo/enrich";
import { Points } from "@/components/ui/Viz";

/**
 * "How does in-store pickup work at {place}?": the fixed process as three keyword cards (where pickup stock is
 * sold, how often it is read, what the log feeds), place-interpolated, plus the one-line alert rule. The same
 * facts enrich.ts spells out as paragraphs (`explainer`), shown as key words.
 */
export function Explainer({ kind, place, alertHref }: { kind: "state" | "city" | "store" | "model"; place: string; alertHref: string }) {
  const title = kind === "model" ? `How does in-store pickup work for the ${place}?` : `How does in-store pickup work ${kind === "store" ? "at" : "in"} ${place}?`;
  const at = kind === "store" ? place : kind === "model" ? "each Apple Store in the US" : `Apple Stores in ${place}`;
  const cards: { title: string; items: { text: React.ReactNode; no?: boolean }[] }[] = [
    { title: "Pickup stock is sold on apple.com", items: [
      { text: <>Choose the store at checkout on <b className="text-ink">apple.com</b>, pay online</> },
      { text: <>Collect at the counter, often <b className="text-ink">the same day</b>: photo ID and the QR code</> },
      { text: <>Not shelf stock, not carrier stock</>, no: true },
    ] },
    { title: "Read every 15 seconds", items: [
      { text: <>Every configuration at {at}: <b className="text-ink">every 15 seconds</b></> },
      { text: <>Stores with an alert on them: <b className="text-ink">every 5</b></> },
      { text: <>A change counts after a <b className="text-ink">second</b> read agrees</> },
    ] },
    { title: "The log behind the charts", items: [
      { text: <>Every confirmed change feeds this page&apos;s <b className="text-ink">restock chart</b> and history</> },
      { text: <>First sightings are not restocks; a glitch never becomes one</> },
    ] },
  ];
  return (
    <section className="pane p-5 sm:p-6" aria-labelledby="explainer">
      <h2 id="explainer" className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {cards.map((c, i) => (
          <div key={c.title} className="pane-2 p-4">
            <div className="flex items-center gap-2"><span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-[var(--accent-ink)]">{i + 1}</span><h3 className="text-sm font-semibold text-ink">{c.title}</h3></div>
            <Points items={c.items} className="mt-2.5" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-2">{ALERT_RULE} <Link href={alertHref} className="font-medium text-ink underline">Put a store on the wire →</Link></p>
    </section>
  );
}
