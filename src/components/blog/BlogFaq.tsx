import { JsonLd } from "@/components/seo/JsonLd";
import { faqLd } from "@/lib/blog/ld";
import type { BlogFaq as Faq } from "@/lib/blog/types";
import { BlogInline } from "./PostBody";

/** A post's questions, open by default so readers and crawlers see the answers; FAQPage JSON-LD alongside. */
export function BlogFaq({ items }: { items: Faq[] }) {
  if (items.length === 0) return null;
  return (
    <section id="faq" className="pane scroll-mt-24 p-5 sm:p-7" aria-labelledby="faq-h">
      <JsonLd data={faqLd(items)} />
      <h2 id="faq-h" className="display text-2xl">Questions</h2>
      <div className="mt-2 divide-y divide-line">
        {items.map((f) => (
          <details key={f.q} className="group py-3" open>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-ink [&::-webkit-details-marker]:hidden"><h3 className="text-base font-semibold">{f.q}</h3><span className="mt-0.5 shrink-0 text-ink-3 transition-transform group-open:rotate-45" aria-hidden>+</span></summary>
            <p className="mt-2 leading-relaxed text-ink-2"><BlogInline text={f.a} /></p>
          </details>
        ))}
      </div>
    </section>
  );
}
