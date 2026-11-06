import { PendingLink as Link } from "@/components/ui/PendingLink";
import { SPEED } from "@/lib/plans";
import { alertHref } from "@/lib/seo/enrich";

/** The closing call to the alerts flow: the alert link opens the setup in place (AlertLinkHost); pricing for the plans. */
export function BlogCta() {
  return (
    <section className="pane p-5 sm:p-7" aria-labelledby="cta-h">
      <div className="eyebrow">Alerts</div>
      <h2 id="cta-h" className="display mt-2 text-2xl sm:text-3xl">Reading about restocks is slower than hearing about one.</h2>
      <p className="mt-3 max-w-2xl text-ink-2">Your stores are checked every {SPEED.fastSec} seconds, every other store every {SPEED.checkSec}. A confirmed restock reaches your phone in about {SPEED.alertSec} seconds, with the store and the exact configuration in the title.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={alertHref({ model: "duo" })} className="btn btn-primary">Set up an alert</Link>
        <Link href="/pricing" className="btn btn-ghost">See the plans</Link>
      </div>
    </section>
  );
}
