"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Aperture, ArrowLeft, ArrowRight, BookOpen, Check, Copy, Expand, Grid3X3, Images, Info, Instagram, Maximize2, Scan, Share2, SlidersHorizontal, User, Volume2, VolumeX, X } from "lucide-react";
import ResponsivePhoto from "./responsive-photo";
import { studioCollections, studioFrames, studioNotes, type StudioFrame } from "@/lib/beyond-studio-preview-data";
import s from "./beyond-studio-preview.module.css";

type StudioSection = "photos" | "collections" | "notes" | "about";
type StudioMode = "contact" | "feed" | "frame";

const modes: { id: StudioMode; label: string; icon: typeof Grid3X3 }[] = [
  { id: "contact", label: "Contact sheet", icon: Grid3X3 },
  { id: "feed", label: "Photo feed", icon: Images },
  { id: "frame", label: "Single frame", icon: Scan }
];

export default function BeyondStudioPreview() {
  const [section, setSection] = useState<StudioSection>("photos");
  const [mode, setMode] = useState<StudioMode>("contact");
  const [fitOriginals, setFitOriginals] = useState(false);
  const [quiet, setQuiet] = useState(true);
  const [modeMenu, setModeMenu] = useState(false);
  const [collection, setCollection] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [grid, setGrid] = useState(false);
  const [details, setDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shutter, setShutter] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const frames = collection ? studioFrames.filter(frame => frame.collection === collection) : studioFrames;
  const activeFrame = selected === null ? null : studioFrames[selected];
  const modeIndex = modes.findIndex(item => item.id === mode);

  function clickSound() {
    if (quiet) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(90, context.currentTime);
      gain.gain.setValueAtTime(0.025, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.045);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.05);
      oscillator.addEventListener("ended", () => void context.close());
    } catch {}
  }

  function openFrame(frame: StudioFrame) {
    clickSound();
    setShutter(true);
    setSelected(studioFrames.findIndex(item => item.slug === frame.slug));
    setTimeout(() => setShutter(false), 360);
  }

  function stepViewer(delta: number) {
    if (selected === null) return;
    clickSound();
    setShutter(true);
    setSelected((selected + delta + studioFrames.length) % studioFrames.length);
    setTimeout(() => setShutter(false), 300);
  }

  async function shareFrame() {
    if (!activeFrame) return;
    const url = `${window.location.origin}${window.location.pathname}#${activeFrame.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: activeFrame.title, text: activeFrame.caption, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  }

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowLeft") stepViewer(-1);
      if (event.key === "ArrowRight") stepViewer(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function showCollection(name: string) {
    setCollection(name);
    setFrameIndex(0);
    setSection("photos");
  }

  return <main className={s.studio}>
    <header className={s.header}>
      <Link href="/preview/entry/personal" className={s.back}><ArrowLeft size={17} />Current archive</Link>
      <div className={s.identity}><span>DEVYFLOW / VISUAL ARCHIVE</span><h1>Beyond the Code<span>.</span></h1><p>Photographs and field notes by Devyanshu Agrawal.</p></div>
      <nav className={s.social}><a href="https://www.instagram.com/dbeing._/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><Instagram size={19} /></a><Link href="/preview/beyond-studio/admin">Admin preview</Link></nav>
    </header>

    <nav className={s.sections} aria-label="Photography sections">
      <button aria-current={section === "photos" ? "page" : undefined} onClick={() => setSection("photos")}><Images size={17} />All photos</button>
      <button aria-current={section === "collections" ? "page" : undefined} onClick={() => setSection("collections")}><Grid3X3 size={17} />Collections</button>
      <button aria-current={section === "notes" ? "page" : undefined} onClick={() => setSection("notes")}><BookOpen size={17} />Field notes</button>
      <button aria-current={section === "about" ? "page" : undefined} onClick={() => setSection("about")}><User size={17} />About</button>
    </nav>

    {section === "photos" && <>
      <section className={s.archiveHead}>
        <div><span className={s.eyebrow}>ALL PHOTOS / {String(frames.length).padStart(2, "0")} FRAMES</span><h2>{collection ?? "The working archive"}</h2>{collection && <button className={s.clearFilter} onClick={() => setCollection(null)}><X size={14} />Clear collection</button>}</div>
        <div className={s.cameraControls}>
          <button className={s.fitButton} aria-pressed={fitOriginals} onClick={() => setFitOriginals(!fitOriginals)}><Expand size={17} />Fit originals</button>
          <div className={s.modeControl}>
            <button className={s.modeLabel} aria-expanded={modeMenu} onClick={() => setModeMenu(!modeMenu)}>{modes[modeIndex].label}</button>
            <button className={s.dial} style={{ "--dial-angle": `${modeIndex * 72 - 72}deg` } as CSSProperties} onClick={() => setMode(modes[(modeIndex + 1) % modes.length].id)} aria-label={`View: ${modes[modeIndex].label}. Rotate dial`}><span><i /><Aperture size={29} strokeWidth={1.3} /></span></button>
            {modeMenu && <div className={s.modeMenu}>{modes.map(item => { const Icon = item.icon; return <button key={item.id} aria-pressed={mode === item.id} onClick={() => { setMode(item.id); setModeMenu(false); }}><Icon size={17} />{item.label}</button>; })}</div>}
          </div>
        </div>
      </section>

      {mode === "contact" && <section className={s.contactSheet} data-fit={fitOriginals} aria-label="Contact sheet">{frames.map((frame, index) => <article key={frame.slug} data-orientation={frame.orientation}><button className={s.frameImage} onClick={() => openFrame(frame)}><ResponsivePhoto src={frame.image} alt={frame.alt} sizes="(max-width: 680px) 50vw, 25vw" priority={index < 4} /></button><div><span>{String(studioFrames.indexOf(frame) + 1).padStart(2, "0")}</span><h3>{frame.title}</h3><p>{frame.caption}</p></div></article>)}</section>}

      {mode === "feed" && <section className={s.feed} aria-label="Photo feed">{frames.map((frame, index) => <article key={frame.slug}><button className={s.feedImage} onClick={() => openFrame(frame)}><ResponsivePhoto src={frame.image} alt={frame.alt} sizes="(max-width: 900px) 100vw, 920px" priority={index === 0} /></button><div><span>{String(studioFrames.indexOf(frame) + 1).padStart(2, "0")} / {frame.collection}</span><h3>{frame.title}</h3><p>{frame.caption}</p></div></article>)}</section>}

      {mode === "frame" && frames.length > 0 && <section className={s.singleFrame} aria-label="Single frame"><div className={s.frameCounter}><button onClick={() => setFrameIndex((frameIndex + frames.length - 1) % frames.length)} aria-label="Previous frame"><ArrowLeft size={18} /></button><span>{String(frameIndex % frames.length + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}</span><button onClick={() => setFrameIndex((frameIndex + 1) % frames.length)} aria-label="Next frame"><ArrowRight size={18} /></button></div><button className={s.singleImage} onClick={() => openFrame(frames[frameIndex % frames.length])}><ResponsivePhoto src={frames[frameIndex % frames.length].image} alt={frames[frameIndex % frames.length].alt} sizes="100vw" priority /></button><h3>{frames[frameIndex % frames.length].title}</h3><p>{frames[frameIndex % frames.length].caption}</p></section>}
    </>}

    {section === "collections" && <section className={s.contentSection}><span className={s.eyebrow}>CURATED SEQUENCES</span><h2>Collections</h2><p className={s.sectionIntro}>Small groups with an intentional order, rather than another filter bar.</p><div className={s.collectionGrid}>{studioCollections.map((item, index) => <article key={item.name}><button onClick={() => showCollection(item.name)}><ResponsivePhoto src={item.cover} alt="" sizes="(max-width: 720px) 100vw, 50vw" priority={index === 0} /></button><span>{String(index + 1).padStart(2, "0")} / {item.count} FRAMES</span><h3>{item.name}</h3><p>{item.summary}</p><button className={s.textAction} onClick={() => showCollection(item.name)}>Open collection <ArrowRight size={16} /></button></article>)}</div></section>}

    {section === "notes" && <section className={s.contentSection}><span className={s.eyebrow}>WORDS AROUND THE FRAMES</span><h2>Field notes</h2><p className={s.sectionIntro}>Photo walks, edit decisions, and observations between software builds.</p><div className={s.notes}>{studioNotes.map((note, index) => <article key={note.id}><div><span>{note.label}</span><h3>{note.title}</h3><p>{note.excerpt}</p><small>{note.date}</small></div><ResponsivePhoto src={note.image} alt="" sizes="(max-width: 720px) 100vw, 36vw" priority={index === 0} /></article>)}</div></section>}

    {section === "about" && <section className={s.about}><div><span className={s.eyebrow}>ABOUT THE ARCHIVE</span><h2>Attention, collected.</h2></div><div><p>I use photography to document streets, celebrations, experiments, and the moments around what I build. This archive is a record of looking carefully.</p><p>The camera details stay optional. When real capture data is available it can appear beside a frame; when it is not, the photograph stands on its own.</p><a href="https://www.instagram.com/dbeing._/" target="_blank" rel="noreferrer"><Instagram size={17} />Connect on Instagram</a></div></section>}

    <button className={s.quietControl} aria-pressed={quiet} onClick={() => setQuiet(!quiet)} title={quiet ? "Enable subtle shutter sound" : "Use quiet shutter"}>{quiet ? <VolumeX size={17} /> : <Volume2 size={17} />}<span>{quiet ? "Quiet shutter" : "Shutter sound"}</span></button>

    {activeFrame && <div className={s.viewer} ref={viewerRef} role="dialog" aria-modal="true" aria-label={activeFrame.title}>
      <div className={s.viewerBar}><button onClick={() => setSelected(null)}><X size={19} /><span>Close</span></button><span>{String(selected! + 1).padStart(2, "0")} / {String(studioFrames.length).padStart(2, "0")}</span><div><button aria-pressed={grid} onClick={() => setGrid(!grid)} title="Composition grid"><Grid3X3 size={18} /></button><button aria-pressed={details} onClick={() => setDetails(!details)} title="Frame details"><Info size={18} /></button><button onClick={() => void shareFrame()} title="Share frame">{copied ? <Check size={18} /> : <Share2 size={18} />}</button><button onClick={() => void viewerRef.current?.requestFullscreen()} title="Fullscreen"><Maximize2 size={18} /></button></div></div>
      <div className={s.viewerStage}><button onClick={() => stepViewer(-1)} aria-label="Previous photo"><ArrowLeft size={22} /></button><div className={s.viewerImage}><ResponsivePhoto src={activeFrame.image} alt={activeFrame.alt} sizes="100vw" priority />{grid && <i className={s.gridGuide} />}</div><button onClick={() => stepViewer(1)} aria-label="Next photo"><ArrowRight size={22} /></button></div>
      <div className={s.viewerCopy}><div><span>{activeFrame.collection}</span><h2>{activeFrame.title}</h2><p>{activeFrame.caption}</p></div>{details && <dl><div><dt>Frame</dt><dd>{String(selected! + 1).padStart(2, "0")}</dd></div><div><dt>Orientation</dt><dd>{activeFrame.orientation}</dd></div><div><dt>Capture data</dt><dd>Not supplied</dd></div></dl>}</div>
      <nav className={s.filmstrip} aria-label="All frames">{studioFrames.map((frame, index) => <button key={frame.slug} aria-current={selected === index ? "true" : undefined} onClick={() => setSelected(index)}><ResponsivePhoto src={frame.image} alt="" sizes="90px" /></button>)}</nav>
    </div>}
    <i className={s.shutter} data-active={shutter} aria-hidden="true" />
  </main>;
}
