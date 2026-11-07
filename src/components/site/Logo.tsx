/**
 * The mark: a wire with one pulse on it — a signal going out — drawn as a square-cut paper line on a signal-red
 * block (redesign 2026-11-06: newsprint). Two colours, red #c8321b and paper #f6f2ea, the same in both themes;
 * holds at 16 px (the pulse reads as a bold "W").
 * public/icon.svg, the PWA icons and the OG image are the same drawing (scripts/icons.mjs renders them).
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" fill="#c8321b" />
      <path d="M10 38h10l6-16 10 28 6-14h8" stroke="#f6f2ea" strokeWidth="5.2" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

/**
 * `compact` hides the red mark below 420 px: on a phone the masthead keeps the wordmark (the paper's name) and
 * drops the tile, so the row still holds "My alerts", search, country and the theme toggle.
 */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-2.5 ${className}`}>
      <span className={`shrink-0 ${compact ? "hidden min-[420px]:inline-block" : ""}`}><LogoMark /></span>
      <span className="min-w-0 truncate font-display text-[1.3rem] font-bold leading-none tracking-[-0.02em] text-ink min-[420px]:text-[1.45rem]">
        Restock<span className="italic text-accent">Wire</span>
      </span>
    </span>
  );
}
