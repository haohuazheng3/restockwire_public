import { BLOG_HOME } from "@/content/blog";

/** The one-line empty state while a hub (or the whole blog) has no post yet. Never a placeholder post. */
export function Empty({ className = "" }: { className?: string }) {
  return (
    <div className={`pane flex items-center gap-3 px-5 py-4 text-sm text-ink-2 ${className}`} role="status">
      <span className="dot dot-warn" aria-hidden />
      <span>{BLOG_HOME.empty}</span>
    </div>
  );
}
