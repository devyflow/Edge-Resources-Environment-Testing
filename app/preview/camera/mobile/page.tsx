import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevyFlow | Mobile Camera Preview",
  robots: { index: false, follow: false }
};

export default function MobileCameraPreview() {
  return (
    <main style={{ background: "#e7e8e4", minHeight: "100svh", padding: "20px 12px", color: "#202723" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "min(390px, 100%)", margin: "0 auto 14px", fontSize: 13 }}>
        <span>Mobile / 390px</span><Link href="/preview/camera">Desktop preview</Link>
      </div>
      <iframe title="Interactive mobile camera preview" src="/preview/camera" style={{ display: "block", width: "min(390px, 100%)", height: "calc(100svh - 76px)", minHeight: 540, margin: "0 auto", border: "1px solid #b8bdb7", borderRadius: 4, background: "#17191a" }} />
    </main>
  );
}
