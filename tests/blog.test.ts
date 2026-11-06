import { describe, expect, it } from "vitest";
import { BLOG_HOME, CATEGORIES, POSTS } from "@/content/blog";
import { CATEGORY_SLUGS, type BlogPost } from "@/lib/blog/types";
import { blogIndexable, categoryIndexable, pageCount, pageOf, parsePage, postPath, readingMinutes, relatedPosts, validatePosts, PAGE_SIZE } from "@/lib/blog/registry";
import { blogRouteCheck } from "@/lib/blog/routes";
import { blogSitemapEntries } from "@/lib/blog/sitemap";
import { headingId, parseMarkdown, wordCount } from "@/lib/blog/markdown";
import { articleLd } from "@/lib/blog/ld";
import { categoryMeta, homeMeta, postMeta } from "@/lib/blog/meta";
import { publicRouteCheck } from "@/lib/seo/routes";

const DESC = "x".repeat(150);
const make = (slug: string, category: BlogPost["category"], publishedAt: string, extra: Partial<BlogPost> = {}): BlogPost => ({
  slug, category, title: `Post ${slug}`, description: DESC, publishedAt, updatedAt: publishedAt,
  cover: { src: "/img/guides/x-1200.webp", alt: "An Apple Store" }, body: "## One\n\nSome words here.\n\n- a\n- b", ...extra,
});

describe("blog registry", () => {
  it("has the four categories, each with a title ≤ 60 with suffix and a 140–160 description", () => {
    expect(CATEGORIES.map((c) => c.slug)).toEqual([...CATEGORY_SLUGS]);
    for (const c of [...CATEGORIES, BLOG_HOME]) {
      expect(`${c.title} · RestockWire`.length, c.title).toBeLessThanOrEqual(60);
      expect(c.description.length, c.title).toBeGreaterThanOrEqual(140);
      expect(c.description.length, c.title).toBeLessThanOrEqual(160);
    }
  });
  it("every post is valid (unique slugs, known categories, real dates, reading time)", () => {
    expect(validatePosts(POSTS)).toEqual([]);
    for (const p of POSTS) expect(readingMinutes(p)).toBeGreaterThanOrEqual(1);
  });
  it("the validator catches bad posts", () => {
    const bad = [make("a", "restock-guides", "2026-11-01"), make("a", "restock-guides", "2026-02-30"), make("b", "nope" as BlogPost["category"], "2026-11-01", { updatedAt: "2026-10-01" })];
    const errs = validatePosts(bad).join("\n");
    expect(errs).toContain("duplicate slug");
    expect(errs).toContain("not a YYYY-MM-DD date");
    expect(errs).toContain("unknown category");
    expect(errs).toContain("before publishedAt");
  });
  it("reading time is words / 220, rounded up, never under 1", () => {
    expect(readingMinutes(make("a", "buying-tips", "2026-11-01"))).toBe(1);
    expect(readingMinutes(make("a", "buying-tips", "2026-11-01", { body: "word ".repeat(441) }))).toBe(3);
    expect(readingMinutes(make("a", "buying-tips", "2026-11-01", { body: { render: () => null, words: 660 } }))).toBe(3);
  });
  it("pages at 20, related posts come from the same category first", () => {
    const many = Array.from({ length: 45 }, (_, i) => make(`p${i}`, "store-reports", `2026-10-${String((i % 28) + 1).padStart(2, "0")}`));
    expect(pageCount("store-reports", many)).toBe(3);
    expect(pageOf("store-reports", 3, many)).toHaveLength(45 - 2 * PAGE_SIZE);
    expect(pageCount("buying-tips", many)).toBe(1);
    const mixed = [...many.slice(0, 2), make("t", "buying-tips", "2026-11-05")];
    expect(relatedPosts(mixed[0], 3, mixed).map((p) => p.slug)).toEqual(["p1", "t"]);
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("2")).toBe(2);
    for (const v of ["0", "01", "abc", "1.5"]) expect(parsePage(v)).toBeNull();
  });
});

describe("indexability and sitemap", () => {
  it("an empty blog is noindex and adds nothing to the sitemap", () => {
    expect(blogSitemapEntries("https://restockwire.com", [])).toEqual([]);
    expect(blogIndexable([])).toBe(false);
    for (const c of CATEGORY_SLUGS) expect(categoryIndexable(c, [])).toBe(false);
    if (POSTS.length === 0) {
      expect(homeMeta().robots).toEqual({ index: false, follow: true });
      for (const c of CATEGORIES) expect(categoryMeta(c).robots).toEqual({ index: false, follow: true });
    }
  });
  it("with posts: /blog, non-empty categories and every post, with real lastModified", () => {
    const posts = [make("a", "restock-guides", "2026-11-01", { updatedAt: "2026-11-04" }), make("b", "restock-guides", "2026-10-01")];
    const e = blogSitemapEntries("https://restockwire.com", posts);
    expect(e.map((x) => x.url)).toEqual(["https://restockwire.com/blog", "https://restockwire.com/blog/restock-guides", "https://restockwire.com/blog/restock-guides/a", "https://restockwire.com/blog/restock-guides/b"]);
    expect((e[0].lastModified as Date).toISOString().slice(0, 10)).toBe("2026-11-04");
    expect(blogIndexable(posts)).toBe(true);
    expect(categoryIndexable("restock-guides", posts)).toBe(true);
    expect(categoryIndexable("buying-tips", posts)).toBe(false);
  });
  it("article metadata and JSON-LD: OG article, organization as author and publisher", () => {
    const p = make("a", "buying-tips", "2026-11-01", { faqs: [{ q: "Q?", a: "A." }] });
    const cat = CATEGORIES.find((c) => c.slug === "buying-tips")!;
    const m = postMeta(p, cat);
    expect(m.alternates?.canonical).toBe("/blog/buying-tips/a");
    expect((m.openGraph as { type?: string }).type).toBe("article");
    expect(m.robots).toBeUndefined();
    const ld = articleLd(p, cat);
    expect(ld.author["@id"]).toBe("https://restockwire.com/#organization");
    expect(ld.publisher["@id"]).toBe("https://restockwire.com/#organization");
    expect(ld.mainEntityOfPage["@id"]).toBe("https://restockwire.com/blog/buying-tips/a");
  });
});

describe("blog routes (proxy)", () => {
  it("lets /blog and every category through, 404s the rest", () => {
    expect(publicRouteCheck("/blog")).toBeNull();
    for (const c of CATEGORY_SLUGS) expect(publicRouteCheck(`/blog/${c}`)).toBeNull();
    expect(publicRouteCheck("/blog/not-a-category")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/restock-guides/unknown-slug")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/restock-guides/a/b")).toEqual({ notFound: true });
  });
  it("pages: ?page=1 folds into the hub, out-of-range or malformed pages 404", () => {
    expect(publicRouteCheck("/blog/restock-guides", "?page=1")).toEqual({ redirect: "/blog/restock-guides" });
    expect(publicRouteCheck("/blog/restock-guides", "?page=2")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/restock-guides", "?page=x")).toEqual({ notFound: true });
    const many = Array.from({ length: 21 }, (_, i) => make(`p${i}`, "store-reports", "2026-11-01"));
    expect(blogRouteCheck(["store-reports"], "?page=2", many)).toBeNull();
  });
  it("a real post passes; under the wrong category it 308s to its address", () => {
    const posts = [make("a", "buying-tips", "2026-11-01")];
    expect(blogRouteCheck(["buying-tips", "a"], "", posts)).toBeNull();
    expect(blogRouteCheck(["restock-guides", "a"], "", posts)).toEqual({ redirect: postPath(posts[0]) });
  });
});

describe("blog markdown", () => {
  it("parses headings, lists, quotes, images and tables", () => {
    const b = parseMarkdown("## When does it restock?\n\nText **bold** [x](/pricing).\n\n1. one\n2. two\n\n> quoted\n\n![Alt](/img/a.webp \"Cap\")\n\n| A | B |\n|---|---|\n| 1 | 2 |\nTable: Cap");
    expect(b.map((x) => x.t)).toEqual(["h2", "p", "ol", "quote", "img", "table"]);
    expect(b[0]).toMatchObject({ id: "when-does-it-restock" });
    expect(b[5]).toMatchObject({ head: ["A", "B"], rows: [["1", "2"]], caption: "Cap" });
    expect(headingId("Pro Max: 1TB?")).toBe("pro-max-1tb");
    expect(wordCount("## Two words\n\nThree **more** [words](/x).")).toBe(5);
  });
});
