/**
 * Phone guides: /restock-alerts-on-apple-watch, /restock-alerts-in-focus-mode, /restock-alerts-on-android (English, at
 * the root) and /{lang}-{cc}/… (each native version). Steps verified against Apple Support, WebKit and Google sources
 * on 2026-11-07 (listed on each page); one live number, the measured median iPhone Duo listing.
 */
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Related";
import { Figure } from "@/components/content/Figure";
import { RichFaq } from "@/components/content/RichFaq";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { emptyFacts } from "@/lib/content/facts";
import { siteFacts } from "@/lib/content/siteFacts";
import { dict } from "@/lib/i18n/dict";
import { pageLocale, t } from "@/lib/i18n/server";
import { EN_US, type Locale } from "@/lib/i18n/locales";
import { GUIDE_SLUGS, Keys, SITE, Section, guideHreflang, guideUrl, secsIn, type GuideKey } from "./frame";

const IMAGES: Record<GuideKey, [string, string]> = {
  watch: ["guide-watch-wrist", "guide-watch-notification"],
  focus: ["guide-focus-phone-night", "guide-focus-desk"],
  android: ["guide-android-phone", "guide-android-watch"],
};

export function guideMetadata(key: GuideKey, loc: Locale = EN_US): Metadata {
  const G = dict(loc.lang).insight.guides[key];
  const url = guideUrl(key, loc);
  return {
    title: { absolute: `${G.title} · RestockWire` }, description: G.meta,
    alternates: { canonical: url, languages: guideHreflang(key) },
    openGraph: { type: "article", siteName: "RestockWire", title: G.title, description: G.meta, url },
  };
}

export async function GuidePage({ guide: key }: { guide: GuideKey }) {
  const loc = pageLocale();
  const lang = loc.lang;
  const D = t().insight;
  const G = D.guides[key];
  const facts = await siteFacts();
  const live = facts.duoSellout ? secsIn(lang, facts.duoSellout.medianSec) : null;
  const url = guideUrl(key, loc);
  const home = loc.native ? `/${loc.id}` : "/";
  const [img1, img2] = IMAGES[key];
  const ld = {
    "@context": "https://schema.org", "@type": "HowTo", name: G.h1, url: `${SITE}${url}`,
    step: G.sections.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.h2, text: s.lead })),
    publisher: { "@type": "Organization", name: "RestockWire", url: SITE },
  };
  const others = (Object.keys(GUIDE_SLUGS) as GuideKey[]).filter((k) => k !== key);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: home, label: "RestockWire" }, { label: D.nav.guides }]} />
      <h1 className="display mt-2 text-3xl sm:text-5xl">{G.h1}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{G.answer(live)}</p>
      <Figure id={img1} eager />
      {G.sections.map((s, i) => (
        <div key={s.h2}>
          <Section id={`step-${i + 1}`} h2={s.h2} lead={s.lead}><Keys items={s.points} /></Section>
          {i === 1 && <Figure id={img2} />}
        </div>
      ))}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/phone-alerts" className="btn btn-primary">{D.nav.alertCta}</Link>
      </div>
      <div className="mt-8"><RichFaq items={G.faq} facts={emptyFacts("us")} /></div>
      <section className="mt-6 text-sm">
        <h2 className="text-lg font-semibold">{D.nav.sources}</h2>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-ink-2">{G.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener" className="text-accent hover:underline">{s.label}</a></li>)}</ol>
      </section>
      <section className="pane mt-6 p-5">
        <h2 className="text-lg font-bold">{D.guides.related}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">{others.map((k) => <Link key={k} href={guideUrl(k, loc)} className="chip chip-sm">{dict(lang).insight.guides[k].title}</Link>)}</div>
      </section>
    </div>
  );
}
