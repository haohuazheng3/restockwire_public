import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "RestockWire — iPhone in-store pickup alerts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "radial-gradient(900px 500px at 85% -10%, #3a2d10 0%, #0b0d12 60%)", color: "#eef1f6", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
        <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="15" fill="#f5b942" />
          <path d="M11 38h9l6-16 10 28 6-14h7" stroke="#0b0d12" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="52" cy="36" r="4.6" fill="#0b0d12" />
        </svg>
        <span>Restock<span style={{ color: "#f5b942" }}>Wire</span></span>
      </div>
      <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>The wire for iPhone restocks at your Apple Store.</div>
      <div style={{ fontSize: 30, color: "#b3bac8" }}>Live pickup stock, restock times and phone alerts — iPhone Duo, 18 Pro, 18 Pro Max</div>
    </div>,
    size,
  );
}
