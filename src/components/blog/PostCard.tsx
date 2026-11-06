import { PendingLink as Link } from "@/components/ui/PendingLink";
import { categoryBySlug, longDate, postPath, readingMinutes } from "@/lib/blog/registry";
import type { BlogPost } from "@/lib/blog/types";

/** One post in a list: cover, category eyebrow, title, description, date and reading time. The whole card is the link. */
export function PostCard({ post, eager = false }: { post: BlogPost; eager?: boolean }) {
  const cat = categoryBySlug(post.category);
  return (
    <article className="pane pane-hover flex h-full flex-col overflow-hidden">
      <Link href={postPath(post)} className="flex h-full flex-col no-underline" aria-label={post.title}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static files at fixed widths; no optimizer needed */}
        <img src={post.cover.src} alt={post.cover.alt} width={post.cover.width} height={post.cover.height} loading={eager ? "eager" : "lazy"} decoding="async" className="aspect-[3/2] w-full border-b border-line bg-ink/5 object-cover" />
        <div className="flex flex-1 flex-col p-5">
          {cat && <div className="eyebrow">{cat.name}</div>}
          <h3 className="mt-2 text-lg font-semibold leading-snug text-ink">{post.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{post.description}</p>
          <p className="mt-4 text-xs text-ink-3"><time dateTime={post.publishedAt} className="num">{longDate(post.publishedAt)}</time> · <span className="num">{readingMinutes(post)}</span> min read</p>
        </div>
      </Link>
    </article>
  );
}
