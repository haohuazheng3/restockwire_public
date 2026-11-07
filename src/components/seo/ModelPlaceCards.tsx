/** Three model cards for one place; each opens that model's page for the same place. */
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { MODELS, type ModelKey } from "@/lib/apple/catalog";
import { productFor, productPath, type Place } from "@/lib/seo/products";
import { Dot } from "@/components/stock/StatusBits";
import { t, pageLocale } from "@/lib/i18n/server";
import { num, bidi } from "@/lib/i18n/format";

export function ModelPlaceCards({ place, stockNow, of, unit }: { place: Place; stockNow: Record<ModelKey, number>; of: Record<ModelKey, number> | number; unit: string }) {
  const lang = pageLocale().lang;
  const v = (x: number) => (lang === "en" ? x : num(lang, x));
  return (
    <nav className="grid grid-cols-3 gap-2" aria-label={t().content.modelCards}>
      {MODELS.map((m) => {
        const n = stockNow[m.key] ?? 0;
        const total = typeof of === "number" ? of : of[m.key];
        return (
          <Link key={m.key} href={productPath(productFor(m.key), place)} className={`fig fig-hover min-w-0 ${n ? "fig-ok" : ""}`}>
            <div className="truncate text-[0.9375rem] font-semibold text-ink">{m.short === "Duo" ? "iPhone Duo" : bidi(m.short, lang)}</div>
            <div className="mt-1 flex items-center gap-1.5 display text-xl font-bold tabular-nums"><Dot state={n ? "ok" : "idle"} live={n > 0} /><span className={n ? "text-ok" : "text-ink-3"}>{v(n)}</span><span className="text-sm font-normal text-ink-3">/{v(total)}</span></div>
            <div className="truncate text-xs text-ink-3">{unit} ›</div>
          </Link>
        );
      })}
    </nav>
  );
}
