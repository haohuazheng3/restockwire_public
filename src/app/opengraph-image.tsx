import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "RestockWire — iPhone in-store pickup alerts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)", color: "#1d1d1f", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
        <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="14.5" fill="#0071e3" />
          <path d="M11 37h8.5l6-15 10 27 6-13h8.5" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>RestockWire</span>
      </div>
      <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>The wire for iPhone restocks at your Apple Store.</div>
      <div style={{ fontSize: 30, color: "#6e6e73" }}>Live pickup stock, restock times and phone alerts — iPhone Duo, 18 Pro, 18 Pro Max</div>
    </div>,
    size,
  );
}
