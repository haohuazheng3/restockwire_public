/**
 * <head> metadata for the three blog page types (the SEO plan: title ≤ 60 characters with the suffix, description
 * 140–160, one canonical, OG type article for a post). Pure functions, so tests can read them without Next.
 */
import type { Metadata } from "next";
import { BLOG_HOME } from "@/content/blog";
import { blogIndexable, blogPath, categoryIndexable, categoryPath, postPath, TITLE_SUFFIX } from "./registry";
import type { BlogCategory, BlogPost } from "./types";

const NOINDEX: Metadata["robots"] = { index: false, follow: true };

export function homeMeta(): Metadata {
  return {
    title: { absolute: `${BLOG_HOME.title}${TITLE_SUFFIX}` },
    description: BLOG_HOME.description,
    alternates: { canonical: blogPath() },
    openGraph: { type: "website", siteName: "RestockWire", title: BLOG_HOME.title, description: BLOG_HOME.description, url: blogPath() },
    ...(blogIndexable() ? {} : { robots: NOINDEX }),
  };
}

export function categoryMeta(cat: BlogCategory, page = 1): Metadata {
  const title = page > 1 ? `${cat.title}, page ${page}` : cat.title;
  const path = categoryPath(cat, page);
  return {
    title: { absolute: `${title}${TITLE_SUFFIX}` },
    description: cat.description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "RestockWire", title, description: cat.description, url: path },
    ...(categoryIndexable(cat.slug) ? {} : { robots: NOINDEX }),
  };
}

export function postMeta(post: BlogPost, cat: BlogCategory): Metadata {
  const path = postPath(post);
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: "RestockWire",
      title: post.title,
      description: post.description,
      url: path,
      publishedTime: `${post.publishedAt}T12:00:00Z`,
      modifiedTime: `${post.updatedAt}T12:00:00Z`,
      section: cat.name,
      tags: post.keywords,
      images: [{ url: post.cover.src, alt: post.cover.alt, ...(post.cover.width ? { width: post.cover.width } : {}), ...(post.cover.height ? { height: post.cover.height } : {}) }],
    },
  };
}
