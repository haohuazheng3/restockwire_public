/**
 * /blog/{category}/{slug}: one article. Breadcrumb, category eyebrow, H1, the dates and reading time, the cover,
 * the body (Markdown-ish or JSX), the post's questions, related posts and the call to the alerts flow. Article
 * JSON-LD with RestockWire as author and publisher; FAQPage when the post has questions.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Related";
import { PostBody } from "@/components/blog/PostBody";
import { PostMeta } from "@/components/blog/PostMeta";
import { PostCard } from "@/components/blog/PostCard";
import { CoverFigure } from "@/components/blog/CoverFigure";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { BlogCta } from "@/components/blog/BlogCta";
import { articleLd } from "@/lib/blog/ld";
import { postMeta } from "@/lib/blog/meta";
import { headingsOf, parseMarkdown } from "@/lib/blog/markdown";
import { categoryBySlug, categoryPath, postBySlug, relatedPosts } from "@/lib/blog/registry";

type Props = PageProps<"/blog/[category]/[slug]">;

async function resolve(props: Props) {
  const { category, slug } = await props.params;
  const cat = categoryBySlug(category);
  const post = cat && postBySlug(cat.slug, slug);
  if (!cat || !post) notFound();
  return { cat, post };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { cat, post } = await resolve(props);
  return postMeta(post, cat);
}

export default async function Article(props: Props) {
  const { cat, post } = await resolve(props);
  const related = relatedPosts(post, 3);
  const toc = typeof post.body === "string" ? headingsOf(parseMarkdown(post.body)) : [];
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:pt-12">
      <JsonLd data={articleLd(post, cat)} />
      <article className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ href: "/", label: "RestockWire" }, { href: "/blog", label: "Blog" }, { href: categoryPath(cat), label: cat.name }, { label: post.title }]} />
        <header className="mt-4">
          <Link href={categoryPath(cat)} className="eyebrow hover:text-ink">{cat.name}</Link>
          <h1 className="display mt-3 text-3xl sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-ink-2">{post.description}</p>
          <PostMeta post={post} className="mt-4" />
        </header>
        <CoverFigure image={post.cover} className="mt-8" />
        {toc.length >= 3 && (
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
            {toc.map((h) => <a key={h.id} href={`#${h.id}`} className="chip px-3 py-1.5 text-xs">{h.text}</a>)}
          </nav>
        )}
        <div className="pane prose-site mt-6 p-5 sm:p-8">
          <PostBody body={post.body} />
        </div>
        {post.faqs && post.faqs.length > 0 && <div className="mt-6"><BlogFaq items={post.faqs} /></div>}
      </article>

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-h">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="related-h" className="display text-2xl sm:text-3xl">More from {cat.name.toLowerCase()}</h2>
            <Link href={categoryPath(cat)} className="text-sm text-ink-3 hover:text-ink">All {cat.name.toLowerCase()} <span className="inline-block rtl:-scale-x-100">→</span></Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}

      <div className="mx-auto mt-12 max-w-3xl"><BlogCta /></div>
    </div>
  );
}
