/**
 * The blog's Markdown subset, parsed into blocks the PostBody component renders. Block syntax: "## " and
 * "### " headings, "- " / "* " and "1. " lists, "> " quotes, "|"-tables with a "|---|" separator row, an image
 * on a line of its own ("![alt](/img/x.webp "caption")", or "![](photo:<id>)" for a photo from
 * src/content/images.json), and paragraphs separated by blank lines. Inline: **bold**, [label](href), `code`.
 */

export type BlogBlock =
  | { t: "h2" | "h3"; text: string; id: string }
  | { t: "p"; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "img"; src: string; alt: string; caption?: string }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string };

/** A heading's anchor: lower-case words joined by hyphens ("When does it restock?" → "when-does-it-restock"). */
export function headingId(text: string): string {
  return plainText(text).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
}

const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;
const TABLE_SEP = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

export function parseMarkdown(md: string): BlogBlock[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: BlogBlock[] = [];
  const ids = new Map<string, number>();
  const uniqueId = (text: string) => {
    const base = headingId(text);
    const n = ids.get(base) ?? 0;
    ids.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const s = line.trim();
    if (!s) { i++; continue; }
    if (s.startsWith("### ")) { out.push({ t: "h3", text: s.slice(4).trim(), id: uniqueId(s.slice(4)) }); i++; continue; }
    if (s.startsWith("## ")) { out.push({ t: "h2", text: s.slice(3).trim(), id: uniqueId(s.slice(3)) }); i++; continue; }
    if (/^-{3,}$/.test(s)) { i++; continue; } // a rule: nothing to draw, the blocks already have space between them
    const img = s.match(IMAGE);
    if (img) { out.push({ t: "img", alt: img[1], src: img[2], ...(img[3] ? { caption: img[3] } : {}) }); i++; continue; }
    if (/^[-*] /.test(s)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) { items.push(lines[i].trim().slice(2).trim()); i++; }
      out.push({ t: "ul", items });
      continue;
    }
    if (/^\d+[.)] /.test(s)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)] /.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+[.)] /, "").trim()); i++; }
      out.push({ t: "ol", items });
      continue;
    }
    if (s.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) { parts.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      out.push({ t: "quote", text: parts.join(" ").trim() });
      continue;
    }
    if (s.startsWith("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1].trim())) {
      const head = cells(s);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(cells(lines[i])); i++; }
      // An optional caption: the next non-blank line when it starts with "Table:".
      let caption: string | undefined;
      let j = i;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && /^Table:\s*/i.test(lines[j].trim())) { caption = lines[j].trim().replace(/^Table:\s*/i, ""); i = j + 1; }
      out.push({ t: "table", head, rows, ...(caption ? { caption } : {}) });
      continue;
    }
    // A paragraph: consecutive non-blank lines that start nothing else.
    const parts: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l || l.startsWith("## ") || l.startsWith("### ") || /^[-*] /.test(l) || /^\d+[.)] /.test(l) || l.startsWith(">") || IMAGE.test(l) || (l.startsWith("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1].trim()))) break;
      parts.push(l);
      i++;
    }
    out.push({ t: "p", text: parts.join(" ") });
  }
  return out;
}

/** Inline markup removed: for meta tags, JSON-LD and word counts. */
export function plainText(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1").trim();
}

/** Words a reader reads: headings, paragraphs, list items, quotes and table cells; image syntax and markup excluded. */
export function wordCount(md: string): number {
  let n = 0;
  for (const b of parseMarkdown(md)) {
    let texts: string[];
    if ("items" in b) texts = b.items;
    else if (b.t === "table") texts = [...b.head, ...b.rows.flat(), b.caption ?? ""];
    else if (b.t === "img") texts = [b.caption ?? ""];
    else texts = [b.text];
    for (const t of texts) n += plainText(t).split(/\s+/).filter(Boolean).length;
  }
  return n;
}

/** The h2 headings of a body, for an "on this page" row. */
export function headingsOf(blocks: BlogBlock[]): { id: string; text: string }[] {
  return blocks.flatMap((b) => (b.t === "h2" ? [{ id: b.id, text: plainText(b.text) }] : []));
}
