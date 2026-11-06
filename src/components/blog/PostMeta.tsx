import { longDate, readingMinutes } from "@/lib/blog/registry";
import type { BlogPost } from "@/lib/blog/types";

/** "Published November 6, 2026 · Updated November 8, 2026 · 4 min read", dates as readings (.num). */
export function PostMeta({ post, className = "" }: { post: BlogPost; className?: string }) {
  const updated = post.updatedAt !== post.publishedAt;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-3 ${className}`}>
      <span>Published <time dateTime={post.publishedAt} className="num text-ink-2">{longDate(post.publishedAt)}</time></span>
      {updated && <><span aria-hidden>·</span><span>Updated <time dateTime={post.updatedAt} className="num text-ink-2">{longDate(post.updatedAt)}</time></span></>}
      <span aria-hidden>·</span>
      <span><span className="num text-ink-2">{readingMinutes(post)}</span> min read</span>
    </p>
  );
}
