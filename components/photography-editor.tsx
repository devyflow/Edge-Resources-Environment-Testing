"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, BookOpen, Camera, Crosshair, Eye, EyeOff, Link2, Plus, ShieldCheck, Trash2, Upload } from "lucide-react";
import { normalizePhotography, type PhotoArchiveView, type PhotoCollection, type PhotoFieldNote, type PhotographyContent, type PhotoPost, type PhotoSectionId, type PhotoSocialLink, type PhotoSocialPlatform } from "@/lib/photography-content";
import s from "./photography-editor.module.css";
import v2 from "./photography-editor-v2.module.css";

export default function PhotographyEditor({ value, onChange }: { value?: PhotographyContent; onChange: (value: PhotographyContent) => void }) {
  const data = normalizePhotography(value);
  const [selected, setSelected] = useState(data.posts[0]?.slug ?? "");
  const [newCollection, setNewCollection] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const post = data.posts.find((item) => item.slug === selected);
  const index = data.posts.findIndex((item) => item.slug === selected);

  useEffect(() => {
    if (!data.posts.some((item) => item.slug === selected)) setSelected(data.posts[0]?.slug ?? "");
  }, [data.posts, selected]);

  function patch(update: Partial<PhotoPost>) {
    onChange({ ...data, posts: data.posts.map((item) => item.slug === selected ? { ...item, ...update } : item) });
  }

  function renamePhoto(nextSlug: string) {
    const previousSlug = selected;
    setSelected(nextSlug);
    onChange({
      ...data,
      posts: data.posts.map((item) => item.slug === previousSlug ? { ...item, slug: nextSlug } : item),
      collectionDetails: data.collectionDetails.map((item) => item.coverSlug === previousSlug ? { ...item, coverSlug: nextSlug } : item),
      fieldNotes: data.fieldNotes.map((note) => ({ ...note, photoSlugs: note.photoSlugs.map((slug) => slug === previousSlug ? nextSlug : slug) }))
    });
  }

  function patchCollection(name: string, update: Partial<PhotoCollection>) {
    onChange({ ...data, collectionDetails: data.collectionDetails.map((item) => item.name === name ? { ...item, ...update } : item) });
  }

  function patchNote(id: string, update: Partial<PhotoFieldNote>) {
    onChange({ ...data, fieldNotes: data.fieldNotes.map((item) => item.id === id ? { ...item, ...update } : item) });
  }

  function addNote() {
    const id = `field-note-${Date.now()}`;
    onChange({ ...data, fieldNotes: [...data.fieldNotes, { id, label: "FIELD NOTE", title: "Untitled note", excerpt: "", body: "", image: "", photoSlugs: [], status: "draft", date: "" }] });
  }

  function move(delta: number) {
    const destination = index + delta;
    if (index < 0 || destination < 0 || destination >= data.posts.length) return;
    const posts = [...data.posts];
    const [item] = posts.splice(index, 1);
    posts.splice(destination, 0, item);
    onChange({ ...data, posts });
  }

  function addPhoto() {
    let frameNumber = data.nextFrameNumber;
    while (data.posts.some((item) => item.slug === `new-frame-${frameNumber}` || item.displayCode?.toLowerCase() === `df-${String(frameNumber).padStart(3, "0")}`)) frameNumber += 1;
    const slug = `new-frame-${frameNumber}`;
    onChange({
      ...data,
      nextFrameNumber: frameNumber + 1,
      posts: [...data.posts, { slug, title: "Untitled Frame", caption: "", alt: "", category: data.categories[0] ?? "", image: "", visible: false, focalX: 50, focalY: 50, showMetadata: false, displayCode: `DF-${String(frameNumber).padStart(3, "0")}` }]
    });
    setSelected(slug);
  }

  function removePhoto() {
    if (!post || !window.confirm(`Remove ${post.title}? ${post.displayCode} will be retired when you save.`)) return;
    const nextSelection = data.posts[index + 1]?.slug ?? data.posts[index - 1]?.slug ?? "";
    onChange({
      ...data,
      posts: data.posts.filter((item) => item.slug !== post.slug),
      collectionDetails: data.collectionDetails.map((item) => item.coverSlug === post.slug ? { ...item, coverSlug: "" } : item),
      fieldNotes: data.fieldNotes.map((note) => ({ ...note, photoSlugs: note.photoSlugs.filter((slug) => slug !== post.slug) }))
    });
    setSelected(nextSelection);
  }

  function addSocialLink() {
    const id = `link-${Date.now()}`;
    onChange({ ...data, socialLinks: [...data.socialLinks, { id, platform: "website", label: "Website", url: "", visible: false }] });
  }

  function updateSocialLink(id: string, update: Partial<PhotoSocialLink>) {
    onChange({ ...data, socialLinks: data.socialLinks.map((link) => link.id === id ? { ...link, ...update } : link) });
  }

  function moveSection(index: number, delta: number) {
    const destination = index + delta;
    if (destination < 0 || destination >= data.sections.length) return;
    const sections = [...data.sections];
    const [section] = sections.splice(index, 1);
    sections.splice(destination, 0, section);
    onChange({ ...data, sections });
  }

  async function upload(file: File) {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Choose a JPG, PNG, or WebP under 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close();
      const image = canvas.toDataURL("image/jpeg", 0.8);
      if (image.length > 1_200_000) throw new Error("This frame is still too large for local storage. Try a smaller file.");
      patch({ image, width, height });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not read this image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.editor}>
      <section className={s.identity}>
        <div className={s.sectionLabel}><span>01</span><div><strong>Archive identity</strong><small>Public name shown above the contact sheet</small></div></div>
        <div className={s.identityFields}>
          <label><span>Archive name</span><input value={data.name} onChange={(event) => onChange({ ...data, name: event.target.value })} /></label>
          <label><span>Photographer</span><input value={data.author} onChange={(event) => onChange({ ...data, author: event.target.value })} /></label>
          <label><span>Default theme</span><select value={data.defaultTheme} onChange={(event) => onChange({ ...data, defaultTheme: event.target.value as PhotographyContent["defaultTheme"] })}><option value="dark">Darkroom black</option><option value="light">Gallery white</option></select><small>A visitor&apos;s later choice is remembered separately.</small></label>
          <label><span>Default section</span><select value={data.defaultSection} onChange={(event) => onChange({ ...data, defaultSection: event.target.value as PhotoSectionId })}>{data.sections.filter((section) => section.visible).map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}</select></label>
          <label><span>Default public view</span><select value={data.defaultView} onChange={(event) => onChange({ ...data, defaultView: event.target.value as PhotoArchiveView })}><option value="contact">Contact sheet</option><option value="feed">Feed</option><option value="frame">Single frame</option></select><small>Visitors can switch between all three views with the camera dial.</small></label>
          <label className={v2.wide}><span>About the archive</span><textarea value={data.about} onChange={(event) => onChange({ ...data, about: event.target.value })} /></label>
        </div>
        <div className={v2.preferenceRow}><label><input type="checkbox" checked={data.fitOriginals} onChange={(event) => onChange({ ...data, fitOriginals: event.target.checked })} /><span><strong>Fit full photo by default</strong><small>Keep every complete photograph inside a consistent contact-sheet frame.</small></span></label><label><input type="checkbox" checked={!data.quietShutter} onChange={(event) => onChange({ ...data, quietShutter: !event.target.checked })} /><span><strong>Shutter sound on by default</strong><small>Visitors can still mute it from the shared control dock.</small></span></label></div>
      </section>

      <section className={v2.sectionEditor}>
        <div className={s.sectionLabel}><span>02</span><div><strong>Archive sections</strong><small>Rename, arrange, hide, or choose the opening section</small></div></div>
        <div className={v2.sectionList}>{data.sections.map((section, sectionIndex) => <article key={section.id}>
          <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
          <input aria-label={`${section.id} label`} value={section.label} onChange={(event) => onChange({ ...data, sections: data.sections.map((item) => item.id === section.id ? { ...item, label: event.target.value } : item) })} />
          <label><input type="checkbox" checked={section.visible} onChange={(event) => { const sections = data.sections.map((item) => item.id === section.id ? { ...item, visible: event.target.checked } : item); const defaultSection = !event.target.checked && data.defaultSection === section.id ? sections.find((item) => item.visible)?.id ?? data.defaultSection : data.defaultSection; onChange({ ...data, sections, defaultSection }); }} />Shown</label>
          <button type="button" onClick={() => moveSection(sectionIndex, -1)} disabled={sectionIndex === 0} aria-label={`Move ${section.label} earlier`}><ArrowUp size={15} /></button>
          <button type="button" onClick={() => moveSection(sectionIndex, 1)} disabled={sectionIndex === data.sections.length - 1} aria-label={`Move ${section.label} later`}><ArrowDown size={15} /></button>
        </article>)}</div>
      </section>

      <section className={s.socials}>
        <div className={s.socialHeading}><div className={s.sectionLabel}><span>03</span><div><strong>Public links</strong><small>Social profiles, portfolio networks, or any website</small></div></div><button type="button" onClick={addSocialLink}><Plus size={16} />Add link</button></div>
        <div className={s.socialList}>
          {data.socialLinks.length === 0 && <div className={s.noLinks}><Link2 size={18} /><span>No public links. Add one when you are ready.</span></div>}
          {data.socialLinks.map((link) => <article key={link.id} data-visible={link.visible}>
            <label><span>Type</span><select value={link.platform} onChange={(event) => updateSocialLink(link.id, { platform: event.target.value as PhotoSocialPlatform })}><option value="instagram">Instagram</option><option value="youtube">YouTube</option><option value="pinterest">Pinterest</option><option value="x">X</option><option value="threads">Threads</option><option value="bluesky">Bluesky</option><option value="linkedin">LinkedIn</option><option value="behance">Behance</option><option value="flickr">Flickr</option><option value="fivehundredpx">500px</option><option value="website">Website</option><option value="custom">Other</option></select></label>
            <label><span>Public label</span><input value={link.label} onChange={(event) => updateSocialLink(link.id, { label: event.target.value })} /></label>
            <label className={s.socialUrl}><span>URL</span><input type="url" placeholder="https://..." value={link.url} onChange={(event) => updateSocialLink(link.id, { url: event.target.value })} /></label>
            <button type="button" className={s.visibility} onClick={() => updateSocialLink(link.id, { visible: !link.visible })} aria-pressed={link.visible} title={link.visible ? `Hide ${link.label}` : `Show ${link.label}`} disabled={!link.url.trim()}>{link.visible ? <Eye size={17} /> : <EyeOff size={17} />}<span>{link.visible ? "Shown" : "Hidden"}</span></button>
            <button type="button" className={s.removeLink} onClick={() => onChange({ ...data, socialLinks: data.socialLinks.filter((item) => item.id !== link.id) })} aria-label={`Remove ${link.label || "link"}`} title="Remove link"><Trash2 size={17} /></button>
          </article>)}
        </div>
      </section>

      <details className={v2.legalEditor} open>
        <summary><ShieldCheck size={18} /><div><strong>Rights, credit, and frame requests</strong><small>Public policy and the destination for genuine use requests</small></div></summary>
        <div className={v2.legalFields}>
          <label><span>Copyright year</span><input value={data.legal.copyrightYear} onChange={(event) => onChange({ ...data, legal: { ...data.legal, copyrightYear: event.target.value } })} /></label>
          <label><span>Copyright holder</span><input value={data.legal.copyrightHolder} onChange={(event) => onChange({ ...data, legal: { ...data.legal, copyrightHolder: event.target.value } })} /></label>
          <label><span>Credit name</span><input value={data.legal.creditName} onChange={(event) => onChange({ ...data, legal: { ...data.legal, creditName: event.target.value } })} /></label>
          <label><span>Credit Instagram</span><input value={data.legal.creditInstagram} onChange={(event) => onChange({ ...data, legal: { ...data.legal, creditInstagram: event.target.value } })} /></label>
          <label><span>Credit website</span><input value={data.legal.creditWebsite} onChange={(event) => onChange({ ...data, legal: { ...data.legal, creditWebsite: event.target.value } })} /></label>
          <label><span>Request email</span><input type="email" value={data.requests.email} onChange={(event) => onChange({ ...data, requests: { ...data.requests, email: event.target.value } })} /></label>
          <label className={v2.wide}><span>Footer note</span><input value={data.legal.trademarkNotice} onChange={(event) => onChange({ ...data, legal: { ...data.legal, trademarkNotice: event.target.value } })} /><small>Use a short human line; legal rights are already covered by the copyright and photo-use fields.</small></label>
          <label className={v2.wide}><span>Photo use policy</span><textarea value={data.legal.usePolicy} onChange={(event) => onChange({ ...data, legal: { ...data.legal, usePolicy: event.target.value } })} /></label>
          <label className={v2.wide}><span>Request form introduction</span><textarea value={data.requests.intro} onChange={(event) => onChange({ ...data, requests: { ...data.requests, intro: event.target.value } })} /></label>
          <label className={v2.checkField}><input type="checkbox" checked={data.legal.watermarkEnabled} onChange={(event) => onChange({ ...data, legal: { ...data.legal, watermarkEnabled: event.target.checked } })} />Show the frame code over public photographs</label>
          <label className={v2.checkField}><input type="checkbox" checked={data.requests.enabled} onChange={(event) => onChange({ ...data, requests: { ...data.requests, enabled: event.target.checked } })} />Show “Request this frame”</label>
        </div>
      </details>

      <details className={s.collections}>
        <summary><span>03</span><div><strong>Collections</strong><small>{data.categories.length} groups; the public Collections section appears when two groups have at least three frames each</small></div><span>Manage</span></summary>
        <div className={s.collectionBody}>
          <div className={s.collectionList}>{data.categories.map((collection) => <span key={collection}>{collection}<button type="button" disabled={data.posts.some((item) => item.category === collection)} onClick={() => onChange({ ...data, categories: data.categories.filter((item) => item !== collection), collectionDetails: data.collectionDetails.filter((item) => item.name !== collection) })} aria-label={`Remove ${collection}`} title={data.posts.some((item) => item.category === collection) ? "Move its photos before removing it" : `Remove ${collection}`}><Trash2 size={14} /></button></span>)}</div>
          <div className={s.addCollection}><input aria-label="New collection" placeholder="New collection" value={newCollection} onChange={(event) => setNewCollection(event.target.value)} /><button type="button" onClick={() => { const next = newCollection.trim(); if (next && next.toLowerCase() !== "all" && !data.categories.some((item) => item.toLowerCase() === next.toLowerCase())) { onChange({ ...data, categories: [...data.categories, next], collectionDetails: [...data.collectionDetails, { name: next, summary: "A selected sequence from the archive.", coverSlug: "", visible: true }] }); setNewCollection(""); } }}><Plus size={16} />Add</button></div>
        </div>
        <div className={v2.collectionSettings}>{data.collectionDetails.map((collection) => <article key={collection.name}><div><strong>{collection.name}</strong><label><input type="checkbox" checked={collection.visible} onChange={(event) => patchCollection(collection.name, { visible: event.target.checked })} />Show publicly</label></div><label><span>Collection description</span><input value={collection.summary} onChange={(event) => patchCollection(collection.name, { summary: event.target.value })} /></label><label><span>Cover frame</span><select value={collection.coverSlug} onChange={(event) => patchCollection(collection.name, { coverSlug: event.target.value })}><option value="">Automatic</option>{data.posts.filter((item) => item.category === collection.name && item.image).map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label></article>)}</div>
      </details>

      <section className={v2.notesEditor}>
        <header><div className={s.sectionLabel}><span>04</span><div><strong>Field notes</strong><small>Photo walks, observations, and multi-frame stories</small></div></div><button type="button" onClick={addNote}><Plus size={16} />Add note</button></header>
        {data.fieldNotes.length === 0 && <div className={v2.emptyNotes}><BookOpen size={22} /><span>No field notes yet.</span></div>}
        <div className={v2.noteList}>{data.fieldNotes.map((note) => <details key={note.id}>
          <summary><BookOpen size={17} /><div><strong>{note.title || "Untitled note"}</strong><small>{note.label} / {note.status}</small></div><span>{note.status === "published" ? <Eye size={16} /> : <EyeOff size={16} />}</span></summary>
          <div className={v2.noteFields}>
            <label><span>Label</span><input value={note.label} onChange={(event) => patchNote(note.id, { label: event.target.value })} /></label>
            <label><span>Title</span><input value={note.title} onChange={(event) => patchNote(note.id, { title: event.target.value })} /></label>
            <label><span>Date</span><input type="date" value={note.date} onChange={(event) => patchNote(note.id, { date: event.target.value })} /></label>
            <label><span>Status</span><select value={note.status} onChange={(event) => patchNote(note.id, { status: event.target.value as PhotoFieldNote["status"] })}><option value="draft">Draft</option><option value="published">Published</option></select></label>
            <label className={v2.wide}><span>Excerpt</span><input value={note.excerpt} onChange={(event) => patchNote(note.id, { excerpt: event.target.value })} /></label>
            <label className={v2.wide}><span>Body</span><textarea value={note.body} onChange={(event) => patchNote(note.id, { body: event.target.value })} /></label>
            <label className={v2.wide}><span>Cover image URL</span><input value={note.image} placeholder="/photography/frame.jpg or https://..." onChange={(event) => patchNote(note.id, { image: event.target.value })} /></label>
            <fieldset className={v2.relatedFrames}><legend>Frames in this note</legend>{data.posts.filter((item) => item.image).map((item) => <label key={item.slug}><input type="checkbox" checked={note.photoSlugs.includes(item.slug)} onChange={(event) => patchNote(note.id, { photoSlugs: event.target.checked ? [...note.photoSlugs, item.slug] : note.photoSlugs.filter((slug) => slug !== item.slug) })} /><span>{item.title}</span></label>)}</fieldset>
            <button type="button" className={v2.removeNote} onClick={() => onChange({ ...data, fieldNotes: data.fieldNotes.filter((item) => item.id !== note.id) })}><Trash2 size={16} />Remove note</button>
          </div>
        </details>)}</div>
      </section>

      <section className={s.frames}>
        <aside className={s.frameRail}>
          <header><div className={s.sectionLabel}><span>05</span><div><strong>Frames</strong><small>{data.posts.filter((item) => item.visible).length} published / {data.posts.length} total</small></div></div><button type="button" onClick={addPhoto} aria-label="Add photo" title="Add photo"><Plus size={18} /></button></header>
          <div className={s.thumbnails}>{data.posts.map((item, itemIndex) => <button type="button" key={item.slug} data-active={item.slug === selected} onClick={() => setSelected(item.slug)}>
            <span>{String(itemIndex + 1).padStart(2, "0")}</span>{item.image ? <img src={item.image} alt="" /> : <i><Camera size={18} /></i>}<div><strong>{item.title || "Untitled"}</strong><small>{item.category || "No collection"}</small></div>{item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>)}</div>
        </aside>

        <div className={s.frameEditor}>
          {!post && <div className={s.empty}><Camera size={34} /><p>Add a frame to begin.</p></div>}
          {post && <>
            <header className={s.frameHeader}><div><span>FRAME {String(index + 1).padStart(2, "0")}</span><strong>{post.slug}</strong></div><div>
              <button type="button" disabled={index === 0} onClick={() => move(-1)} aria-label="Move earlier" title="Move earlier"><ArrowUp size={17} /></button>
              <button type="button" disabled={index === data.posts.length - 1} onClick={() => move(1)} aria-label="Move later" title="Move later"><ArrowDown size={17} /></button>
              <button type="button" onClick={removePhoto} aria-label="Remove frame" title="Remove frame"><Trash2 size={17} /></button>
            </div></header>

            <div className={`${s.preview} ${v2.focalPreview}`} onClick={(event) => { if (!post.image || (event.target as HTMLElement).closest("label")) return; const rect = event.currentTarget.getBoundingClientRect(); patch({ focalX: Math.round((event.clientX - rect.left) / rect.width * 100), focalY: Math.round((event.clientY - rect.top) / rect.height * 100) }); }}>
              {post.image ? <><img src={post.image} alt={post.alt} /><i style={{ left: `${post.focalX ?? 50}%`, top: `${post.focalY ?? 50}%` }} /><span className={v2.focalLabel}><Crosshair size={13} />Crop focus {post.focalX ?? 50}% / {post.focalY ?? 50}%</span></> : <label><Camera size={36} /><span>No image selected</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /></label>}
              {post.image && <label className={s.replace}><Upload size={16} />Replace<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /></label>}
              <span className={s.corner}>DF / {String(index + 1).padStart(2, "0")}</span>
            </div>
            <p className={s.uploadStatus} role="status">{busy ? "Preparing frame..." : error}</p>

            <div className={s.fields}>
              <label><span>Two-word title</span><input maxLength={42} value={post.title} onChange={(event) => patch({ title: event.target.value })} /><small>Keep public frame titles to two words.</small></label>
              <label><span>Collection</span><select value={post.category} onChange={(event) => patch({ category: event.target.value })}><option value="">Choose collection</option>{data.categories.map((collection) => <option key={collection}>{collection}</option>)}</select></label>
              <label><span>Frame display code</span><input value={post.displayCode ?? ""} onChange={(event) => patch({ displayCode: event.target.value })} /><small>Permanent public ID. Hiding or reordering will not change it.</small></label>
              <label><span>Photo URL</span><input value={post.slug} onChange={(event) => renamePhoto(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /><small>/photography/{post.slug || "photo-name"}</small></label>
              <label className={s.wide}><span>Brief caption</span><input maxLength={160} value={post.caption} onChange={(event) => patch({ caption: event.target.value })} /><small>One short sentence; maximum 160 characters.</small></label>
              <label className={s.wide}><span>Image description</span><input value={post.alt} onChange={(event) => patch({ alt: event.target.value })} /><small>Used by screen readers; not shown as photo copy.</small></label>
            </div>
            <details className={v2.metadataEditor}>
              <summary>Camera metadata <span>{post.showMetadata ? "Visible when supplied" : "Hidden"}</span></summary>
              <div><label><span>Camera</span><input value={post.camera ?? ""} placeholder="Only when known" onChange={(event) => patch({ camera: event.target.value })} /></label><label><span>Lens</span><input value={post.lens ?? ""} placeholder="Only when known" onChange={(event) => patch({ lens: event.target.value })} /></label><label><span>Exposure</span><input value={post.exposure ?? ""} placeholder="Only when known" onChange={(event) => patch({ exposure: event.target.value })} /></label><label className={v2.metadataToggle}><input type="checkbox" checked={post.showMetadata ?? false} onChange={(event) => patch({ showMetadata: event.target.checked })} /><span>Show supplied metadata in the public viewer</span></label></div>
            </details>
            <label className={s.publish}><input type="checkbox" checked={post.visible} disabled={!post.image || !post.title.trim() || !post.alt.trim() || !post.category.trim()} onChange={(event) => patch({ visible: event.target.checked })} /><span>{post.visible ? <Eye size={17} /> : <EyeOff size={17} />}<strong>{post.visible ? "Published" : "Hidden draft"}</strong><small>A frame needs an image, title, collection, and description before publishing.</small></span></label>
          </>}
        </div>
      </section>
    </div>
  );
}
