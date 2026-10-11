"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Aperture, ArrowLeft, ArrowRight, AtSign, BookOpen, Expand, Globe2, Grid3X3, Images, Instagram, Linkedin, Pin, Scan, User, X, Youtube } from "lucide-react";
import type { PhotographyContent, PhotoSectionId, PhotoSocialPlatform } from "@/lib/photography-content";
import { useExperience } from "./entry-experience-shell";
import { usePhotography } from "./use-photography";
import ResponsivePhoto from "./responsive-photo";
import s from "./beyond-studio-preview.module.css";
import live from "./beyond-studio-live.module.css";

type StudioSection = PhotoSectionId;
type StudioMode = "contact" | "feed" | "frame";

const modes: { id: StudioMode; label: string; icon: typeof Grid3X3 }[] = [
  { id: "contact", label: "Contact sheet", icon: Grid3X3 },
  { id: "feed", label: "Photo feed", icon: Images },
  { id: "frame", label: "Single frame", icon: Scan }
];
const socialIcons = { instagram: Instagram, youtube: Youtube, pinterest: Pin, x: AtSign, threads: AtSign, bluesky: Globe2, linkedin: Linkedin, behance: Globe2, flickr: Globe2, fivehundredpx: Globe2, website: Globe2, custom: Globe2 } satisfies Record<PhotoSocialPlatform, typeof Instagram>;
const sectionIcons = { photos: Images, collections: Grid3X3, notes: BookOpen, about: User } satisfies Record<PhotoSectionId, typeof Images>;

const archiveStateKey = "devyflow-photography-archive-state";

export default function BeyondStudioLive({ initialContent }: { initialContent: PhotographyContent }) {
  const { content } = usePhotography(initialContent);
  const allFrames = content.posts.filter(frame => frame.visible && frame.image);
  const availableModes = modes;
  const [section, setSection] = useState<StudioSection>(content.defaultSection);
  const [mode, setMode] = useState<StudioMode>(content.defaultView);
  const [fitOriginals, setFitOriginals] = useState(content.fitOriginals);
  const [modeMenu, setModeMenu] = useState(false);
  const [collection, setCollection] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const { sound, toggleSound, shutter } = useExperience();
  const frames = collection ? allFrames.filter(frame => frame.category === collection) : allFrames;
  const modeIndex = Math.max(0, availableModes.findIndex(item => item.id === mode));
  const socialLinks = content.socialLinks.filter(link => link.visible && /^https?:\/\//.test(link.url));
  const notes = content.fieldNotes.filter(note => note.status === "published");
  const collections = content.collectionDetails.filter(item => item.visible).map(item => ({
    ...item,
    frames: allFrames.filter(frame => frame.category === item.name),
    cover: allFrames.find(frame => frame.slug === item.coverSlug) ?? allFrames.find(frame => frame.category === item.name)
  })).filter(item => item.cover && item.frames.length);
  const matureCollections = collections.filter((item) => item.frames.length >= 3);
  const visibleSections = content.sections.filter((item) => item.visible && (item.id !== "collections" || matureCollections.length >= 2));

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(archiveStateKey);
      if (!saved) return;
      const state = JSON.parse(saved) as Partial<{ section: StudioSection; mode: StudioMode; fitOriginals: boolean; collection: string | null; frameIndex: number; scrollY: number }>;
      if (state.section && visibleSections.some((item) => item.id === state.section)) setSection(state.section);
      if (state.mode) setMode(state.mode);
      if (typeof state.fitOriginals === "boolean") setFitOriginals(state.fitOriginals);
      setCollection(state.collection ?? null);
      if (typeof state.frameIndex === "number") setFrameIndex(state.frameIndex);
      sessionStorage.removeItem(archiveStateKey);
      requestAnimationFrame(() => window.scrollTo({ top: state.scrollY ?? 0 }));
    } catch {}
  }, []);
  useEffect(() => {
    if (!visibleSections.some((item) => item.id === section)) setSection(visibleSections[0]?.id ?? "photos");
  }, [section, visibleSections]);
  useEffect(() => {
    try { if (localStorage.getItem("devyflow-shutter") === null && content.quietShutter && sound) toggleSound(); } catch {}
  }, [content.quietShutter, sound, toggleSound]);

  function showCollection(name: string) {
    setCollection(name);
    setFrameIndex(0);
    setSection("photos");
  }

  function rememberArchive() {
    try {
      sessionStorage.setItem(archiveStateKey, JSON.stringify({ section, mode, fitOriginals, collection, frameIndex, scrollY: window.scrollY }));
    } catch {}
  }

  function openFrame() {
    rememberArchive();
    shutter();
  }

  const imageStyle = (focalX?: number, focalY?: number): CSSProperties => ({ objectPosition: `${focalX ?? 50}% ${focalY ?? 50}%` });

  return <main className={s.studio}>
    <header className={s.header}>
      <Link href="/" className={s.back}><ArrowLeft size={17} />devyflow.</Link>
      <div className={s.identity}><span>DEVYFLOW / VISUAL ARCHIVE</span><h1>{content.name}<span>.</span></h1><p>Photographs and field notes by {content.author}.</p></div>
      {socialLinks.length > 0 && <nav className={s.social} aria-label="Photography links">{socialLinks.map(link => { const Icon = socialIcons[link.platform] ?? Globe2; return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}><Icon size={19} /></a>; })}</nav>}
    </header>

    <nav className={s.sections} aria-label="Photography sections">
      {visibleSections.map((item) => { const Icon = sectionIcons[item.id]; return <button key={item.id} aria-current={section === item.id ? "page" : undefined} onClick={() => setSection(item.id)}><Icon size={17} />{item.label}</button>; })}
    </nav>

    {section === "photos" && <>
      <section className={s.archiveHead}>
        <div><span className={s.eyebrow}>ALL PHOTOS / {String(frames.length).padStart(2, "0")} FRAMES</span><h2>{collection ?? "The working archive"}</h2>{collection && <button className={s.clearFilter} onClick={() => setCollection(null)}><X size={14} />Clear collection</button>}</div>
        <div className={s.cameraControls}>
          <button className={s.fitButton} aria-pressed={fitOriginals} onClick={() => setFitOriginals(!fitOriginals)} title="Fit the complete photograph inside each contact-sheet frame"><Expand size={17} /><span>Fit frame</span></button>
          <div className={s.modeControl}>
            <button className={s.modeLabel} aria-expanded={modeMenu} onClick={() => setModeMenu(!modeMenu)}>{availableModes[modeIndex].label}</button>
            <button className={s.dial} style={{ "--dial-angle": `${modeIndex * 72 - 72}deg` } as CSSProperties} onClick={() => setMode(availableModes[(modeIndex + 1) % availableModes.length].id)} aria-label={`View: ${availableModes[modeIndex].label}. Rotate dial`}><span><i /><Aperture size={29} strokeWidth={1.3} /></span></button>
            {modeMenu && <div className={s.modeMenu}>{availableModes.map(item => { const Icon = item.icon; return <button key={item.id} aria-pressed={mode === item.id} onClick={() => { setMode(item.id); setModeMenu(false); }}><Icon size={17} />{item.label}</button>; })}</div>}
          </div>
        </div>
      </section>

      {mode === "contact" && <section className={s.contactSheet} data-fit={fitOriginals} aria-label="Contact sheet">{frames.map((frame, index) => <article key={frame.slug}><Link className={s.frameImage} href={`/photography/${frame.slug}`} aria-label={`Open ${frame.title}`} onClick={openFrame}><ResponsivePhoto src={frame.image} alt={frame.alt} width={frame.width} height={frame.height} sizes="(max-width: 900px) 50vw, 33vw" priority={index < 2} style={imageStyle(frame.focalX, frame.focalY)} />{content.legal.watermarkEnabled && <span className={s.frameCode}>{frame.displayCode}</span>}</Link><div><h3>{frame.title}</h3><p>{frame.caption}</p></div></article>)}</section>}

      {mode === "feed" && <section className={s.feed} aria-label="Photo feed">{frames.map((frame, index) => <article key={frame.slug}><Link className={s.feedImage} href={`/photography/${frame.slug}`} aria-label={`Open ${frame.title}`} onClick={openFrame}><ResponsivePhoto src={frame.image} alt={frame.alt} width={frame.width} height={frame.height} sizes="(max-width: 900px) 100vw, 920px" priority={index === 0} />{content.legal.watermarkEnabled && <span className={s.frameCode}>{frame.displayCode}</span>}</Link><div><span>{frame.displayCode} / {frame.category}</span><h3>{frame.title}</h3><p>{frame.caption}</p></div></article>)}</section>}

      {mode === "frame" && frames.length > 0 && <section className={s.singleFrame} aria-label="Single frame"><div className={s.frameCounter}><button onClick={() => { shutter(); setFrameIndex((frameIndex + frames.length - 1) % frames.length); }} aria-label="Previous frame"><ArrowLeft size={18} /></button><span>{frames[frameIndex % frames.length].displayCode} / {String(frames.length).padStart(2, "0")}</span><button onClick={() => { shutter(); setFrameIndex((frameIndex + 1) % frames.length); }} aria-label="Next frame"><ArrowRight size={18} /></button></div><Link className={s.singleImage} href={`/photography/${frames[frameIndex % frames.length].slug}`} onClick={openFrame}><ResponsivePhoto src={frames[frameIndex % frames.length].image} alt={frames[frameIndex % frames.length].alt} width={frames[frameIndex % frames.length].width} height={frames[frameIndex % frames.length].height} sizes="100vw" priority />{content.legal.watermarkEnabled && <span className={s.frameCode}>{frames[frameIndex % frames.length].displayCode}</span>}</Link><h3>{frames[frameIndex % frames.length].title}</h3><p>{frames[frameIndex % frames.length].caption}</p></section>}
    </>}

    {section === "collections" && <section className={s.contentSection}><span className={s.eyebrow}>CURATED SEQUENCES</span><h2>Collections</h2><p className={s.sectionIntro}>Small groups with an intentional order, rather than another filter bar.</p><div className={s.collectionGrid}>{matureCollections.map((item, index) => <article key={item.name}><button onClick={() => showCollection(item.name)}><ResponsivePhoto src={item.cover!.image} alt="" width={item.cover!.width} height={item.cover!.height} sizes="(max-width: 720px) 100vw, 50vw" priority={index === 0} style={imageStyle(item.cover!.focalX, item.cover!.focalY)} /></button><span>{String(index + 1).padStart(2, "0")} / {item.frames.length} FRAMES</span><h3>{item.name}</h3><p>{item.summary}</p><button className={s.textAction} onClick={() => showCollection(item.name)}>Open collection <ArrowRight size={16} /></button></article>)}</div></section>}

    {section === "notes" && <section className={s.contentSection}><span className={s.eyebrow}>WORDS AROUND THE FRAMES</span><h2>Field notes</h2><p className={s.sectionIntro}>Photo walks, edit decisions, and observations between software builds.</p>{notes.length ? <div className={live.notes}>{notes.map((note, index) => { const noteFrames = note.photoSlugs.map((slug) => allFrames.find((frame) => frame.slug === slug)).filter((frame): frame is NonNullable<typeof frame> => Boolean(frame)); return <details className={live.note} key={note.id}><summary><div><span>{note.label}</span><h3>{note.title}</h3><p>{note.excerpt}</p><small>{note.date || "Field note"}</small></div>{note.image && <ResponsivePhoto src={note.image} alt="" sizes="(max-width: 720px) 100vw, 260px" priority={index === 0} />}</summary><div className={live.noteBody}><p>{note.body}</p>{noteFrames.length > 0 && <><span className={live.noteRefs}>Related frames</span><div className={live.noteFrames}>{noteFrames.map((frame) => <Link key={frame.slug} href={`/photography/${frame.slug}`} onClick={openFrame}><ResponsivePhoto src={frame.image} alt={frame.alt} width={frame.width} height={frame.height} sizes="(max-width: 720px) 50vw, 220px" /><span>{frame.displayCode}</span></Link>)}</div></>}</div></details>; })}</div> : <p className={s.sectionIntro}>Field notes are being prepared.</p>}</section>}

    {section === "about" && <section className={s.about}><div><span className={s.eyebrow}>VARANASI / INDIA</span><h2>Attention, collected.</h2></div><div><p>{content.about}</p><p>Camera details appear only when real capture data has been added to a frame.</p>{socialLinks.map(link => { const Icon = socialIcons[link.platform] ?? Globe2; return <a key={link.id} href={link.url} target="_blank" rel="noreferrer"><Icon size={17} />Connect on {link.label}</a>; })}<div className={s.usePolicy}><strong>Photo use policy</strong><p>{content.legal.usePolicy}</p><span>Credit: {content.legal.creditName} / {content.legal.creditInstagram} / {content.legal.creditWebsite}</span></div></div></section>}

    <footer className={s.archiveFooter}><span>© {content.legal.copyrightYear} {content.legal.copyrightHolder}</span><span>{content.legal.trademarkNotice}</span><button type="button" onClick={() => { setSection("about"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Photo use policy</button></footer>
  </main>;
}
