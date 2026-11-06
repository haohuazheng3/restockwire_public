/**
 * The proxy's view of the blog (lib/seo/routes.ts → publicRouteCheck): decide before anything streams so a wrong
 * category, slug or page is a real 404 and ?page=1 is one address, the bare hub.
 */
import type { BlogPost } from "./types";
import { POSTS } from "@/content/blog";
import { categoryPath, isCategorySlug, pageCount, parsePage, postAnywhere, postBySlug, postPath } from "./registry";

export function blogRouteCheck(rest: string[], search = "", posts: readonly BlogPost[] = POSTS): { notFound: true } | { redirect: string } | null {
  if (rest.length === 0) return null;
  const [category, slug, ...more] = rest;
  if (!isCategorySlug(category) || more.length > 0) return { notFound: true };
  if (slug === undefined) {
    const q = new URLSearchParams(search);
    if (!q.has("page")) return null;
    const page = parsePage(q.get("page"));
    if (page === null || page > pageCount(category, posts)) return { notFound: true };
    if (page === 1) {
      q.delete("page");
      const left = q.toString();
      return { redirect: `${categoryPath(category)}${left ? `?${left}` : ""}` };
    }
    return null;
  }
  if (postBySlug(category, slug, posts)) return null;
  const elsewhere = postAnywhere(slug, posts);
  return elsewhere ? { redirect: postPath(elsewhere) + search } : { notFound: true };
}
