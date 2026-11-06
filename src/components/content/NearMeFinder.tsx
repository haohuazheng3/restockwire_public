"use client";
/**
 * "Which Apple Stores have the iPhone Duo near me?": the device's location, or a typed ZIP, ranks all 269 US Apple
 * Stores by distance in the browser, and the ten nearest show whether they list the Duo right now (a snapshot the
 * server rendered with the page). The location is read on mount only when this device was located before
 * (lib/lastPlace.ts) or the browser already allows it without a prompt; otherwise the button asks. Distances are
 * only ever from the visitor, the device or the ZIP's Census centroid, by road and estimated, as in the alert editor.
 */
import { useEffect, useMemo, useState } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { STORES, appleName, cityLine, storePath, type Store } from "@/lib/apple/catalog-us";
import { formatDrive, formatRoad, rankStores, zipAnchor, zipAt, type Anchor } from "@/lib/geo";
import { useZipPoint } from "@/lib/useZipPoint";
import { recallHere, rememberHere } from "@/lib/lastPlace";

export interface NearMeData {
  /** Store number → the iPhone Duo configurations it lists right now ("512GB Night Sky"); stores with none are absent. */
  stock: Record<string, string[]>;
  /** Configurations tracked per store (8). */
  total: number;
  /** The alert link for a store, with STORE_NUMBER where the store number goes (built on the server by alertHref). */
  alertPattern: string;
  /** When the snapshot was taken, e.g. "Nov 3, 9:14 AM ET". */
  asOf: string;
}

const SHOW = 10;
const GEO_OPTS: PositionOptions = { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 };
type LocState = "idle" | "asking" | "ok" | "denied" | "unavailable";
type Row = Store & { distance: number };

export function NearMeFinder({ data }: { data: NearMeData }) {
  const [q, setQ] = useState("");
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [loc, setLoc] = useState<LocState>("idle");

  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) { setLoc("unavailable"); return; }
    setLoc("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => { const h = { lat: pos.coords.latitude, lng: pos.coords.longitude }; rememberHere(h); setHere(h); setQ(""); setLoc("ok"); },
      (err) => setLoc(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      GEO_OPTS,
    );
  };

  // Never a prompt on mount: a location remembered on this device is used at once; otherwise the device is read
  // only when the browser already allows it. The button asks.
  useEffect(() => {
    const known = recallHere();
    if (known) { const t = window.setTimeout(() => { setHere(known); setLoc("ok"); }, 0); return () => window.clearTimeout(t); }
    let live = true;
    void navigator.permissions?.query({ name: "geolocation" as PermissionName }).then((st) => { if (live && st.state === "granted") locate(); }).catch(() => undefined);
    return () => { live = false; };
  }, []);

  // A typed ZIP beats the device: at its Census centroid once that has loaded, meanwhile near the stores of its area.
  const zipPt = useZipPoint(q);
  const digits = q.trim().match(/^\d{3,5}/)?.[0] ?? "";
  const anchor = useMemo<Anchor | null>(() => {
    if (zipPt) return zipAt(zipPt.zip, zipPt);
    if (digits) return zipAnchor(digits);
    if (here) return { ...here, label: "you", kind: "here" };
    return null;
  }, [zipPt, digits, here]);
  const ranked = useMemo<Row[]>(() => (anchor ? rankStores(anchor, STORES).slice(0, SHOW) : []), [anchor]);
  // No place yet: the stores listing the Duo right now, most configurations first.
  const withStock = useMemo<Row[]>(
    () => STORES.filter((s) => (data.stock[s.storeNumber]?.length ?? 0) > 0).sort((a, b) => data.stock[b.storeNumber].length - data.stock[a.storeNumber].length || a.name.localeCompare(b.name)).slice(0, SHOW).map((s) => ({ ...s, distance: -1 })),
    [data.stock],
  );
  const rows = anchor ? ranked : withStock;
  // Distances only from the visitor: the device, or a five-digit ZIP at its Census centroid. Never from a store.
  const origin = zipPt ? `ZIP ${zipPt.zip}` : anchor?.kind === "here" ? "you" : null;
  const alertFor = (storeNumber: string) => data.alertPattern.replace("STORE_NUMBER", storeNumber);

  const status = anchor
    ? (anchor.kind === "here" ? "Closest stores to you" : anchor.approx ? "No such ZIP; showing stores around that area" : zipPt ? `Closest stores to ${anchor.label}` : `Closest stores around ${anchor.label}`)
      + (origin ? ` · estimated road miles from ${origin}` : " · all five ZIP digits give distances")
    : loc === "asking" ? "Locating the closest stores…"
      : loc === "denied" ? "This site cannot read your location. Enter a ZIP."
        : loc === "unavailable" ? "No location service in this browser. Enter a ZIP."
          : withStock.length > 0
            ? `Stores with the iPhone Duo on the shelf (${data.asOf}) · your location or a ZIP ranks all ${STORES.length} US stores by distance`
            : `No store lists the iPhone Duo at the moment (${data.asOf}) · your location or a ZIP ranks all ${STORES.length} US stores by distance, so you know which to watch`;

  return (
    <div className="pane p-4 sm:p-5" data-tool="near-me">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="nm-zip">Your ZIP</label>
        <input id="nm-zip" className="input" inputMode="numeric" autoComplete="postal-code" maxLength={10} placeholder="Your ZIP" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn btn-ghost shrink-0 px-4" onClick={locate} aria-label="Locate me">{loc === "asking" ? "…" : "📍 Locate me"}</button>
      </div>
      <p className="mt-3 text-sm text-ink-2" aria-live="polite">{status}</p>
      {q.trim() && !digits && <p className="mt-1 text-xs text-ink-3">ZIPs are five digits; letters will not match.</p>}
      {rows.length > 0 && (
        <ul className="mt-3 divide-y divide-line">
          {rows.map((s) => {
            const configs = data.stock[s.storeNumber] ?? [];
            const k = configs.length;
            return (
              <li key={s.storeNumber} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Link href={storePath(s)} className="block truncate font-medium text-ink underline-offset-2 hover:underline">{appleName(s)}</Link>
                  <div className="truncate text-xs text-ink-3">{cityLine(s)}{origin && s.distance >= 0 ? ` · ≈${formatRoad(s.distance)} · ${formatDrive(s.distance)} by car` : ""}</div>
                  {k > 0 && <div className="mt-0.5 text-xs text-ink-2">{configs.join(", ")}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${k > 0 ? "bg-ok text-[var(--ok-ink)]" : "bg-ink/10 text-ink-2"}`}>{k > 0 ? `${k} of ${data.total} Duo configs in stock` : "no Duo now"}</span>
                  <Link href={alertFor(s.storeNumber)} className="text-xs font-medium text-ink underline-offset-2 hover:underline">Set an alert</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Snapshot: {data.asOf} · alert stores on a 5 s check, the rest on 15 s · sorting happens in this browser; your position stays on the device, and a ZIP only fetches one small file of ZIP centers keyed by its first three digits
      </p>
    </div>
  );
}
