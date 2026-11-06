/**
 * A cover from the self-hosted Pexels set (src/content/images.json, lib/content/images.ts): the 1200 px file, its
 * alt text, size and credit, so a post can reuse a photo the site already serves instead of adding a file.
 */
import { photo, src } from "@/lib/content/images";
import type { BlogImage } from "./types";

export function coverFromPhoto(id: string, overrides: Partial<BlogImage> = {}): BlogImage {
  const p = photo(id);
  if (!p) throw new Error(`blog cover: no photo "${id}" in src/content/images.json`);
  return { src: src(p, 1200), alt: p.alt, width: p.width, height: p.height, caption: p.caption, credit: `${p.credit} / Pexels`, creditUrl: p.creditUrl, ...overrides };
}
