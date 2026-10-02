"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  Aperture, ArrowDown, ArrowUpRight, Camera, Check, ChevronLeft, ChevronRight,
  Code2, Download, Focus, Github, Grid2X2, Linkedin, Mail, Maximize2, Moon,
  Play, RotateCcw, Scan, Sun, Volume2, VolumeX, X
} from "lucide-react";
import { defaultData } from "@/lib/default-data";
import s from "./camera-preview.module.css";

const photographs = [
  { id: "coast", title: "Where the land ends", image: "/camera-preview/coast.jpg", author: "Josh Withers", source: "https://unsplash.com/photos/an-aerial-view-of-the-ocean-and-mountains-Hm6fG5d0CGQ", alt: "Green coastal ridges above the turquoise ocean" },
  { id: "geometry", title: "An exercise in structure", image: "/camera-preview/geometry.jpg", author: "Osman Rana", source: "https://unsplash.com/photos/grayscale-photo-of-concrete-building-5LED2xbiKvk", alt: "Intersecting concrete planes in a monochrome architectural photograph" },
  { id: "stairs", title: "Following the light", image: "/camera-preview/stairs.jpg", author: "Laura Cleffmann", source: "https://unsplash.com/photos/a-black-and-white-photo-of-a-stairway-tYZHgylR-5o", alt: "A concrete staircase leading upward between high walls" }
];

const work = [
  {
    id: "portfolio-cms", title: "Portfolio CMS", category: "Full-stack / content systems",
    summary: "A portfolio I can update without touching the code.",
    description: "Projects, screenshots, resume, and section visibility managed through a private admin dashboard.",
    stack: "Next.js / TypeScript / Supabase", status: "Implemented locally",
    architecture: ["Next.js interface", "Supabase authentication", "Content + visibility", "Image storage"],
    source: "const { data, error } = await supabase\n  .from(\"portfolio_content\")\n  .select(\"content\")\n  .eq(\"id\", \"main\")\n  .single();\n\nreturn mergeData(defaultData, data.content);",
    github: "https://github.com/devyflow/Edge-Resources-Environment-Testing", href: "/", thumbnail: ""
  },
  ...defaultData.projects.map(project => ({
    id: project.id, title: project.title, category: project.kicker,
    summary: project.cardSummary, description: project.outcome,
    stack: project.stack, status: project.status, architecture: project.workflow,
    source: "", github: project.githubUrl || "", href: `/projects/${project.id}`, thumbnail: project.thumbnailUrl || ""
  }))
];

type Mode = "photos" | "work";
type FocusPoint = { x: number; y: number };
type Capture = { id: number; photo: number; aperture: number; exposure: number; mono: boolean; focus: FocusPoint };
const apertures = [4, 8, 16];
const depthLabels = ["Overview", "Architecture", "Source"];

function Dial({ label, value, marks, onChange, disabled = false }: {
  label: string; value: number; marks: string[]; onChange: (value: number) => void; disabled?: boolean;
}) {
  const gesture = useRef<{ y: number; value: number; moved: boolean } | null>(null);
  return (
    <div className={s.dialGroup}>
      <span className={s.controlLabel}>{label}</span>
      <div className={s.dialAssembly}>
        <div className={s.dialLabels} aria-hidden="true">
          {marks.map((mark, index) => <span key={mark} className={value === index ? s.litMark : ""}>{label === "DETAIL DEPTH" ? ["OVR", "ARC", "SRC"][index] : mark}</span>)}
        </div>
        <div
          className={s.dial} role="slider" tabIndex={disabled ? -1 : 0}
          aria-label={label} aria-valuemin={0} aria-valuemax={marks.length - 1}
          aria-valuenow={value} aria-valuetext={marks[value]} aria-disabled={disabled}
          title={`${label}: ${marks[value]}. Drag, click, or use arrow keys.`}
          onKeyDown={event => {
            if (disabled) return;
            if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? marks.length - 1 : value + (["ArrowRight", "ArrowUp"].includes(event.key) ? 1 : -1);
              onChange(Math.max(0, Math.min(marks.length - 1, next)));
            }
          }}
          onPointerDown={event => {
            if (disabled) return;
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            gesture.current = { y: event.clientY, value, moved: false };
          }}
          onPointerMove={event => {
            if (!gesture.current || disabled) return;
            const difference = gesture.current.y - event.clientY;
            if (Math.abs(difference) > 9) gesture.current.moved = true;
            onChange(Math.max(0, Math.min(marks.length - 1, gesture.current.value + Math.round(difference / 28))));
          }}
          onPointerUp={() => {
            if (gesture.current && !gesture.current.moved && !disabled) onChange((value + 1) % marks.length);
            gesture.current = null;
          }}
          onPointerCancel={() => { gesture.current = null; }}
        >
          <div className={s.dialFace} style={{ transform: `rotate(${-55 + value * (110 / Math.max(1, marks.length - 1))}deg)` }}>
            <i /><Aperture size={25} strokeWidth={1} />
          </div>
        </div>
      </div>
      <div className={s.dialSteps}>
        <button type="button" disabled={disabled || value === 0} onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`} title={`Decrease ${label}`}><ChevronLeft size={16} /></button>
        <output>{marks[value]}</output>
        <button type="button" disabled={disabled || value === marks.length - 1} onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`} title={`Increase ${label}`}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

export default function CameraPreview({ photographyOnly = false }: { photographyOnly?: boolean }) {
  const [mode, setMode] = useState<Mode>("photos");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [aperture, setAperture] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [mono, setMono] = useState(false);
  const [grid, setGrid] = useState(false);
  const [light, setLight] = useState(false);
  const [sound, setSound] = useState(false);
  const [focus, setFocus] = useState<FocusPoint>({ x: 50, y: 50 });
  const [focused, setFocused] = useState(false);
  const [shutter, setShutter] = useState(false);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [playback, setPlayback] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const viewfinder = useRef<HTMLDivElement>(null);
  const photoElement = useRef<HTMLImageElement>(null);
  const enlargeButton = useRef<HTMLButtonElement>(null);
  const captureId = useRef(0);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    void audioContext.current?.close();
  }, []);

  useEffect(() => {
    setImageReady(Boolean(photoElement.current?.complete && photoElement.current.naturalWidth > 0));
    setImageError(false);
  }, [mode, photoIndex, playback, playbackIndex]);

  useEffect(() => {
    if (expanded) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [expanded]);

  const shot = playback ? captures[playbackIndex] : undefined;
  const selectedPhoto = photographs[shot?.photo ?? photoIndex];
  const selectedWork = work[projectIndex];
  const currentAperture = shot?.aperture ?? aperture;
  const currentExposure = shot?.exposure ?? exposure;
  const currentMono = shot?.mono ?? mono;
  const currentFocus = shot?.focus ?? focus;
  const photoFilter = `brightness(${2 ** (currentExposure * 0.4)}) grayscale(${currentMono ? 1 : 0})`;
  const blur = currentAperture === 0 ? 3.5 : currentAperture === 1 ? 1 : 0;
  const index = mode === "work" ? projectIndex : playback ? playbackIndex : photoIndex;
  const count = mode === "work" ? work.length : playback ? captures.length : photographs.length;

  function later(callback: () => void, delay: number) {
    timers.current.push(setTimeout(callback, delay));
  }

  function changeMode(next: Mode) {
    setMode(next);
    setPlayback(false);
    setStatus("");
  }

  function advance(step: number) {
    if (!count) return;
    const next = (index + step + count) % count;
    if (mode === "work") setProjectIndex(next);
    else if (playback) setPlaybackIndex(next);
    else { setPhotoIndex(next); setFocus({ x: 50, y: 50 }); }
    setStatus("");
  }

  function focusAt(event: PointerEvent<HTMLDivElement>) {
    if (mode !== "photos" || playback || (event.target as HTMLElement).closest("button, a")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setFocus({ x: Math.min(90, Math.max(10, (event.clientX - rect.left) / rect.width * 100)), y: Math.min(85, Math.max(15, (event.clientY - rect.top) / rect.height * 100)) });
    setFocused(true);
    later(() => setFocused(false), 850);
  }

  function clickSound() {
    if (!sound) return;
    try {
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      void context.resume();
      [0, 0.06].forEach(offset => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(170, context.currentTime + offset);
        gain.gain.setValueAtTime(0.035, context.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + offset + 0.035);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + offset);
        oscillator.stop(context.currentTime + offset + 0.04);
      });
    } catch { setSound(false); }
  }

  function capture() {
    if (shutter || !imageReady || imageError) return;
    clickSound();
    setShutter(true);
    const newShot = { id: ++captureId.current, photo: photoIndex, aperture, exposure, mono, focus: { ...focus } };
    setCaptures(current => [...current, newShot]);
    setStatus(`Frame ${String(captureId.current).padStart(2, "0")} captured in this session.`);
    later(() => setShutter(false), 340);
  }

  async function downloadShot() {
    if (!shot || saving) return;
    setSaving(true);
    try {
      const image = new Image();
      image.src = selectedPhoto.image;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(image.naturalWidth, 1800);
      canvas.height = Math.round(canvas.width * 10 / 16);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image export is unavailable.");
      // Match the viewfinder's cover crop and the two-layer focus simulation.
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      context.filter = `${photoFilter} blur(${blur * canvas.width / (viewfinder.current?.clientWidth || 900)}px)`;
      context.drawImage(image, x, y, width, height);
      context.save();
      context.beginPath();
      context.arc(canvas.width * currentFocus.x / 100, canvas.height * currentFocus.y / 100, canvas.width * 0.24, 0, Math.PI * 2);
      context.clip();
      context.filter = photoFilter;
      context.drawImage(image, x, y, width, height);
      context.restore();
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("Could not export this frame.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `devyflow-${selectedPhoto.id}-frame-${shot.id}.jpg`;
      link.click();
      later(() => URL.revokeObjectURL(url), 2000);
      setStatus("Frame downloaded. Photo credit stays with its original photographer.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Download failed. Please retry."); }
    finally { setSaving(false); }
  }

  function scene(enlarged = false) {
    return mode === "photos" ? (
      <div className={s.photoLayers} style={{ filter: photoFilter }}>
        <img ref={enlarged ? undefined : photoElement} key={selectedPhoto.id} src={selectedPhoto.image} alt={selectedPhoto.alt} style={{ filter: `blur(${blur}px)` }} onLoad={() => setImageReady(true)} onError={() => { setImageReady(false); setImageError(true); }} draggable={false} />
        {blur > 0 && <img src={selectedPhoto.image} alt="" aria-hidden="true" style={{ clipPath: `circle(24% at ${currentFocus.x}% ${currentFocus.y}%)` }} draggable={false} />}
        {imageError && <span className={s.imageFailure}>Photograph could not load.</span>}
      </div>
    ) : (
      <div className={`${s.workScene} ${enlarged ? s.workSceneExpanded : ""}`}>
        <div className={s.workDocument}>
          <span className={s.documentLabel}><Code2 size={15} /> {aperture === 2 ? "SOURCE / TYPESCRIPT" : "ENGINEERING / CASE FILE"}</span>
          <h2>{selectedWork.title}</h2>
          {aperture === 0 ? <><p className={s.workLead}>{selectedWork.summary}</p><p>{selectedWork.description}</p><div className={s.workTags}>{selectedWork.stack.split(/,|\//).slice(0, 5).map(tag => <span key={tag}>{tag.trim()}</span>)}</div></> : aperture === 1 ? <ol className={s.architecture}>{selectedWork.architecture.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span>{step}</li>)}</ol> : selectedWork.source ? <pre><code>{selectedWork.source}</code></pre> : <p>Source link awaiting confirmation.</p>}
          <div className={s.documentFoot}><span>{selectedWork.status}</span><span>{String(projectIndex + 1).padStart(2, "0")}</span></div>
        </div>
      </div>
    );
  }

  return (
    <main className={s.page} data-light={light}>
      {!photographyOnly && <header className={s.header}>
        <Link className={s.wordmark} href="/">devyflow<span>.</span></Link>
        <div className={s.identity}><strong>Devyanshu Agrawal</strong><span>Software engineer. Also behind the lens.</span></div>
        <nav aria-label="Profile links" className={s.profileLinks}>
          <a href={defaultData.profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><Github size={19} /></a>
          <a href={defaultData.profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><Linkedin size={19} /></a>
          <a href={`mailto:${defaultData.profile.email}`} aria-label="Email Devyanshu" title="Email Devyanshu"><Mail size={19} /></a>
          <button type="button" onClick={() => setLight(value => !value)} aria-label={light ? "Use dark appearance" : "Use light appearance"} title="Switch appearance">{light ? <Moon size={19} /> : <Sun size={19} />}</button>
        </nav>
      </header>}

      <section className={s.workspace} aria-label="DevyFlow camera experience">
        <div className={s.workspaceHeading}><span><i /> {photographyOnly ? "THE CONTACT SHEET / 01" : "CAMERA STUDY / 01"}</span><span>AN INTERACTIVE DIRECTION PREVIEW</span></div>
        <div className={s.cameraBody}>
          <div className={s.topPlate}>
            <span className={s.modelName}>DF<span>01</span></span>
            {!photographyOnly && <div className={s.modeTabs} role="group" aria-label="Camera mode">
              <button type="button" aria-pressed={mode === "work"} onClick={() => changeMode("work")}><Code2 size={16} />Work</button>
              <button type="button" aria-pressed={mode === "photos"} onClick={() => changeMode("photos")}><Camera size={16} />Photos</button>
            </div>}
            <div className={s.topReadout}><span>{mode === "photos" ? playback ? "PLAYBACK" : "LIVE VIEW" : "WORK / INSPECT"}</span><strong>{String(index + 1).padStart(2, "0")}<small> / {String(count).padStart(2, "0")}</small></strong></div>
            <div className={s.hotShoe} aria-hidden="true"><i /><i /><i /><i /></div>
          </div>

          <div className={s.screenSide}>
            <div className={s.screenBezel}>
              <div className={`${s.viewfinder} ${shutter ? s.firing : ""}`} ref={viewfinder} onPointerDown={focusAt}>
                {scene()}
                <div className={s.finderTop}><span>{mode === "photos" ? playback ? <Play size={15} /> : <Focus size={15} /> : <Code2 size={15} />}{mode === "photos" ? playback ? "REVIEW" : "AF" : "INSPECT"}</span><span>{mode === "photos" ? currentMono ? "MONO" : "COLOR" : depthLabels[aperture].toUpperCase()}</span></div>
                {grid && <div className={s.thirds} aria-hidden="true"><i /><i /><b /><b /></div>}
                {mode === "photos" && !playback && <div className={`${s.focusBracket} ${focused ? s.focused : ""}`} style={{ left: `${focus.x}%`, top: `${focus.y}%` }} aria-hidden="true"><i /><i /><i /><i /><span>+</span></div>}
                <div className={s.finderBottom}><span>{mode === "photos" ? `f/${apertures[currentAperture]}` : "CASE FILE"}</span><span>{mode === "photos" ? `EV ${currentExposure > 0 ? "+" : ""}${currentExposure.toFixed(1)}` : `${projectIndex + 1} / ${work.length}`}</span><button ref={enlargeButton} type="button" onClick={() => setExpanded(true)} aria-label="Enlarge viewfinder" title="Enlarge viewfinder"><Maximize2 size={17} /></button></div>
                <div className={s.shutterCurtain} aria-hidden="true" />
              </div>
              <div className={s.screenFooter}><span>DEVYFLOW</span><span>{mode === "photos" ? "PHOTOGRAPHIC STUDY" : "SOFTWARE ENGINEERING"}</span><span className={s.screenLed} /></div>
            </div>

            <div className={s.frameCaption}>
              <div><span>{mode === "photos" ? "SELECTED FRAME" : "SELECTED PROJECT"}</span><h1>{mode === "photos" ? selectedPhoto.title : selectedWork.title}</h1></div>
              <div className={s.frameNavigation}><button type="button" onClick={() => advance(-1)} aria-label="Previous frame" title="Previous frame"><ChevronLeft size={20} /></button><button type="button" onClick={() => advance(1)} aria-label="Next frame" title="Next frame"><ChevronRight size={20} /></button></div>
            </div>

            <div className={s.playbackHeader}>
              <div className={s.albumTabs} role="group" aria-label="Photo album">
                <button type="button" aria-pressed={!playback} onClick={() => { setPlayback(false); setStatus(""); }}><Grid2X2 size={14} />{mode === "work" ? "Project archive" : "Contact sheet"}</button>
                {mode === "photos" && <button type="button" disabled={!captures.length} aria-pressed={playback} onClick={() => { setPlaybackIndex(captures.length - 1); setPlayback(true); setStatus(""); }}><Play size={14} />Playback <span>{captures.length}</span></button>}
              </div>
              <span className={s.collectionCount}>{String(count).padStart(2, "0")} {mode === "work" ? "CASES" : "FRAMES"}</span>
            </div>

            <div className={s.filmstrip}>
              {mode === "work" ? work.map((project, i) => <button type="button" key={project.id} aria-label={`Inspect ${project.title}`} aria-pressed={projectIndex === i} onClick={() => setProjectIndex(i)} className={s.filmFrame}><div className={s.workThumbnail}>{project.thumbnail ? <img src={project.thumbnail} alt="" /> : <Code2 size={24} />}<small>{String(i + 1).padStart(2, "0")}</small></div><span>{project.title}</span></button>) : (playback ? captures.map((capture, i) => ({ photo: photographs[capture.photo], i, capture })) : photographs.map((photo, i) => ({ photo, i, capture: undefined as Capture | undefined }))).map(({ photo, i, capture }) => <button type="button" key={capture?.id ?? photo.id} className={s.filmFrame} aria-label={capture ? `Review capture ${i + 1}` : `Select photograph ${photo.title}`} aria-pressed={index === i} onClick={() => { if (playback) setPlaybackIndex(i); else { setPhotoIndex(i); setFocus({ x: 50, y: 50 }); } }}><div><img src={photo.image} alt="" style={capture ? { filter: `brightness(${2 ** (capture.exposure * 0.4)}) grayscale(${capture.mono ? 1 : 0})` } : undefined} /><small>{String(i + 1).padStart(2, "0")}</small></div><span>{photo.title}</span></button>)}
            </div>
          </div>

          <aside className={s.controlSide} aria-label="Camera controls">
            <div className={s.shutterBlock}>
              <span className={s.controlLabel}>{mode === "work" ? "OPEN CASE" : playback ? "LIVE VIEW" : "SHUTTER RELEASE"}</span>
              {mode === "work" ? <Link href={selectedWork.href} className={s.shutterButton} aria-label={`Open ${selectedWork.title}`} title={`Open ${selectedWork.title}`}><span><ArrowUpRight size={25} /></span></Link> : <button type="button" className={s.shutterButton} onPointerDown={() => setFocused(true)} onPointerUp={() => setFocused(false)} onPointerLeave={() => setFocused(false)} disabled={(!imageReady || imageError || shutter) && !playback} onClick={() => playback ? setPlayback(false) : capture()} aria-label={playback ? "Return to live view" : "Capture frame"} title={playback ? "Return to live view" : "Capture frame"}><span>{playback ? <Camera size={24} /> : <Aperture size={26} strokeWidth={1.4} />}</span></button>}
              <small>{mode === "work" ? "Explore the full project" : playback ? "Return to the contact sheet" : "Capture this frame"}</small>
            </div>

            {photographyOnly ? <Dial label="FILM" value={currentMono ? 1 : 0} marks={["COLOR", "MONO"]} onChange={value => setMono(value === 1)} disabled={playback} /> : <Dial label="MODE" value={mode === "work" ? 0 : 1} marks={["WORK", "PHOTO"]} onChange={value => changeMode(value === 0 ? "work" : "photos")} />}
            <Dial label={mode === "work" ? "DETAIL DEPTH" : "APERTURE"} value={currentAperture} marks={mode === "work" ? depthLabels : ["f/4", "f/8", "f/16"]} onChange={setAperture} disabled={playback} />

            {mode === "photos" ? <div className={s.exposureBlock}>
              <label htmlFor="camera-exposure"><span>EXPOSURE</span><output>{currentExposure > 0 ? "+" : ""}{currentExposure.toFixed(1)} EV</output></label>
              <input id="camera-exposure" type="range" min={-2} max={2} step={0.5} value={currentExposure} disabled={playback} onChange={event => setExposure(Number(event.target.value))} />
              <div className={s.exposureTicks} aria-hidden="true"><span>-2</span><span>-1</span><span>0</span><span>+1</span><span>+2</span></div>
              <div className={s.colorModes} role="group" aria-label="Film rendering"><button type="button" disabled={playback} aria-pressed={!currentMono} onClick={() => setMono(false)}>Color</button><button type="button" disabled={playback} aria-pressed={currentMono} onClick={() => setMono(true)}>Mono</button></div>
            </div> : <div className={s.projectActions}><span className={s.controlLabel}>SOURCE</span>{selectedWork.github ? <a href={selectedWork.github} target="_blank" rel="noreferrer"><Github size={17} />Repository<ArrowUpRight size={15} /></a> : <p>Repository link pending.</p>}</div>}

            <div className={s.functionKeys}>
              <button type="button" aria-label="Toggle framing grid" aria-pressed={grid} title="Framing grid" onClick={() => setGrid(value => !value)}><Grid2X2 size={18} /></button>
              {!photographyOnly && <button type="button" aria-label="Toggle shutter sound" aria-pressed={sound} title={sound ? "Mute shutter" : "Enable shutter sound"} onClick={() => setSound(value => !value)}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>}
              <button type="button" aria-label="Reset camera controls" title="Reset camera controls" disabled={playback} onClick={() => { setAperture(1); setExposure(0); setMono(false); setFocus({ x: 50, y: 50 }); setGrid(false); setStatus("Camera controls reset."); }}><RotateCcw size={18} /></button>
            </div>
            {mode === "photos" && playback && <button type="button" className={s.download} disabled={saving} onClick={() => void downloadShot()}><Download size={16} />{saving ? "Exporting..." : "Download frame"}</button>}
            <div className={s.grip} aria-hidden="true" />
          </aside>
        </div>

        <div className={s.underCamera}>
          <p role="status" aria-live="polite">{status ? <><Check size={14} />{status}</> : <><Scan size={14} />{mode === "photos" ? "Sample photographs / controls are a visual simulation" : "Project notes / existing portfolio content"}</>}</p>
          {mode === "photos" && <a href={selectedPhoto.source} target="_blank" rel="noreferrer">Photo: {selectedPhoto.author} / Unsplash <ArrowUpRight size={13} /></a>}
        </div>
      </section>

      {!photographyOnly && <footer className={s.footer}>
        <div><span className={s.footerIndex}>01 / THE EXPERIENCE</span><p>Software in focus.<br /><span>A photographer&apos;s way of looking.</span></p></div>
        <Link href="/">Current portfolio <ArrowUpRight size={17} /></Link>
        <span className={s.previewNote}>Design prototype<ArrowDown size={17} /></span>
      </footer>}

      <dialog ref={dialog} className={s.lightbox} aria-label={mode === "photos" ? selectedPhoto.title : selectedWork.title} onCancel={() => setExpanded(false)} onClose={() => { setExpanded(false); enlargeButton.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }}>
        <div className={s.lightboxHeader}><span>{mode === "photos" ? selectedPhoto.title : selectedWork.title}</span><button type="button" onClick={() => setExpanded(false)} aria-label="Close enlarged view" title="Close"><X size={23} /></button></div>
        <div className={s.enlargedScene}>{scene(true)}</div>
        {mode === "photos" && <p>Sample photograph by {selectedPhoto.author}.</p>}
      </dialog>
    </main>
  );
}
