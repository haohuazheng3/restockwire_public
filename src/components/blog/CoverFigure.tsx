import type { BlogImage } from "@/lib/blog/types";

/** A post's cover: the first image on the page, loaded eagerly, with its caption and credit. */
export function CoverFigure({ image, className = "" }: { image: BlogImage; className?: string }) {
  const credit = image.credit ? (image.creditUrl ? <a href={image.creditUrl} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-ink">{image.credit}</a> : image.credit) : null;
  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static files at fixed widths; no optimizer needed */}
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="h-auto w-full rounded-[var(--radius)] border border-line bg-ink/5 object-cover"
        style={image.width && image.height ? { aspectRatio: `${image.width} / ${image.height}` } : undefined}
      />
      {(image.caption || credit) && (
        <figcaption className="mt-2 px-1 text-xs text-ink-3">
          {image.caption}{image.caption && credit ? " · " : null}{credit && <>Photo: {credit}</>}
        </figcaption>
      )}
    </figure>
  );
}
