"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Grid3X3, Lightbulb, LightbulbOff, Maximize, Minimize } from "lucide-react";
import { usePhotography } from "./use-photography";
import { useExperience } from "./entry-experience-shell";
import s from "./photography-v2.module.css";

const lightsPreferenceKey = "devyflow-photo-lights-out";

export default function PhotoDetail({ slug }: { slug: string }) {
  const { content, ready } = usePhotography();
  const photos = content.posts.filter(photo => photo.visible && photo.image);
  const index = photos.findIndex(photo => photo.slug === slug);
  const photo = photos[index];
  const [grid, setGrid] = useState(false);
  const [large, setLarge] = useState(false);
  const [lightsOut, setLightsOut] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const { enter, shutter } = useExperience();

  const href = (offset: number) => {
    if (!photos.length || index < 0) return "/preview/entry/personal";
    return `/preview/entry/personal/${photos[(index + offset + photos.length) % photos.length].slug}`;
  };
  const changeLights = (out: boolean) => {
    setLightsOut(out);
    try { localStorage.setItem(lightsPreferenceKey, out ? "on" : "off"); } catch {}
  };

  useEffect(() => {
    try { setLightsOut(localStorage.getItem(lightsPreferenceKey) !== "off"); } catch {}
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!photo || (event.target as HTMLElement).closest("button,a,input,textarea,select") || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Escape") { changeLights(false); setLarge(false); }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        shutter();
        enter(href(event.key === "ArrowLeft" ? -1 : 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!ready) return <p role="status">Loading photograph...</p>;
  if (!photo) return <main className={s.playback}><Link href="/preview/entry/personal">Photo unavailable. Back to archive</Link></main>;

  return <main className={s.playback} data-lights-out={lightsOut}>
    <header className={s.playHeader}><Link href="/preview/entry/personal"><ArrowLeft size={18} />Archive</Link><span>PLAYBACK / {String(index + 1).padStart(2, "0")} OF {String(photos.length).padStart(2, "0")}</span><button aria-label={lightsOut ? "Restore lights" : "Lights out"} aria-pressed={lightsOut} title={lightsOut ? "Restore lights" : "Lights out"} onClick={() => changeLights(!lightsOut)}>{lightsOut ? <LightbulbOff size={20} /> : <Lightbulb size={20} />}</button></header>
    <div className={s.stage} data-large={large} onTouchStart={event => { const item = event.touches[0]; touch.current = event.touches.length === 1 ? { x: item.clientX, y: item.clientY } : null; }} onTouchEnd={event => { if (!touch.current) return; const item = event.changedTouches[0]; const dx = item.clientX - touch.current.x; const dy = item.clientY - touch.current.y; touch.current = null; if (!large && Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) { shutter(); enter(href(dx < 0 ? 1 : -1)); } }}>
      <div className={s.imageFrame}><img src={photo.image} alt={photo.alt} />{grid && <div className={s.gridGuide} aria-hidden="true" />}</div>
    </div>
    <div className={s.playControls}><div><Link href={href(-1)} aria-label="Previous photo"><ArrowLeft size={20} /></Link><Link href={href(1)} aria-label="Next photo"><ArrowRight size={20} /></Link></div><div><button title="Composition grid" aria-label="Composition grid" aria-pressed={grid} onClick={() => setGrid(!grid)}><Grid3X3 size={20} /></button><button title={large ? "Fit photo" : "Enlarge photo"} aria-label={large ? "Fit photo" : "Enlarge photo"} aria-pressed={large} onClick={() => setLarge(!large)}>{large ? <Minimize size={20} /> : <Maximize size={20} />}</button></div></div>
    <div className={s.photoCopy}><h1>{photo.title}</h1><p>{photo.caption}</p></div>
    <nav className={s.filmstrip} aria-label="Photographs">{photos.map(item => <Link key={item.slug} href={`/preview/entry/personal/${item.slug}`} aria-current={item.slug === slug ? "page" : undefined} aria-label={item.title}><img src={item.image} alt="" /></Link>)}</nav>
  </main>;
}
