"use client";
/** Sends uncaught browser errors and unhandled rejections to the error inbox (/api/errors/client), at most 10 per page view. */
import { useEffect } from "react";

let sent = 0;
export function reportClientError(e: unknown, kind: string): void {
  if (sent >= 10 || typeof window === "undefined" || !/^https:/.test(location.protocol)) return;
  sent++;
  const err = e instanceof Error ? e : new Error(typeof e === "string" ? e : JSON.stringify(e ?? null));
  const body = JSON.stringify({ name: err.name, message: err.message, stack: err.stack ?? "", route: location.pathname, kind });
  try {
    if (!navigator.sendBeacon?.("/api/errors/client", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/errors/client", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => undefined);
    }
  } catch { /* reporting must never throw */ }
}

export function ErrorReporter() {
  useEffect(() => {
    const onError = (ev: ErrorEvent) => reportClientError(ev.error ?? ev.message, "error");
    const onRejection = (ev: PromiseRejectionEvent) => reportClientError(ev.reason, "unhandledrejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
  }, []);
  return null;
}
