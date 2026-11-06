/**
 * The blog's registry (docs/voice.md): the four categories, the home page's words and every post.
 *
 * Adding a post: write it as its own module under src/content/blog/posts/<slug>.ts exporting a BlogPost (a
 * Markdown-ish body string, see lib/blog/markdown.ts, or a JSX render function with its word count), import it
 * here and add it to POSTS. tests/blog.test.ts checks slugs, categories, dates, titles (≤ 60 characters),
 * descriptions (140–160) and cover alt texts. A category with no posts is noindex and absent from the sitemap;
 * /blog itself is indexable from the first post.
 */
import type { BlogCategory, BlogPost } from "@/lib/blog/types";

export const BLOG_HOME = {
  /** <title> without the " · RestockWire" suffix. */
  title: "iPhone Restock Blog: Guides, Reports, Tips",
  description: "Guides to how Apple Store iPhone restocks work, reports on what the restock log says about stores, buying tips for pickup day and RestockWire updates.",
  eyebrow: "Guides · Reports · Tips · Updates",
  h1: "RestockWire Blog",
  lead: "The longer reads behind the wire: how restocks and pickup work, what the log says about particular stores and regions, how people get a Duo, Pro or Pro Max in store, and what changed at RestockWire.",
  /** The one-line empty state while the first posts are being written (never a fake post). */
  empty: "First reports are being written.",
} as const;

export const CATEGORIES: readonly BlogCategory[] = [
  {
    slug: "restock-guides",
    name: "Restock guides",
    title: "Restock Guides: How Apple Store Restocks Work",
    description: "How iPhone restocks and in-store pickup work at Apple Stores: how a listing appears, how long it lasts, how to reserve and how to read the restock log.",
    intro: "Restocks follow a pattern, and the pattern is measurable. These guides explain how an Apple Store lists an iPhone for pickup, why a listing lasts about a minute, how a reservation works and how to read a store's restock hours. Every number comes from RestockWire's own confirmed checks.",
  },
  {
    slug: "store-reports",
    name: "Store reports",
    title: "Store Reports: What the Data Says per Store",
    description: "Restock log reports on Apple Stores, cities and states: which restock the iPhone Duo most, at what local hour, and how fast each restock sells out.",
    intro: "One store at a time, one region at a time. A store report takes that place's confirmed restocks since tracking began and says what they show: the usual hour, the busiest weekday, the configurations that come back most and how many seconds a listing lasts. Observations, not a schedule; Apple publishes none.",
  },
  {
    slug: "buying-tips",
    name: "Buying tips",
    title: "Buying Tips: Getting an iPhone Duo in Store",
    description: "Tips for getting an iPhone Duo, 18 Pro or 18 Pro Max for in-store pickup: which stores to watch, how to stage Apple's checkout and what to bring.",
    intro: "A restock is won in the first minute. These tips cover the part you control: which stores and configurations to watch, how to have Apple's checkout staged before the alert lands, and what to bring to the Pickup counter. Short steps, in the order you need them.",
  },
  {
    slug: "product-updates",
    name: "Product updates",
    title: "Product Updates: What Changed on the Wire",
    description: "What changed at RestockWire and when: store and country coverage, alerts and the Home Screen app, new restock data and fixes. Dated, newest first.",
    intro: "What changed, when, and what it means for your alerts. Each update names the date, the stores or countries it touches and the behaviour that is different. No roadmap promises: a change is written up once it is live.",
  },
];

/** Every published post. Empty until the first articles are written (a later SEO phase). */
export const POSTS: readonly BlogPost[] = [];
