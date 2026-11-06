/**
 * Reading the blog registry: categories, posts, paging, reading time, indexability. Every helper takes the post
 * list as an optional last argument so tests can pass a made-up list; pages use the real one.
 */
import { CATEGORIES, POSTS } from "@/content/blog";
import { wordCount } from "./markdown";
import { CATEGORY_SLUGS, type BlogCategory, type BlogCategorySlug, type BlogPost } from "./types";

export const SITE = "https://restockwire.com";
export const TITLE_SUFFIX = " · RestockWire";
/** Posts per hub page; ?page=2 starts at the 21st. */
export const PAGE_SIZE = 20;
/** Words per minute a reading time assumes. */
const WPM = 220;

export const blogPath = () => "/blog";
export const categoryPath = (c: BlogCategorySlug | BlogCategory, page = 1) => `/blog/${typeof c === "string" ? c : c.slug}${page > 1 ? `?page=${page}` : ""}`;
export const postPath = (p: Pick<BlogPost, "category" | "slug">) => `/blog/${p.category}/${p.slug}`;

export function isCategorySlug(s: string): s is BlogCategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(s);
}
export function categoryBySlug(slug: string): BlogCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Newest first: by publishedAt, then updatedAt, then slug, so the order is the same on every render. */
export function byNewest(a: BlogPost, b: BlogPost): number {
  return b.publishedAt.localeCompare(a.publishedAt) || b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug);
}
export function allPosts(posts: readonly BlogPost[] = POSTS): BlogPost[] {
  return [...posts].sort(byNewest);
}
export function postsIn(category: BlogCategorySlug, posts: readonly BlogPost[] = POSTS): BlogPost[] {
  return allPosts(posts).filter((p) => p.category === category);
}
export function latestPosts(n: number, posts: readonly BlogPost[] = POSTS): BlogPost[] {
  return allPosts(posts).slice(0, n);
}
export function postBySlug(category: string, slug: string, posts: readonly BlogPost[] = POSTS): BlogPost | undefined {
  return posts.find((p) => p.category === category && p.slug === slug);
}
/** A post by slug alone: the proxy sends a post asked for under the wrong category to its real address. */
export function postAnywhere(slug: string, posts: readonly BlogPost[] = POSTS): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
/** Up to n other posts of the same category, newest first; the rest of the blog fills in when the category is thin. */
export function relatedPosts(post: BlogPost, n = 3, posts: readonly BlogPost[] = POSTS): BlogPost[] {
  const others = allPosts(posts).filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => p.category === post.category);
  return [...same, ...others.filter((p) => p.category !== post.category)].slice(0, n);
}

export function pageCount(category: BlogCategorySlug, posts: readonly BlogPost[] = POSTS): number {
  return Math.max(1, Math.ceil(postsIn(category, posts).length / PAGE_SIZE));
}
export function pageOf(category: BlogCategorySlug, page: number, posts: readonly BlogPost[] = POSTS): BlogPost[] {
  return postsIn(category, posts).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}
/** "?page=N" as a page number: a positive integer, or null for anything else ("0", "abc", "1.5", "01"). */
export function parsePage(v: string | string[] | undefined | null): number | null {
  if (v == null) return 1;
  const s = Array.isArray(v) ? v[0] : v;
  return /^[1-9]\d{0,5}$/.test(s) ? Number(s) : null;
}

export function wordsOf(post: BlogPost): number {
  return typeof post.body === "string" ? wordCount(post.body) : post.body.words;
}
/** Whole minutes at 220 words a minute, never under 1. */
export function readingMinutes(post: BlogPost): number {
  return Math.max(1, Math.ceil(wordsOf(post) / WPM));
}

/** The newest updatedAt of a list, as a Date at noon UTC (a calendar date, not a moment); null for an empty list. */
export function lastModifiedOf(posts: readonly BlogPost[]): Date | null {
  let best: string | null = null;
  for (const p of posts) if (!best || p.updatedAt > best) best = p.updatedAt;
  return best ? dateOf(best) : null;
}
export function dateOf(ymd: string): Date {
  return new Date(`${ymd}T12:00:00Z`);
}
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
/** "November 6, 2026" from "2026-11-06". */
export function longDate(ymd: string): string {
  return LONG.format(dateOf(ymd));
}

/**
 * Indexability (the SEO plan): /blog is worth indexing from the first post; a category hub from its first post;
 * an article always. Empty hubs answer noindex, follow and stay out of the sitemap.
 */
export function blogIndexable(posts: readonly BlogPost[] = POSTS): boolean {
  return posts.length > 0;
}
export function categoryIndexable(category: BlogCategorySlug, posts: readonly BlogPost[] = POSTS): boolean {
  return posts.some((p) => p.category === category);
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (s: string) => YMD.test(s) && !Number.isNaN(dateOf(s).getTime()) && dateOf(s).toISOString().slice(0, 10) === s;

/** Every problem in a post list, as "slug: what is wrong"; [] when the registry is sound (tests/blog.test.ts). */
export function validatePosts(posts: readonly BlogPost[] = POSTS): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of posts) {
    const at = (m: string) => out.push(`${p.slug || "(no slug)"}: ${m}`);
    if (!SLUG.test(p.slug)) at("slug must be lower-case words joined by hyphens");
    if (seen.has(p.slug)) at("duplicate slug"); seen.add(p.slug);
    if (isCategorySlug(p.slug)) at("slug collides with a category");
    if (!isCategorySlug(p.category)) at(`unknown category "${p.category}"`);
    if (!validDate(p.publishedAt)) at(`publishedAt "${p.publishedAt}" is not a YYYY-MM-DD date`);
    if (!validDate(p.updatedAt)) at(`updatedAt "${p.updatedAt}" is not a YYYY-MM-DD date`);
    if (validDate(p.publishedAt) && validDate(p.updatedAt) && p.updatedAt < p.publishedAt) at("updatedAt is before publishedAt");
    if (!p.title.trim()) at("empty title");
    if (p.title.length > 60) at(`title is ${p.title.length} characters (max 60)`);
    if (p.description.length < 140 || p.description.length > 160) at(`description is ${p.description.length} characters (140–160)`);
    if (/refund/i.test(`${p.title} ${p.description}`)) at("title or description mentions refunds (llms.txt must not, tests/llms.test.ts)");
    if (!p.cover?.src) at("cover has no src");
    if (!p.cover?.alt?.trim()) at("cover has no alt text");
    if (wordsOf(p) <= 0) at("body has no words");
    if (typeof p.body !== "string" && !(p.body.words > 0)) at("a JSX body needs its word count");
    for (const f of p.faqs ?? []) if (!f.q.trim() || !f.a.trim()) at("an FAQ has an empty question or answer");
  }
  return out;
}
