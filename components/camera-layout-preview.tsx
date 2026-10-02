"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function CameraLayoutPreview({ source = "/preview/camera", desktopHeight = 1040 }: { source?: string; desktopHeight?: number }) {
  const [mobile, setMobile] = useState(false);
  const [fit, setFit] = useState(true);
  const [available, setAvailable] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const width = mobile ? 390 : 1366;
  const height = mobile ? 844 : desktopHeight;
  const scale = fit && available ? Math.min(1, available / width) : 1;
  return (
    <main style={{ background: "#dfe2de", color: "#202720", padding: 18, minHeight: "100svh" }}>
      <nav aria-label="Preview sizes" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 18, fontSize: 14 }}>
        <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)} style={{ padding: "8px 12px", background: !mobile ? "#252c27" : "#f3f5f1", color: !mobile ? "#fff" : "#222", border: "1px solid #8c978d", borderRadius: 4 }}>Desktop</button>
        <button type="button" aria-pressed={mobile} onClick={() => setMobile(true)} style={{ padding: "8px 12px", background: mobile ? "#252c27" : "#f3f5f1", color: mobile ? "#fff" : "#222", border: "1px solid #8c978d", borderRadius: 4 }}>Mobile</button>
        <span>{width}px</span>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={fit} onChange={event => setFit(event.target.checked)} />Fit to panel</label>
        <Link href={source} style={{ marginLeft: "auto" }}>Open full size</Link>
      </nav>
      <div ref={container} style={{ width: "100%", maxWidth: 1366, margin: "auto" }}>
        <div style={{ width: width * scale, height: height * scale, margin: "auto", overflow: "hidden", borderRadius: 4 }}>
          <iframe title="Camera responsive preview" src={source} style={{ width, height, border: 0, display: "block", transform: `scale(${scale})`, transformOrigin: "0 0" }} />
        </div>
      </div>
    </main>
  );
}
