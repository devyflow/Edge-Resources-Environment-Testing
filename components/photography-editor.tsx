"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Camera, Eye, EyeOff, Link2, Plus, Trash2, Upload } from "lucide-react";
import { normalizePhotography, type PhotoArchiveView, type PhotographyContent, type PhotoPost, type PhotoSocialLink, type PhotoSocialPlatform } from "@/lib/photography-content";
import s from "./photography-editor.module.css";

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

  function move(delta: number) {
    const destination = index + delta;
    if (index < 0 || destination < 0 || destination >= data.posts.length) return;
    const posts = [...data.posts];
    const [item] = posts.splice(index, 1);
    posts.splice(destination, 0, item);
    onChange({ ...data, posts });
  }

  function addPhoto() {
    const slug = `photo-${Date.now()}`;
    onChange({
      ...data,
      posts: [...data.posts, { slug, title: "Untitled Frame", caption: "", alt: "", category: data.categories[0] ?? "", image: "", visible: false }]
    });
    setSelected(slug);
  }

  function addSocialLink() {
    const id = `link-${Date.now()}`;
    onChange({ ...data, socialLinks: [...data.socialLinks, { id, platform: "website", label: "Website", url: "", visible: false }] });
  }

  function updateSocialLink(id: string, update: Partial<PhotoSocialLink>) {
    onChange({ ...data, socialLinks: data.socialLinks.map((link) => link.id === id ? { ...link, ...update } : link) });
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
      bitmap.close();
      const image = canvas.toDataURL("image/jpeg", 0.8);
      if (image.length > 1_200_000) throw new Error("This frame is still too large for local storage. Try a smaller file.");
      patch({ image });
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
          <label><span>Default public view</span><select value={data.defaultView} onChange={(event) => onChange({ ...data, defaultView: event.target.value as PhotoArchiveView })}><option value="contact">Contact sheet</option><option value="feed">Feed</option><option value="frame">Single frame</option></select><small>Visitors can still switch views with the camera dial.</small></label>
        </div>
      </section>

      <section className={s.socials}>
        <div className={s.socialHeading}><div className={s.sectionLabel}><span>02</span><div><strong>Public links</strong><small>Instagram, YouTube, Pinterest, X, or any website</small></div></div><button type="button" onClick={addSocialLink}><Plus size={16} />Add link</button></div>
        <div className={s.socialList}>
          {data.socialLinks.length === 0 && <div className={s.noLinks}><Link2 size={18} /><span>No public links. Add one when you are ready.</span></div>}
          {data.socialLinks.map((link) => <article key={link.id} data-visible={link.visible}>
            <label><span>Type</span><select value={link.platform} onChange={(event) => updateSocialLink(link.id, { platform: event.target.value as PhotoSocialPlatform })}><option value="instagram">Instagram</option><option value="youtube">YouTube</option><option value="pinterest">Pinterest</option><option value="x">X</option><option value="website">Website</option></select></label>
            <label><span>Public label</span><input value={link.label} onChange={(event) => updateSocialLink(link.id, { label: event.target.value })} /></label>
            <label className={s.socialUrl}><span>URL</span><input type="url" placeholder="https://..." value={link.url} onChange={(event) => updateSocialLink(link.id, { url: event.target.value })} /></label>
            <button type="button" className={s.visibility} onClick={() => updateSocialLink(link.id, { visible: !link.visible })} aria-pressed={link.visible} title={link.visible ? `Hide ${link.label}` : `Show ${link.label}`} disabled={!link.url.trim()}>{link.visible ? <Eye size={17} /> : <EyeOff size={17} />}<span>{link.visible ? "Shown" : "Hidden"}</span></button>
            <button type="button" className={s.removeLink} onClick={() => onChange({ ...data, socialLinks: data.socialLinks.filter((item) => item.id !== link.id) })} aria-label={`Remove ${link.label || "link"}`} title="Remove link"><Trash2 size={17} /></button>
          </article>)}
        </div>
      </section>

      <details className={s.collections}>
        <summary><span>03</span><div><strong>Collections</strong><small>{data.categories.length} filters, hidden from the public archive until requested</small></div><span>Manage</span></summary>
        <div className={s.collectionBody}>
          <div className={s.collectionList}>{data.categories.map((collection) => <span key={collection}>{collection}<button type="button" disabled={data.posts.some((item) => item.category === collection)} onClick={() => onChange({ ...data, categories: data.categories.filter((item) => item !== collection) })} aria-label={`Remove ${collection}`} title={data.posts.some((item) => item.category === collection) ? "Move its photos before removing it" : `Remove ${collection}`}><Trash2 size={14} /></button></span>)}</div>
          <div className={s.addCollection}><input aria-label="New collection" placeholder="New collection" value={newCollection} onChange={(event) => setNewCollection(event.target.value)} /><button type="button" onClick={() => { const next = newCollection.trim(); if (next && next.toLowerCase() !== "all" && !data.categories.some((item) => item.toLowerCase() === next.toLowerCase())) { onChange({ ...data, categories: [...data.categories, next] }); setNewCollection(""); } }}><Plus size={16} />Add</button></div>
        </div>
      </details>

      <section className={s.frames}>
        <aside className={s.frameRail}>
          <header><div className={s.sectionLabel}><span>04</span><div><strong>Frames</strong><small>{data.posts.filter((item) => item.visible).length} published / {data.posts.length} total</small></div></div><button type="button" onClick={addPhoto} aria-label="Add photo" title="Add photo"><Plus size={18} /></button></header>
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
              <button type="button" onClick={() => { if (window.confirm(`Remove ${post.title}? Save all applies this change.`)) onChange({ ...data, posts: data.posts.filter((item) => item.slug !== post.slug) }); }} aria-label="Remove frame" title="Remove frame"><Trash2 size={17} /></button>
            </div></header>

            <div className={s.preview}>
              {post.image ? <img src={post.image} alt={post.alt} /> : <label><Camera size={36} /><span>No image selected</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /></label>}
              {post.image && <label className={s.replace}><Upload size={16} />Replace<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /></label>}
              <span className={s.corner}>DF / {String(index + 1).padStart(2, "0")}</span>
            </div>
            <p className={s.uploadStatus} role="status">{busy ? "Preparing frame..." : error}</p>

            <div className={s.fields}>
              <label><span>Two-word title</span><input value={post.title} onChange={(event) => patch({ title: event.target.value })} /></label>
              <label><span>Collection</span><select value={post.category} onChange={(event) => patch({ category: event.target.value })}><option value="">Choose collection</option>{data.categories.map((collection) => <option key={collection}>{collection}</option>)}</select></label>
              <label className={s.wide}><span>Brief caption</span><input value={post.caption} onChange={(event) => patch({ caption: event.target.value })} /></label>
              <label className={s.wide}><span>Image description</span><input value={post.alt} onChange={(event) => patch({ alt: event.target.value })} /><small>Used by screen readers; not shown as photo copy.</small></label>
            </div>
            <label className={s.publish}><input type="checkbox" checked={post.visible} disabled={!post.image || !post.title.trim() || !post.alt.trim() || !post.category.trim()} onChange={(event) => patch({ visible: event.target.checked })} /><span>{post.visible ? <Eye size={17} /> : <EyeOff size={17} />}<strong>{post.visible ? "Published" : "Hidden draft"}</strong><small>A frame needs an image, title, collection, and description before publishing.</small></span></label>
          </>}
        </div>
      </section>
    </div>
  );
}
