import { Suspense } from "react";
import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { signalGuides, SIGNAL_HUB, SIGNAL_REVIEWED, type SignalGuide } from "@/content/signals/guides";
import { JsonLd } from "@/components/seo/JsonLd";
import { SignalEvidence } from "./SignalEvidence";
import styles from "./styles";
const origin = "https://restockwire.com";
export function signalMetadata(guide?: SignalGuide): Metadata {
  const path = guide ? `/${guide.slug}` : SIGNAL_HUB;
  const title = guide?.title ?? "iPhone stock signals: checkout gaps, alert delays and evidence";
  const description = guide?.description ?? "Read iPhone pickup signals with their timestamps and limits. Four evidence-led guides explain disappearing stock, late alerts, weekend observations and tracker accuracy.";
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: origin + path, type: guide ? "article" : "website" }, twitter: { card: "summary_large_image", title, description } };
}
export function SignalHub() {
  return <div className={styles.page}>
    <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/">RestockWire</Link> / Stock signal guides</nav>
    <header className={styles.hero}><p className={styles.label}>The stock signal desk</p><h1>Understand the signal.<br />Know its limits.</h1><p>A green result, a late alert and a weekend restock each raise a different question. These guides connect those questions to dated inventory evidence, with clear boundaries around what the feed can tell us.</p><span className={styles.meta}>By RestockWire · Reviewed November 7, 2026 · US observation context</span></header>
    <div className={styles.cards}>{signalGuides.map((g, i) => <Link href={`/${g.slug}`} key={g.slug}><p className={styles.label}>Signal brief 0{i + 1}</p><h2>{g.question}</h2><p>{g.description}</p><p>Read the evidence →</p></Link>)}</div>
    <section className={styles.evidence}><h2>What these guides measure</h2><p>The data comes from recorded pickup observations, not physical stock counts, shipment records or private Apple orders. Each live panel identifies its country, model or store scope, time window and limitations. Missing observations remain unknown.</p><div className={styles.related}><Link href="/apple-pickup-status">Current pickup source status</Link><Link href="/restock-reports">Dated weekly restock reports</Link><Link href="/in-stock/iphone-duo">Current iPhone Duo listings</Link></div></section>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Stock signal guides", url: origin + SIGNAL_HUB, hasPart: signalGuides.map((g) => ({ "@type": "Article", name: g.title, url: `${origin}/${g.slug}` })) }} />
  </div>;
}
export function SignalPage({ guide }: { guide: SignalGuide }) {
  const url = `${origin}/${guide.slug}`;
  return <div className={styles.page}>
    <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/">RestockWire</Link> / <Link href={SIGNAL_HUB}>Stock signal guides</Link> / {guide.evidence}</nav>
    <header className={styles.hero}><p className={styles.label}>Stock signal guide · {guide.evidence}</p><h1>{guide.title}</h1><p>{guide.answer}</p><span className={styles.meta}>By RestockWire · Editorial review <time dateTime={SIGNAL_REVIEWED}>November 7, 2026</time> · Live samples carry separate timestamps</span></header>
    <nav className={styles.toc} aria-label="On this page"><a href="#evidence">View the evidence</a><a href="#method">Read the explanation</a><a href="#checklist">What to check</a><a href="#questions">Common questions</a></nav>
    <Suspense fallback={<section id="evidence" className={styles.evidence} aria-busy="true"><h2>Loading the observation sample</h2><p>The explanation below is available while the dated evidence loads.</p></section>}><SignalEvidence kind={guide.evidence} /></Suspense>
    <article className={styles.article}>
      {guide.sections.map((s, i) => <section key={s.title} id={i === 0 ? "method" : `section-${i + 1}`}><h2>{s.title}</h2>{s.paragraphs.map((p) => <p key={p}>{p}</p>)}</section>)}
      <section id="checklist"><h2>A short investigation checklist</h2><ol className={styles.steps}>{guide.steps.map((s) => <li key={s}>{s}</li>)}</ol></section>
      <section id="questions"><h2>Common questions</h2>{guide.faqs.map((f) => <div key={f.question}><h3>{f.question}</h3><p>{f.answer}</p></div>)}</section>
      <section><h2>Sources and evidence boundaries</h2><p>Retailer guidance: <a href="https://www.apple.com/shop/help/shipping_delivery">Apple US pickup and delivery instructions</a> and <a href="https://www.apple.com/shop/help/viewing_changing_orders">Apple US order status help</a>. Apple instructs customers to wait for its ready-for-pickup notification before visiting. Use your order’s current instructions for collection.</p><p>Inventory analysis is computed from RestockWire’s synchronized observation records. It does not use Apple order, shipment or device-count data. The methods and caveats above are part of the result; no keyword popularity, purchase probability or accuracy percentage is inferred from these counts.</p></section>
      <section className={styles.related}><h2>Read the next signal brief</h2>{signalGuides.filter((g) => g.slug !== guide.slug).map((g) => <Link href={`/${g.slug}`} key={g.slug}>{g.question} →</Link>)}{guide.evidence === "delay" && <><Link href="/restock-alerts-in-focus-mode">Check Focus-mode notification setup →</Link><Link href="/restock-alerts-on-android">Check Android notification setup →</Link></>}</section>
    </article>
    <JsonLd data={[{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, url, mainEntityOfPage: url, datePublished: SIGNAL_REVIEWED, dateModified: SIGNAL_REVIEWED, author: { "@type": "Organization", name: "RestockWire", url: origin + "/about" }, publisher: { "@type": "Organization", name: "RestockWire", url: origin }, articleSection: "Stock signal guides", inLanguage: "en-US" }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "RestockWire", item: origin }, { "@type": "ListItem", position: 2, name: "Stock signal guides", item: origin + SIGNAL_HUB }, { "@type": "ListItem", position: 3, name: guide.title, item: url }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: guide.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }]} />
  </div>;
}
