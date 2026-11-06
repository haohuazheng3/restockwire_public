/**
 * /blog/{category}[?page=N]: the hub of one category: its intro, its posts newest first (20 a page), the other
 * categories. The proxy (lib/blog/routes.ts) has already 404ed an unknown category or page and sent ?page=1
 * to the bare address; the checks here are the fallback. Noindex, follow until the category has a post.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Related";
import { Md } from "@/components/i18n/Md";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import { Empty } from "@/components/blog/Empty";
import { BlogCta } from "@/components/blog/BlogCta";
import { CATEGORIES } from "@/content/blog";
import { categoryLd } from "@/lib/blog/ld";
import { categoryMeta } from "@/lib/blog/meta";
import { PAGE_SIZE, categoryBySlug, categoryPath, pageCount, pageOf, parsePage, postsIn } from "@/lib/blog/registry";

type Props = PageProps<"/blog/[category]">;

async function resolve(props: Props) {
  const { category } = await props.params;
  const cat = categoryBySlug(category);
  if (!cat) notFound();
  const page = parsePage((await props.searchParams).page);
  if (page === null || page > pageCount(cat.slug)) notFound();
  return { cat, page };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { cat, page } = await resolve(props);
  return categoryMeta(cat, page);
}

export default async function CategoryHub(props: Props) {
  const { cat, page } = await resolve(props);
  const all = postsIn(cat.slug);
  const posts = pageOf(cat.slug, page);
  const pages = pageCount(cat.slug);
  const others = CATEGORIES.filter((c) => c.slug !== cat.slug);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:pt-12">
      <JsonLd data={categoryLd(cat, posts, page, PAGE_SIZE)} />
      <Breadcrumbs items={[{ href: "/", label: "RestockWire" }, { href: "/blog", label: "Blog" }, { label: cat.name }]} />
      <header className="mt-4 max-w-3xl">
        <div className="eyebrow">Category{page > 1 && <> · page <span className="num">{page}</span></>}</div>
        <h1 className="display mt-3 text-4xl sm:text-6xl">{cat.name}</h1>
        <p className="mt-5 text-lg text-ink-2"><Md text={cat.intro} /></p>
        {all.length > 0 && <p className="mt-3 text-sm text-ink-3"><span className="num text-ink-2">{all.length}</span> {all.length === 1 ? "post" : "posts"}, newest first</p>}
      </header>

      <section className="mt-10" aria-label={`${cat.name} posts`}>
        {posts.length === 0 ? <Empty /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => <PostCard key={p.slug} post={p} eager={i === 0} />)}
          </div>
        )}
        <div className="mt-6"><Pagination cat={cat} page={page} pages={pages} /></div>
      </section>

      <section className="mt-12" aria-labelledby="others-h">
        <h2 id="others-h" className="eyebrow">Other categories</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((c) => <Link key={c.slug} href={categoryPath(c)} className="chip px-3 py-1.5 text-xs">{c.name}</Link>)}
          <Link href="/blog" className="chip px-3 py-1.5 text-xs">All posts</Link>
        </div>
      </section>

      <div className="mt-12"><BlogCta /></div>
    </div>
  );
}
