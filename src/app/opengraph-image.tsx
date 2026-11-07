import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "RestockWire — iPhone in-store pickup alerts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f2ede3", color: "#141210", fontFamily: "serif", borderTop: "18px solid #141210" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
        <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" fill="#c8321b" />
          <path d="M10 38h10l6-16 10 28 6-14h8" stroke="#f6f2ea" strokeWidth="5.2" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
        <span>Restock<span style={{ color: "#c8321b", fontStyle: "italic" }}>Wire</span></span>
      </div>
      <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>The wire for iPhone restocks at your Apple Store.</div>
      <div style={{ fontSize: 30, color: "#3d3934", fontFamily: "monospace", borderTop: "2px solid #141210", paddingTop: 20 }}>Live pickup stock, restock times and phone alerts — iPhone Duo, 18 Pro, 18 Pro Max</div>
    </div>,
    size,
  );
}
