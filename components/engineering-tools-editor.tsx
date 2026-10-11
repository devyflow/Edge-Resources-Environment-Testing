"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Image as ImageIcon, Plus, Star, Trash2 } from "lucide-react";
import { normalizeEngineering, type EngineeringContent, type EngineerTool } from "@/lib/engineering-content";

export default function EngineeringToolsEditor({ value, onChange }: { value?: EngineeringContent; onChange: (value: EngineeringContent) => void }) {
  const data = normalizeEngineering(value);
  const [active, setActive] = useState(data.tools[0]?.id ?? "");
  const index = Math.max(0, data.tools.findIndex((tool) => tool.id === active));
  const tool = data.tools[index];

  function patch(update: Partial<EngineerTool>) {
    onChange({ ...data, tools: data.tools.map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item) });
  }

  function move(delta: number) {
    const destination = index + delta;
    if (destination < 0 || destination >= data.tools.length) return;
    const tools = [...data.tools];
    const [item] = tools.splice(index, 1);
    tools.splice(destination, 0, item);
    onChange({ ...data, tools });
  }

  function addTool() {
    const id = `tool-${Date.now()}`;
    const next: EngineerTool = { id, title: "New tool", summary: "", visible: false, featured: false, featuredLabel: "Featured tool", image: "", actionLabel: "Open tool", url: "", projectSlug: "", kind: "link" };
    onChange({ ...data, tools: [...data.tools, next] });
    setActive(id);
  }

  async function uploadToolImage(file: File) {
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) return;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    patch({ image: canvas.toDataURL("image/jpeg", 0.78) });
  }

  return <div className="admin-form">
    <h2>Tools people can use</h2>
    <p>Choose which utilities appear and give one standout tool a real product preview. Featured tools use the image and larger public layout below.</p>
    <div className="inline-actions"><button type="button" className="button" onClick={addTool}><Plus size={17} />Add tool</button></div>
    <label className="field"><span>Tool</span><select value={tool?.id ?? ""} onChange={(event) => setActive(event.target.value)}>{data.tools.map((item) => <option key={item.id} value={item.id}>{item.title}{item.featured ? " (featured)" : ""}{!item.visible ? " (hidden)" : ""}</option>)}</select></label>
    {tool && <>
      <div className="inline-actions">
        <button type="button" className="button secondary" disabled={index === 0} onClick={() => move(-1)}><ArrowUp size={17} />Earlier</button>
        <button type="button" className="button secondary" disabled={index === data.tools.length - 1} onClick={() => move(1)}><ArrowDown size={17} />Later</button>
        <button type="button" className="button secondary" onClick={() => patch({ visible: !tool.visible })}>{tool.visible ? <Eye size={17} /> : <EyeOff size={17} />}{tool.visible ? "Shown" : "Hidden"}</button>
        <button type="button" className="button secondary" onClick={() => patch({ featured: !tool.featured })}><Star size={17} />{tool.featured ? "Featured" : "Feature tool"}</button>
        <button type="button" className="button secondary" onClick={() => { if (!window.confirm(`Remove ${tool.title}?`)) return; onChange({ ...data, tools: data.tools.filter((_, itemIndex) => itemIndex !== index) }); setActive(""); }}><Trash2 size={17} />Remove</button>
      </div>
      <div className="admin-form-grid">
        <label className="field"><span>Tool name</span><input value={tool.title} onChange={(event) => patch({ title: event.target.value })} /></label>
        <label className="field"><span>Feature label</span><input value={tool.featuredLabel} onChange={(event) => patch({ featuredLabel: event.target.value })} /></label>
        <label className="field"><span>Action label</span><input value={tool.actionLabel} onChange={(event) => patch({ actionLabel: event.target.value })} /></label>
        <label className="field"><span>Behavior</span><select value={tool.kind} onChange={(event) => patch({ kind: event.target.value as EngineerTool["kind"] })}><option value="link">Open web link</option><option value="json-desk">Open built-in JSON Desk</option></select></label>
        <label className="field"><span>Web URL</span><input type="url" placeholder="https://..." value={tool.url} onChange={(event) => patch({ url: event.target.value })} /></label>
        <label className="field"><span>Related project slug</span><input placeholder="piksy" value={tool.projectSlug} onChange={(event) => patch({ projectSlug: event.target.value })} /></label>
      </div>
      <label className="field"><span>Short summary</span><textarea value={tool.summary} onChange={(event) => patch({ summary: event.target.value })} /></label>
      {tool.featured && !tool.image && <p><ImageIcon size={16} /> Add a product image below. Without one, a featured tool falls back to a small generic icon.</p>}
      <label className="field"><span>Featured product image URL</span><input placeholder="/tools/tool-preview.png or https://..." value={tool.image} onChange={(event) => patch({ image: event.target.value })} /></label>
      <label className="field"><span>Or upload a product preview</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadToolImage(file); event.target.value = ""; }} /></label>
      {tool.image && <><p><ImageIcon size={16} /> Image added. It will appear only when the tool is featured.</p><img src={tool.image} alt="" style={{ width: "min(320px, 100%)", height: "auto" }} /></>}
    </>}
  </div>;
}
