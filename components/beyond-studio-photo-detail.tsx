"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Grid3X3, Info, Mail, Maximize2, Share2, X } from "lucide-react";
import type { PhotographyContent } from "@/lib/photography-content";
import { useExperience } from "./entry-experience-shell";
import { usePhotography } from "./use-photography";
import ResponsivePhoto from "./responsive-photo";
import s from "./beyond-studio-preview.module.css";
import live from "./beyond-studio-live.module.css";

export default function BeyondStudioPhotoDetail({ slug, initialContent }: { slug: string; initialContent: PhotographyContent }) {
  const { content } = usePhotography(initialContent);
  const photos = content.posts.filter((photo) => photo.visible && photo.image);
  const index = photos.findIndex((photo) => photo.slug === slug);
  const photo = photos[index];
  const [grid, setGrid] = useState(false);
  const [details, setDetails] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");
  const [sending, setSending] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);
  const { enter, shutter } = useExperience();

  const go = useCallback((offset: number) => {
    if (!photos.length) return;
    shutter();
    enter(`/photography/${photos[(index + offset + photos.length) % photos.length].slug}`);
  }, [enter, index, photos, shutter]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (event.key === "Escape" && requestOpen) {
        event.preventDefault();
        setRequestOpen(false);
        return;
      }
      if (requestOpen) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        go(event.key === "ArrowLeft" ? -1 : 1);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [go, requestOpen]);

  if (!photo) return <main className={s.studio}><Link href="/photography">Photo unavailable. Back to archive</Link></main>;
  const hasMetadata = Boolean(photo.showMetadata && (photo.camera || photo.lens || photo.exposure));
  async function shareFrame() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: photo.title, text: photo.caption, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch {}
  }

  async function requestFrame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setRequestStatus("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      purpose: String(form.get("purpose") || ""),
      note: String(form.get("note") || ""),
      company: String(form.get("company") || ""),
      photoSlug: photo.slug,
      photoCode: photo.displayCode || "",
      photoTitle: photo.title,
      pageUrl: window.location.href
    };
    try {
      const response = await fetch("/api/photo-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok?: boolean; deliveryUnavailable?: boolean; message?: string };
      if (response.ok && result.ok) {
        setRequestStatus("Request sent. I will reply by email.");
        event.currentTarget.reset();
      } else if (result.deliveryUnavailable && content.requests.email) {
        const subject = encodeURIComponent(`Frame request: ${photo.displayCode} / ${photo.title}`);
        const body = encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\nPurpose: ${payload.purpose}\nFrame: ${photo.displayCode}\nPage: ${payload.pageUrl}\n\n${payload.note}`);
        window.location.href = `mailto:${content.requests.email}?subject=${subject}&body=${body}`;
        setRequestStatus("Your email app has been opened with the frame details.");
      } else {
        setRequestStatus(result.message || "The request could not be sent. Please try again.");
      }
    } catch {
      setRequestStatus("The request could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <main className={live.viewerPage}>
    <div className={s.viewer} ref={viewerRef}>
      <div className={s.viewerBar}>
        <Link className={live.viewerClose} href="/photography" aria-label="Back to photography"><ArrowLeft size={19} /><span>devyflow.</span></Link>
        <span>{photo.displayCode || `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`}</span>
        <div>
          <button aria-pressed={grid} onClick={() => setGrid(!grid)} title="Composition grid"><Grid3X3 size={18} /></button>
          <button aria-pressed={details} onClick={() => setDetails(!details)} title="Frame details"><Info size={18} /></button>
          <button onClick={() => void shareFrame()} title="Share frame">{copied ? <Check size={18} /> : <Share2 size={18} />}</button>
          <button onClick={() => void viewerRef.current?.requestFullscreen()} title="Fullscreen"><Maximize2 size={18} /></button>
        </div>
      </div>

      <div className={s.viewerStage} onTouchStart={(event) => { swipeStart.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const start = swipeStart.current; swipeStart.current = null; if (start === null) return; const distance = (event.changedTouches[0]?.clientX ?? start) - start; if (Math.abs(distance) >= 55) go(distance > 0 ? -1 : 1); }}>
        <button data-audio-control onClick={() => go(-1)} aria-label="Previous photo"><ArrowLeft size={22} /></button>
        <div className={s.viewerImage}>
          <ResponsivePhoto src={photo.image} alt={photo.alt} width={photo.width} height={photo.height} sizes="100vw" priority />
          {grid && <i className={s.gridGuide} />}
          {content.legal.watermarkEnabled && <span className={s.frameCode}>{photo.displayCode}</span>}
        </div>
        <button data-audio-control onClick={() => go(1)} aria-label="Next photo"><ArrowRight size={22} /></button>
      </div>

      <div className={`${s.viewerCopy} ${live.viewerCopy}`}>
        <div><span>{photo.category} / {photo.displayCode}</span><h1>{photo.title}</h1><p>{photo.caption}</p></div>
        <div className={live.viewerActions}>
          {content.requests.enabled && <button onClick={() => setRequestOpen(true)}><Mail size={16} />Request this frame</button>}
          <small>© {content.legal.copyrightYear} {content.legal.copyrightHolder}</small>
        </div>
        {details && <dl><div><dt>Frame</dt><dd>{photo.displayCode}</dd></div>{hasMetadata ? <><div><dt>Camera</dt><dd>{photo.camera || "Not supplied"}</dd></div><div><dt>Lens / exposure</dt><dd>{[photo.lens, photo.exposure].filter(Boolean).join(" / ") || "Not supplied"}</dd></div></> : <div><dt>Capture data</dt><dd>Not supplied</dd></div>}</dl>}
      </div>

      <nav className={s.filmstrip} aria-label="All frames">{photos.map((item, itemIndex) => <button data-audio-control key={item.slug} aria-current={item.slug === slug ? "true" : undefined} onClick={() => { if (itemIndex === index) return; shutter(); enter(`/photography/${item.slug}`); }}><ResponsivePhoto src={item.image} alt="" width={item.width} height={item.height} sizes="90px" /></button>)}</nav>
    </div>

    {requestOpen && <div className={live.requestBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRequestOpen(false); }}>
      <form className={live.requestForm} onSubmit={requestFrame}>
        <header><div><span>FRAME REQUEST / {photo.displayCode}</span><h2>{photo.title}</h2></div><button type="button" onClick={() => setRequestOpen(false)} aria-label="Close request form"><X size={19} /></button></header>
        <p>{content.requests.intro}</p>
        <input className={live.honeypot} tabIndex={-1} autoComplete="off" name="company" aria-hidden="true" />
        <div><label><span>Name</span><input name="name" maxLength={80} required /></label><label><span>Email</span><input type="email" name="email" maxLength={120} required /></label></div>
        <label><span>Purpose</span><select name="purpose" required defaultValue=""><option value="" disabled>Choose one</option><option>Editorial or publication</option><option>Personal use</option><option>Creative adaptation</option><option>Commercial project</option><option>Other</option></select></label>
        <label><span>Short note (optional)</span><textarea name="note" maxLength={600} rows={3} /></label>
        <div className={live.requestMeta}><span>{photo.displayCode}</span><span>The frame link is included automatically.</span></div>
        <button className={live.sendRequest} disabled={sending}>{sending ? "Sending..." : "Send request"} <ArrowRight size={16} /></button>
        <p className={live.requestStatus} role="status">{requestStatus}</p>
      </form>
    </div>}
  </main>;
}
