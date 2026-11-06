/**
 * The blog's content model (docs/voice.md). A post is data: its words live in src/content/blog, its page in
 * src/app/blog. Nothing here reads a database; everything renders from the registry at request time.
 */
import type { ReactNode } from "react";

export const CATEGORY_SLUGS = ["restock-guides", "store-reports", "buying-tips", "product-updates"] as const;
export type BlogCategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface BlogCategory {
  slug: BlogCategorySlug;
  /** The name as it reads in a breadcrumb, an eyebrow or a card ("Restock guides"). */
  name: string;
  /** The hub page's <title> without the " · RestockWire" suffix (the two together stay ≤ 60 characters). */
  title: string;
  /** The hub page's meta description, 140–160 characters. */
  description: string;
  /** One paragraph under the hub's H1, in RestockWire's voice; **bold** and [label](href) allowed. */
  intro: string;
}

export interface BlogImage {
  /** A path under /public ("/img/guides/x-1200.webp") or an absolute https URL. */
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  /** Photographer or source; shown under the image, linked when creditUrl is set. */
  credit?: string;
  creditUrl?: string;
}

export interface BlogFaq { q: string; a: string }

/**
 * The article body: Markdown-ish text (h2/h3, paragraphs, lists, links, images, blockquotes, tables; see
 * lib/blog/markdown.ts), or a function returning JSX together with its word count (the reading time needs it).
 */
export type BlogBody = string | { render: () => ReactNode; words: number };

export interface BlogPost {
  /** The last path segment: lower-case words joined by hyphens, unique across every category. */
  slug: string;
  category: BlogCategorySlug;
  /** The H1 and the <title> (the layout appends " · RestockWire"); ≤ 60 characters. */
  title: string;
  /** The meta description and the card text, 140–160 characters. */
  description: string;
  /** Calendar dates, "YYYY-MM-DD"; updatedAt is never before publishedAt. */
  publishedAt: string;
  updatedAt: string;
  cover: BlogImage;
  body: BlogBody;
  faqs?: BlogFaq[];
  keywords?: string[];
}
