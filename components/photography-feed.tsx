"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Aperture, ArrowLeft, ArrowRight, AtSign, Globe2, Instagram, LayoutGrid, Pin, Rows3, SlidersHorizontal, Scan, Youtube } from "lucide-react";
import type { PhotoSocialPlatform } from "@/lib/photography-content";
import { usePhotography } from "./use-photography";
import s from "./photography-v2.module.css";
import camera from "./entry-experience.module.css";
import refinement from "./photography-refinement.module.css";

const socialIcons = { instagram: Instagram, youtube: Youtube, pinterest: Pin, x: AtSign, website: Globe2 } satisfies Record<PhotoSocialPlatform, typeof Instagram>;
const viewIndex = { feed: 0, contact: 1, frame: 2 } as const;

export default function PhotographyFeed() {
  const {content,ready} = usePhotography();
  const photoPosts = content.posts.filter(p => p.visible && p.image);
  const [mode, setMode] = useState<number>(() => viewIndex[content.defaultView]);
  const [filters, setFilters] = useState(false);
  const [frame, setFrame] = useState(0);
  const modes = ["Feed", "Contact sheet", "Single frame"];
  const [category, setCategory] = useState("All");
  const socialLinks = content.socialLinks.filter(link => link.visible && /^https?:\/\//.test(link.url));
  const posts = photoPosts.filter(p => category === "All" || p.category === category);
  const visiblePosts = mode === 2 && posts.length ? [posts[frame % posts.length]] : posts;
  useEffect(() => { if (ready) { setMode(viewIndex[content.defaultView]); setFrame(0); } }, [content.defaultView, ready]);
  if(!ready) return <p role="status">Loading photographs...</p>;
  return <main className={`${s.archive} ${refinement.archive}`} data-mode={mode} data-filters={filters}>
    <header className={s.header}><Link href="/preview/entry" aria-label="Back to welcome" title="Back to welcome"><ArrowLeft size={19}/></Link><div><h1>{content.name}<span>.</span></h1><span>{content.author}</span></div>{socialLinks.length > 0 && <nav className={s.socialLinks} aria-label="Photography links">{socialLinks.map(link => {const Icon=socialIcons[link.platform];return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}><Icon size={19}/></a>;})}</nav>}</header>
    <div className={s.toolbar}>
      <button className={s.filterToggle} aria-label="Photo collections" aria-expanded={filters} aria-controls="photo-collections" title="Photo collections" onClick={() => setFilters(!filters)}><SlidersHorizontal size={18}/>{category !== "All" && <span>{category}</span>}</button>
      <div className={s.modes}><span className={s.modeLabel} aria-live="polite">{modes[mode]}</span><button className={`${camera.engineerDial} ${refinement.dial}`} style={{"--rotation":`${mode*65-65}deg`} as CSSProperties} onClick={() => setMode((mode+1)%3)} onKeyDown={event => {if(["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){event.preventDefault();setMode(event.key === "Home" ? 0 : event.key === "End" ? 2 : (mode+(event.key === "ArrowRight" ? 1 : 2))%3);}}} aria-label={`View: ${modes[mode]}. Switch view`} title="Rotate view dial"><span className={camera.knurl}><span className={camera.rotor}><i/><Aperture size={29} strokeWidth={1}/></span></span></button><div role="group" aria-label="Archive view">{[Rows3,LayoutGrid,Scan].map((Icon,index) => <button key={index} title={modes[index]} aria-label={modes[index]} aria-pressed={mode === index} onClick={() => setMode(index)}><Icon size={18}/></button>)}</div></div>
    </div>
    {filters && <nav id="photo-collections" className={s.collectionPanel} aria-label="Photo collections">{["All", ...content.categories].map(c => <button key={c} aria-pressed={category === c} onClick={() => {setCategory(c);setFrame(0);setFilters(false);}}>{c}</button>)}</nav>}
    {mode === 2 && posts.length > 0 && <div className={s.frameNav}><button aria-label="Previous frame" title="Previous frame" onClick={() => setFrame((frame+posts.length-1)%posts.length)}><ArrowLeft size={18}/></button><span>{String(frame%posts.length+1).padStart(2,"0")} / {String(posts.length).padStart(2,"0")}</span><button aria-label="Next frame" title="Next frame" onClick={() => setFrame((frame+1)%posts.length)}><ArrowRight size={18}/></button></div>}
    <section className={mode === 1 ? s.sheet : s.feed} aria-label={modes[mode]}>{visiblePosts.map((p,i) => <article className={s.post} key={p.slug}><Link className={s.photo} href={`/preview/entry/personal/${p.slug}`} aria-label={`Open ${p.title}`}><img src={p.image} alt={p.alt} loading={i ? "lazy" : "eager"}/></Link><div className={s.caption}><h2>{p.title}</h2><p>{p.caption}</p></div></article>)}</section>
  </main>;
}
