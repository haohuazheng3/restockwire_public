/**
 * The blog's sitemap entries (src/app/sitemap.ts): /blog from the first post, every category with a post, every
 * post; lastModified is the newest updatedAt behind each address. An empty blog adds nothing.
 */
import type { MetadataRoute } from "next";
import { CATEGORIES, POSTS } from "@/content/blog";
import { blogPath, categoryPath, dateOf, lastModifiedOf, postPath, postsIn } from "./registry";
import type { BlogPost } from "./types";

export function blogSitemapEntries(base: string, posts: readonly BlogPost[] = POSTS): MetadataRoute.Sitemap {
  const all = lastModifiedOf(posts);
  if (!all) return [];
  const out: MetadataRoute.Sitemap = [{ url: `${base}${blogPath()}`, lastModified: all, changeFrequency: "weekly", priority: 0.6 }];
  for (const c of CATEGORIES) {
    const mine = postsIn(c.slug, posts);
    const last = lastModifiedOf(mine);
    if (last) out.push({ url: `${base}${categoryPath(c)}`, lastModified: last, changeFrequency: "weekly", priority: 0.55 });
  }
  for (const p of posts) out.push({ url: `${base}${postPath(p)}`, lastModified: dateOf(p.updatedAt), changeFrequency: "monthly", priority: 0.6 });
  return out;
}
