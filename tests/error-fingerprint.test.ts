import { describe, expect, it } from "vitest";
import { errorFingerprintText, isBrowserNoise } from "../src/lib/errors";

describe("errorFingerprintText", () => {
  it("groups poller failures that differ only by the random IPv6 source address", () => {
    const a =
      "apple request failed: fetch failed: connect ENETUNREACH 2600:141b:1c00:9a3::1aca:443 - Local (2600:3c03:e004:f324:5ad0:e1f2:3b4c:5d6e:46425)";
    const b =
      "apple request failed: fetch failed: connect ENETUNREACH 2600:141b:1c00:998::1aca:443 - Local (2600:3c03:e004:f3d5:713c:9a8b:7c6d:5e4f:40613)";
    expect(errorFingerprintText(a)).toBe(errorFingerprintText(b));
    expect(errorFingerprintText(a)).toBe("apple request failed: fetch failed: connect ENETUNREACH <ip> - Local (<ip>)");
  });

  it("groups IPv4 addresses and keeps ordinary words and numbers apart", () => {
    expect(errorFingerprintText("connect ETIMEDOUT 17.253.144.10:443")).toBe("connect ETIMEDOUT <ip>");
    expect(errorFingerprintText("au: 40 of 40 requests failed")).toBe("au: # of # requests failed");
    expect(errorFingerprintText("store R384 missing from response")).toBe("store R# missing from response");
  });
});

describe("isBrowserNoise — what the client error route drops (2026-11-08: a Brave Wallet opened 5 groups at one checkout)", () => {
  const reporterFrame = "a@https://restockwire.com/_next/static/chunks/2wtvdew2nc79w.js:1:2548";
  it("Firefox for iOS's own injected scripts (__firefox__) are the browser's", () => {
    expect(isBrowserNoise("ReferenceError", "Can't find variable: __firefox__", "global code@https://restockwire.com/sg:1:12")).toBe(true);
    expect(isBrowserNoise("TypeError", "undefined is not an object (evaluating 'window.__firefox__.reader')", "global code@https://restockwire.com/sg:1:19")).toBe(true);
    expect(isBrowserNoise("TypeError", "undefined is not an object (evaluating 'window.stores.map')", "x@https://restockwire.com/_next/static/chunks/a.js:1:2")).toBe(false);
  });
  it("drops cross-origin Script error even though the reporter's own frame is attached", () => {
    expect(isBrowserNoise("Error", "Script error.", reporterFrame)).toBe(true);
    expect(isBrowserNoise("Error", "Script error", "")).toBe(true);
  });
  it("drops wallet-extension globals an injected script failed to set up", () => {
    expect(isBrowserNoise("TypeError", "undefined is not an object (evaluating 'window.ethereum.selectedAddress = undefined')", "global code@https://restockwire.com/sg:1:16")).toBe(true);
    expect(isBrowserNoise("TypeError", "Cannot redefine property: ethereum", "")).toBe(true);
  });
  it("drops a bare network loss with no frame of ours, keeps one that points into our code", () => {
    expect(isBrowserNoise("TypeError", "Load failed", "")).toBe(true);
    expect(isBrowserNoise("TypeError", "Failed to fetch", "")).toBe(true);
    expect(isBrowserNoise("TypeError", "Load failed", "fetchLive@https://restockwire.com/_next/static/chunks/app/page.js:1:200")).toBe(false);
  });
  it("drops React DOM errors caused by a page translator rewriting the text (2026-11-13, /jp)", () => {
    const react = "ui@https://restockwire.com/_next/static/chunks/0f1.js:1:9000";
    expect(isBrowserNoise("NotFoundError", "Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.", react)).toBe(true);
    expect(isBrowserNoise("Error", "NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.", react)).toBe(true);
    expect(isBrowserNoise("NotFoundError", "The object can not be found here.", react)).toBe(false);
  });
  it("keeps real errors in our code", () => {
    expect(isBrowserNoise("TypeError", "Cannot read properties of undefined (reading 'map')", "x@https://restockwire.com/_next/static/chunks/app/stores/page.js:1:900")).toBe(false);
    expect(isBrowserNoise("Error", "Minified React error #418", reporterFrame)).toBe(false);
    expect(isBrowserNoise("Error", "(no message)", "")).toBe(false);
  });
});
