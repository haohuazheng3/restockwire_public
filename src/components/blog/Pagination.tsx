import { PendingLink as Link } from "@/components/ui/PendingLink";
import { categoryPath } from "@/lib/blog/registry";
import type { BlogCategory } from "@/lib/blog/types";

/**
 * Hub paging: previous / next as links, "page N of M" as a reading. The rel="prev"/"next" <link> elements are
 * hoisted into <head> by React.
 */
export function Pagination({ cat, page, pages }: { cat: BlogCategory; page: number; pages: number }) {
  if (pages <= 1) return null;
  const prev = page > 1 ? categoryPath(cat, page - 1) : null;
  const next = page < pages ? categoryPath(cat, page + 1) : null;
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Pages">
      {prev && <link rel="prev" href={prev} />}
      {next && <link rel="next" href={next} />}
      {prev ? <Link href={prev} className="btn btn-ghost btn-sm" rel="prev"><span className="inline-block rtl:-scale-x-100">←</span> Newer</Link> : <span />}
      <span className="text-ink-3">Page <span className="num text-ink-2">{page}</span> of <span className="num text-ink-2">{pages}</span></span>
      {next ? <Link href={next} className="btn btn-ghost btn-sm" rel="next">Older <span className="inline-block rtl:-scale-x-100">→</span></Link> : <span />}
    </nav>
  );
}
