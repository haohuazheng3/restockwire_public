/**
 * /blog: the four categories, the three newest posts across them, and a short intro. Indexable from the first
 * post (lib/blog/meta.ts); until then, noindex, follow and the one-line empty state.
 */
import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Related";
import { Md } from "@/components/i18n/Md";
import { PostCard } from "@/components/blog/PostCard";
import { Empty } from "@/components/blog/Empty";
import { BlogCta } from "@/components/blog/BlogCta";
import { BLOG_HOME, CATEGORIES } from "@/content/blog";
import { homeLd } from "@/lib/blog/ld";
import { homeMeta } from "@/lib/blog/meta";
import { categoryPath, latestPosts, postsIn } from "@/lib/blog/registry";

export const metadata: Metadata = homeMeta();

export default function BlogHome() {
  const latest = latestPosts(3);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:pt-12">
      <JsonLd data={homeLd(latest)} />
      <Breadcrumbs items={[{ href: "/", label: "RestockWire" }, { label: "Blog" }]} />
      <header className="mt-4 max-w-3xl">
        <div className="eyebrow">{BLOG_HOME.eyebrow}</div>
        <h1 className="display mt-3 text-4xl sm:text-6xl">{BLOG_HOME.h1}</h1>
        <p className="mt-5 text-lg text-ink-2">{BLOG_HOME.lead}</p>
      </header>

      <section className="mt-10" aria-labelledby="latest-h">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="latest-h" className="display text-2xl sm:text-3xl">Latest</h2>
          {latest.length > 0 && <span className="text-sm text-ink-3">Newest first, across every category</span>}
        </div>
        {latest.length === 0 ? <Empty className="mt-4" /> : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p, i) => <PostCard key={p.slug} post={p} eager={i === 0} />)}
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="cats-h">
        <h2 id="cats-h" className="display text-2xl sm:text-3xl">Categories</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((c) => {
            const n = postsIn(c.slug).length;
            return (
              <Link key={c.slug} href={categoryPath(c)} className="pane pane-hover flex flex-col p-5 no-underline sm:p-6" aria-label={c.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="eyebrow">Category</div>
                  <span className="text-xs text-ink-3"><span className="num text-ink-2">{n}</span> {n === 1 ? "post" : "posts"}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-ink">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2"><Md text={c.intro} /></p>
                <span className="mt-4 text-sm font-medium text-ink">Open {c.name.toLowerCase()} <span className="inline-block rtl:-scale-x-100">→</span></span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-12"><BlogCta /></div>
    </div>
  );
}
