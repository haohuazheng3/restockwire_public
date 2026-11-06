import { NextResponse } from "next/server";
import { recordError } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/errors/client — browser errors (window.onerror, unhandled rejections, the error boundary) into the error
 * inbox. Grouped by error name + first stack frame + route, so one bug on one page is one group however often it fires.
 * Rate-limited per IP; bodies are trimmed; nothing about the visitor is stored beyond the page path.
 */
export async function POST(req: Request) {
  if (!(await rateLimit(`client-error:${clientIp(req)}`, 30, 60 * 60 * 1000))) return new NextResponse(null, { status: 204 });
  let body: { name?: unknown; message?: unknown; stack?: unknown; route?: unknown; kind?: unknown } = {};
  try { body = await req.json(); } catch { return new NextResponse(null, { status: 204 }); }
  const str = (v: unknown, n: number) => (typeof v === "string" ? v : "").slice(0, n);
  const name = str(body.name, 80) || "Error";
  const message = str(body.message, 300) || "(no message)";
  const stack = str(body.stack, 2000);
  const route = str(body.route, 200).replace(/[?#].*$/, "") || "/";
  // First frame of the site's own code (drop the browser's internal frames); numbers are normalised by recordError.
  const frame = stack.split("\n").map((l) => l.trim()).find((l) => /restockwire\.com|\/_next\//.test(l))?.replace(/^at\s+/, "").slice(0, 160) ?? "";
  await recordError("web", `client ${name}: ${message}${frame ? ` @ ${frame}` : ""} [${route}]`, { kind: str(body.kind, 30), route, stack: stack.slice(0, 1500), ua: req.headers.get("user-agent")?.slice(0, 200) ?? null });
  return new NextResponse(null, { status: 204 });
}
