"use client";
import { useState } from "react";
export function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  return (
    <form className="mt-4 space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setState("busy");
      const f = new FormData(e.currentTarget);
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(f)) });
      setState(res.ok ? "done" : "error");
    }}>
      <input className="input" name="email" type="email" placeholder="Your e-mail address" required />
      <input className="input" name="subject" placeholder="What it is about" />
      <textarea className="input min-h-32" name="message" placeholder="Your message" required minLength={5} />
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <button className="btn btn-primary" disabled={state === "busy" || state === "done"}>{state === "busy" ? <span className="spinner" /> : null}{state === "done" ? "Received. We answer within two business days." : "Send message"}</button>
      {state === "error" && <p className="text-sm text-bad">That did not go through. Write to contact@restockwire.com instead.</p>}
    </form>
  );
}
