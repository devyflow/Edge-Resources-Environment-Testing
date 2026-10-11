"use client";

import { useState } from "react";
import Link from "next/link";
import { Aperture, ArrowLeft, BookOpen, Camera, Check, ChevronDown, Eye, EyeOff, GripVertical, Images, LayoutDashboard, Plus, Settings2, Upload, User } from "lucide-react";
import ResponsivePhoto from "./responsive-photo";
import { studioCollections, studioFrames, studioNotes } from "@/lib/beyond-studio-preview-data";
import s from "./beyond-studio-admin-preview.module.css";
import refine from "./beyond-studio-admin-refinement.module.css";

type AdminTab = "overview" | "collections" | "notes" | "frames" | "profile";

const tabs: { id: AdminTab; label: string; icon: typeof Camera }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "collections", label: "Collections", icon: Images },
  { id: "notes", label: "Field notes", icon: BookOpen },
  { id: "frames", label: "Frames", icon: Camera },
  { id: "profile", label: "Profile & links", icon: User }
];

export default function BeyondStudioAdminPreview() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [defaultView, setDefaultView] = useState("contact");
  const [fitOriginals, setFitOriginals] = useState(false);
  const [quiet, setQuiet] = useState(true);
  const [published, setPublished] = useState<Record<string, boolean>>(() => Object.fromEntries(studioFrames.map(frame => [frame.slug, true])));
  const [collectionStatus, setCollectionStatus] = useState<Record<string, boolean>>({ "Festival After Dark": true, "Blue Studies": true });
  const [showMetadata, setShowMetadata] = useState(false);
  const [focal, setFocal] = useState({ x: 50, y: 50 });
  const frame = studioFrames[selectedFrame];

  return <main className={s.admin}>
    <header className={s.topbar}><Link href="/preview/beyond-studio" className={s.brand}><Aperture size={24} /><span>Beyond Studio</span><small>Design preview</small></Link><div><span className={s.unsaved}>PREVIEW ONLY / CHANGES ARE NOT SAVED</span><Link href="/admin">Current admin</Link><Link href="/preview/beyond-studio">Open public preview</Link></div></header>
    <aside className={s.sidebar}>
      <Link href="/preview/entry/personal"><ArrowLeft size={16} />Current photography</Link>
      <nav aria-label="Photography admin sections">{tabs.map(item => { const Icon = item.icon; return <button key={item.id} aria-current={tab === item.id ? "page" : undefined} onClick={() => setTab(item.id)}><Icon size={17} />{item.label}</button>; })}</nav>
      <div className={s.publishSummary}><span>PUBLIC ARCHIVE</span><strong>5 frames live</strong><small>Last preview: just now</small></div>
    </aside>

    <section className={s.workspace}>
      {tab === "overview" && <>
        <header className={s.pageHeader}><div><span>PHOTOGRAPHY CONTROLS</span><h1>Archive overview</h1><p>The settings that shape the first public view.</p></div><button className={`${s.primary} ${refine.primary}`}><Check size={17} /><span>Save settings</span></button></header>
        <div className={s.controlGrid}>
          <section><div className={s.sectionTitle}><Settings2 size={18} /><div><h2>Public defaults</h2><p>How visitors enter the archive.</p></div></div><label><span>Default view</span><select value={defaultView} onChange={event => setDefaultView(event.target.value)}><option value="contact">Contact sheet</option><option value="feed">Photo feed</option><option value="frame">Single frame</option></select></label><Toggle label="Fit original aspect ratios" note="Avoid square crops in the contact sheet." checked={fitOriginals} onChange={setFitOriginals} /><Toggle label="Quiet shutter by default" note="Visual shutter remains; sound is optional." checked={quiet} onChange={setQuiet} /></section>
          <section><div className={s.sectionTitle}><Eye size={18} /><div><h2>Publishing health</h2><p>Everything required before going live.</p></div></div><ul className={s.health}><li><Check size={16} />5 frames have titles and alt text</li><li><Check size={16} />2 collection covers selected</li><li><Check size={16} />Instagram link is visible</li><li><span>!</span>Camera metadata is optional and empty</li></ul></section>
        </div>
        <section className={s.previewStrip}><div><span>PUBLIC PREVIEW</span><h2>Contact sheet at a glance</h2></div><div>{studioFrames.map(item => <ResponsivePhoto key={item.slug} src={item.image} alt="" sizes="120px" />)}</div></section>
      </>}

      {tab === "collections" && <>
        <header className={s.pageHeader}><div><span>CURATED SEQUENCES</span><h1>Collections</h1><p>Choose the cover, order, and publishing state.</p></div><button className={`${s.primary} ${refine.primary}`}><Plus size={17} /><span>New collection</span></button></header>
        <div className={s.collectionTable}><div className={s.tableHead}><span>Order</span><span>Collection</span><span>Cover</span><span>Frames</span><span>Status</span></div>{studioCollections.map((item, index) => <article key={item.name}><button className={s.drag} title="Reorder collection"><GripVertical size={18} /></button><div><strong>{item.name}</strong><small>{item.summary}</small></div><ResponsivePhoto src={item.cover} alt="" sizes="72px" /><span>{item.count}</span><button className={s.status} data-live={collectionStatus[item.name]} onClick={() => setCollectionStatus({ ...collectionStatus, [item.name]: !collectionStatus[item.name] })}>{collectionStatus[item.name] ? <><Eye size={15} />Published</> : <><EyeOff size={15} />Draft</>}</button></article>)}</div>
      </>}

      {tab === "notes" && <>
        <header className={s.pageHeader}><div><span>MULTI-PHOTO STORIES</span><h1>Field notes</h1><p>Draft photo walks, observations, and building notes.</p></div><button className={`${s.primary} ${refine.primary}`}><Plus size={17} /><span>New note</span></button></header>
        <div className={s.noteList}>{studioNotes.map((note, index) => <article key={note.id}><span>{String(index + 1).padStart(2, "0")}</span><ResponsivePhoto src={note.image} alt="" sizes="110px" /><div><small>{note.label}</small><strong>{note.title}</strong><p>{note.excerpt}</p></div><span className={s.draft}>Draft</span><button aria-label={`Open ${note.title}`}><ChevronDown size={17} /></button></article>)}</div>
      </>}

      {tab === "frames" && <>
        <header className={s.pageHeader}><div><span>FRAME LIBRARY</span><h1>Photos</h1><p>Copy, crop focus, capture details, and visibility.</p></div><button className={`${s.primary} ${refine.primary}`}><Upload size={17} /><span>Upload frames</span></button></header>
        <div className={s.frameWorkspace}>
          <aside className={s.frameRail}>{studioFrames.map((item, index) => <button key={item.slug} aria-current={selectedFrame === index ? "true" : undefined} onClick={() => setSelectedFrame(index)}><span>{String(index + 1).padStart(2, "0")}</span><ResponsivePhoto src={item.image} alt="" sizes="70px" /><div><strong>{item.title}</strong><small>{item.collection}</small></div>{published[item.slug] ? <Eye size={14} /> : <EyeOff size={14} />}</button>)}</aside>
          <section className={s.frameEditor}>
            <div className={s.editorHead}><div><span>FRAME {String(selectedFrame + 1).padStart(2, "0")}</span><strong>{frame.slug}</strong></div><button className={s.status} data-live={published[frame.slug]} onClick={() => setPublished({ ...published, [frame.slug]: !published[frame.slug] })}>{published[frame.slug] ? <><Eye size={15} />Published</> : <><EyeOff size={15} />Draft</>}</button></div>
            <button className={s.focalPreview} onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); setFocal({ x: Math.round((event.clientX - rect.left) / rect.width * 100), y: Math.round((event.clientY - rect.top) / rect.height * 100) }); }}><ResponsivePhoto src={frame.image} alt={frame.alt} sizes="700px" priority /><i style={{ left: `${focal.x}%`, top: `${focal.y}%` }} /><span>Click to set crop focus / {focal.x}% {focal.y}%</span></button>
            <div className={s.fields}><label><span>Two-word title</span><input defaultValue={frame.title} /></label><label><span>Collection</span><select defaultValue={frame.collection}>{studioCollections.map(item => <option key={item.name}>{item.name}</option>)}</select></label><label className={s.wide}><span>Brief caption</span><input defaultValue={frame.caption} /></label><label className={s.wide}><span>Image description</span><input defaultValue={frame.alt} /></label></div>
            <details className={s.metadata} open={showMetadata} onToggle={event => setShowMetadata(event.currentTarget.open)}><summary>Camera metadata <span>{showMetadata ? "Hide" : "Optional"}</span></summary><div><label><span>Camera</span><input placeholder="Only when known" /></label><label><span>Lens</span><input placeholder="Only when known" /></label><label><span>Exposure</span><input placeholder="Only when known" /></label><Toggle label="Show metadata publicly" note="Hidden automatically when fields are empty." checked={false} onChange={() => {}} /></div></details>
          </section>
        </div>
      </>}

      {tab === "profile" && <>
        <header className={s.pageHeader}><div><span>IDENTITY & CONNECTIONS</span><h1>Profile and links</h1><p>Keep only the destinations you want visitors to see.</p></div><button className={`${s.primary} ${refine.primary}`}><Check size={17} /><span>Save profile</span></button></header>
        <div className={s.profileGrid}><section><h2>Archive identity</h2><label><span>Archive name</span><input defaultValue="Beyond the Code" /></label><label><span>Photographer</span><input defaultValue="Devyanshu Agrawal" /></label><label><span>Short introduction</span><textarea defaultValue="Photography as a record of streets, celebrations, experiments, and the moments around what I build." /></label></section><section><h2>Public links</h2><LinkRow label="Instagram" value="https://www.instagram.com/dbeing._/" visible /><LinkRow label="YouTube" value="" /><LinkRow label="Pinterest" value="" /><LinkRow label="X" value="" /><button className={s.addLink}><Plus size={16} />Add another website</button></section></div>
      </>}
    </section>
  </main>;
}

function Toggle({ label, note, checked, onChange }: { label: string; note: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className={`${s.toggle} ${refine.toggle}`}><span><strong>{label}</strong><small>{note}</small></span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /><i /></label>;
}

function LinkRow({ label, value, visible = false }: { label: string; value: string; visible?: boolean }) {
  const [shown, setShown] = useState(visible);
  return <div className={s.linkRow}><label><span>{label}</span><input defaultValue={value} placeholder="https://" /></label><button aria-pressed={shown} onClick={() => setShown(!shown)} disabled={!value}>{shown ? <Eye size={16} /> : <EyeOff size={16} />}</button></div>;
}
