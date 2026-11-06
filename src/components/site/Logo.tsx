/**
 * The mark: a wire with one pulse on it — a signal going out — drawn as a single ink line on an amber tile, the
 * dot at the end being the moment it reaches you. Two colours, amber #f5b942 and ink #0b0d12, the same in both
 * themes; holds at 16 px (the pulse reads as a bold "W") and as a flat single-colour line.
 * public/icon.svg, the PWA icons and the OG image are the same drawing (scripts/icons.mjs renders them).
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#f5b942" />
      <path d="M11 38h9l6-16 10 28 6-14h7" stroke="#0b0d12" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="52" cy="36" r="4.6" fill="#0b0d12" />
    </svg>
  );
}

/**
 * `compact` hides the wordmark below 420 px and lets it truncate above that: on a phone the header row
 * must hold the mark, "My alerts", search and the theme toggle, so the wordmark is the one thing that gives way.
 */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-2.5 ${className}`}>
      <span className="shrink-0"><LogoMark /></span>
      <span className={`min-w-0 truncate font-display text-[1.08rem] font-bold tracking-[-0.03em] text-ink ${compact ? "hidden min-[420px]:inline-block" : ""}`}>
        Restock<span className="text-accent">Wire</span>
      </span>
    </span>
  );
}
