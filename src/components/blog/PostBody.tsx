/**
 * An article body from the registry: Markdown-ish text through lib/blog/markdown.ts, or a post's own JSX.
 * Rendered inside .prose-site; tables scroll sideways rather than widen a phone, images keep their box.
 */
import { Figure } from "@/components/content/Figure";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { parseMarkdown, type BlogBlock } from "@/lib/blog/markdown";
import type { BlogBody } from "@/lib/blog/types";

/** **bold**, [label](href) and `code`. Internal links stay in the app; external ones open a new tab. */
export function BlogInline({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] != null) out.push(<strong key={k++} className="font-semibold text-ink">{m[1]}</strong>);
    else if (m[4] != null) out.push(<code key={k++}>{m[4]}</code>);
    else if (m[3].startsWith("/") || m[3].startsWith("#")) out.push(<Link key={k++} href={m[3]}>{m[2]}</Link>);
    else out.push(<a key={k++} href={m[3]} target="_blank" rel="noopener">{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function Block({ b }: { b: BlogBlock }) {
  switch (b.t) {
    case "h2": return <h2 id={b.id} className="scroll-mt-24"><BlogInline text={b.text} /></h2>;
    case "h3": return <h3 id={b.id} className="scroll-mt-24"><BlogInline text={b.text} /></h3>;
    case "p": return <p><BlogInline text={b.text} /></p>;
    case "ul": return <ul>{b.items.map((i, k) => <li key={k}><BlogInline text={i} /></li>)}</ul>;
    case "ol": return <ol className="my-3 ms-5 list-decimal space-y-1">{b.items.map((i, k) => <li key={k}><BlogInline text={i} /></li>)}</ol>;
    case "quote": return <blockquote className="my-5 border-s-2 border-accent/60 ps-4 text-ink"><BlogInline text={b.text} /></blockquote>;
    case "img": {
      if (b.src.startsWith("photo:")) return <Figure id={b.src.slice(6)} />;
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- static files at fixed widths; no optimizer needed */}
          <img src={b.src} alt={b.alt} loading="lazy" decoding="async" className="h-auto w-full rounded-[20px] border border-line bg-ink/5 object-cover" />
          {b.caption && <figcaption className="mt-2 text-xs text-ink-3"><BlogInline text={b.caption} /></figcaption>}
        </figure>
      );
    }
    case "table": return (
      <div className="my-5 overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-sm">
          {b.caption && <caption className="mb-2 text-start text-xs text-ink-3"><BlogInline text={b.caption} /></caption>}
          <thead><tr>{b.head.map((h, k) => <th key={k} scope="col" className="border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink"><BlogInline text={h} /></th>)}</tr></thead>
          <tbody>{b.rows.map((r, k) => <tr key={k} className="border-b border-line">{r.map((c, j) => j === 0 ? <th key={j} scope="row" className="py-2 pe-3 text-start font-medium text-ink"><BlogInline text={c} /></th> : <td key={j} className="py-2 pe-3 align-top"><BlogInline text={c} /></td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
}

export function PostBody({ body }: { body: BlogBody }) {
  if (typeof body !== "string") return <>{body.render()}</>;
  return <>{parseMarkdown(body).map((b, i) => <Block key={i} b={b} />)}</>;
}
