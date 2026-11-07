/**
 * The mark: a wire with one pulse on it — a signal going out — as a white line on an app-icon tile in Apple blue
 * (redesign 2026-11-07), a top-to-bottom gradient like the system icons; holds at 16 px (the pulse reads as a "W").
 * public/icon.svg, the PWA icons and the OG image are the same drawing (scripts/icons.mjs renders them).
 */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs><linearGradient id="rw-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a9bff" /><stop offset="1" stopColor="#0062e0" /></linearGradient></defs>
      <rect width="64" height="64" rx="14.5" fill="url(#rw-g)" />
      <path d="M11 37h8.5l6-15 10 27 6-13h8.5" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * `compact` hides the red mark below 420 px: on a phone the masthead keeps the wordmark (the paper's name) and
 * drops the tile, so the row still holds "My alerts", search, country and the theme toggle.
 */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-2 ${className}`}>
      <span className={`shrink-0 ${compact ? "hidden min-[420px]:inline-block" : ""}`}><LogoMark /></span>
      <span className="min-w-0 truncate font-display text-[1.15rem] font-semibold leading-none tracking-[-0.022em] text-ink">
        RestockWire
      </span>
    </span>
  );
}
