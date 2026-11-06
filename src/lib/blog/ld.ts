/**
 * Structured data for the blog: a CollectionPage for the home and each hub (with an ItemList of what it lists),
 * an Article for every post. Author and publisher are the organization RestockWire (docs/voice.md §1), pointed
 * at by @id so the root layout's Organization carries the details.
 */
import { ORG_ID, WEBSITE_ID } from "@/lib/seo/siteLd";
import { BLOG_HOME, CATEGORIES } from "@/content/blog";
import { plainText } from "./markdown";
import { blogPath, categoryPath, postPath, readingMinutes, SITE, wordsOf } from "./registry";
import type { BlogCategory, BlogPost } from "./types";

const ORG = { "@type": "Organization", "@id": ORG_ID, name: "RestockWire" };
const abs = (p: string) => (p.startsWith("/") ? `${SITE}${p}` : p);

function itemList(id: string, posts: readonly BlogPost[], offset = 0) {
  return {
    "@type": "ItemList",
    "@id": id,
    numberOfItems: posts.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: offset + i + 1, url: abs(postPath(p)), name: p.title })),
  };
}

export function homeLd(latest: readonly BlogPost[]) {
  const url = abs(blogPath());
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: BLOG_HOME.title,
    description: BLOG_HOME.description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    hasPart: CATEGORIES.map((c) => ({ "@type": "CollectionPage", "@id": abs(categoryPath(c)), url: abs(categoryPath(c)), name: c.name, description: c.description })),
    ...(latest.length ? { mainEntity: itemList(`${url}#latest`, latest) } : {}),
  };
}

export function categoryLd(cat: BlogCategory, posts: readonly BlogPost[], page: number, pageSize: number) {
  const url = abs(categoryPath(cat, page));
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: cat.title,
    description: cat.description,
    inLanguage: "en",
    isPartOf: { "@id": abs(blogPath()) },
    publisher: { "@id": ORG_ID },
    mainEntity: itemList(`${url}#posts`, posts, (page - 1) * pageSize),
  };
}

export function articleLd(post: BlogPost, cat: BlogCategory) {
  const url = abs(postPath(post));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    image: [abs(post.cover.src)],
    datePublished: `${post.publishedAt}T12:00:00Z`,
    dateModified: `${post.updatedAt}T12:00:00Z`,
    author: ORG,
    publisher: ORG,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: cat.name,
    inLanguage: "en",
    wordCount: wordsOf(post),
    timeRequired: `PT${readingMinutes(post)}M`,
    isPartOf: { "@id": WEBSITE_ID },
    ...(post.keywords?.length ? { keywords: post.keywords.join(", ") } : {}),
  };
}

export function faqLd(faqs: NonNullable<BlogPost["faqs"]>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plainText(f.a) } })),
  };
}
