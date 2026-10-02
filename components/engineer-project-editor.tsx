"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import { initialEngineerProjects, type EngineerProject } from "@/lib/engineer-project-store";

export default function EngineerProjectEditor({ value, onChange }: { value?: EngineerProject[]; onChange: (items: EngineerProject[]) => void }) {
  const items = value ?? initialEngineerProjects();
  const [active, setActive] = useState(items[0]?.slug ?? "");
  const index = Math.max(0, items.findIndex(project => project.slug === active));
  const project = items[index];
  function patch(update: Partial<EngineerProject>) { onChange(items.map((item, i) => i === index ? { ...item, ...update } : item)); }
  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); onChange(next); setActive(item.slug);
  }
  function field(label: string, key: "name" | "role" | "period" | "summary" | "sourceUrl" | "liveUrl" | "overviewTitle" | "overview" | "technicalFocus" | "architecture", multiline = false) {
    return <label className="field" key={key}><span>{label}</span>{multiline ? <textarea rows={3} value={project[key]} onChange={event => patch({ [key]: event.target.value })} /> : <input value={project[key]} onChange={event => patch({ [key]: event.target.value })} />}</label>;
  }
  return <div className="admin-form">
    <h2>Engineer projects</h2><p>Browser-local preview collection. Save all to apply changes. The first visible project included in Selected work is the default. Hiding is not a security boundary.</p>
    <div className="inline-actions"><button type="button" className="button" onClick={() => {
      const slug = `project-${Date.now()}`;
      const next: EngineerProject = { slug, name: "New project", role: "", period: "", summary: "", stack: [], contributions: [], sourceUrl: "", liveUrl: "", overviewTitle: "Overview", overview: "", technicalFocus: "", architecture: "", workflow: [], faq: [], decision: { title: "", detail: "", tradeoff: "", url: "", label: "Inspect implementation" }, visible: true, selected: true, cover: "generic" };
      onChange([...items, next]); setActive(slug);
    }}><Plus size={17} />Add project</button><a className="button secondary" href="/preview/entry/work">Open Engineer preview</a></div>
    <label className="field"><span>Project</span><select value={project?.slug ?? ""} onChange={event => setActive(event.target.value)}>{items.map((item, i) => <option value={item.slug} key={item.slug}>{i + 1}. {item.name}{!item.visible ? " (hidden)" : ""}</option>)}</select></label>
    {project && <>
      <div className="inline-actions"><button className="button secondary" type="button" disabled={index === 0} onClick={() => move(index, index - 1)} title="Move earlier"><ArrowUp size={17} />Earlier</button><button className="button secondary" type="button" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} title="Move later"><ArrowDown size={17} />Later</button><button className="button secondary" type="button" onClick={() => {
        const next = items.map((item, i) => i === index ? { ...item, visible: true, selected: true } : item); const [first] = next.splice(index, 1); onChange([first, ...next]);
      }}><Star size={17} />Make default</button><button className="button secondary" type="button" onClick={() => { if (window.confirm(`Remove ${project.name} from this preview? Save all applies the removal.`)) { onChange(items.filter((_, i) => i !== index)); setActive(""); } }}><Trash2 size={17} />Remove</button></div>
      <label><input type="checkbox" checked={project.visible} onChange={event => patch({ visible: event.target.checked })} /> Visible in preview</label>
      <label><input type="checkbox" checked={project.selected} onChange={event => patch({ selected: event.target.checked })} /> Include in Selected work</label>
      <p>Page address: /preview/entry/work/{project.slug}</p>
      <div className="admin-form-grid">{field("Project name", "name")}{field("Your role", "role")}{field("Period", "period")}{field("GitHub / source URL", "sourceUrl")}{field("Live project URL", "liveUrl")}</div>
      {field("Card summary", "summary", true)}
      <label className="field"><span>Card cover</span><select value={project.cover} onChange={event => patch({ cover: event.target.value as EngineerProject["cover"] })}><option value="generic">Generic project cover</option><option value="store">Store Intelligence diagram (fixed architecture)</option><option value="food">CraveNChat diagram (fixed architecture)</option></select></label>
      {([ ["Technologies", "stack"], ["Your contributions", "contributions"], ["Workflow steps", "workflow"] ] as const).map(([label, key]) => <label className="field" key={key}><span>{label} (one per line)</span><textarea rows={4} value={project[key].join("\n")} onChange={event => patch({ [key]: event.target.value.split("\n") })} /></label>)}
      {field("Overview heading", "overviewTitle")}{field("Overview", "overview", true)}{field("Technical focus", "technicalFocus", true)}{field("Architecture explanation", "architecture", true)}
      <h3>Implementation decision</h3>{([ ["Heading", "title"], ["Decision", "detail"], ["Trade-off", "tradeoff"], ["Evidence URL", "url"], ["Link label", "label"] ] as const).map(([label, key]) => <label className="field" key={key}><span>{label}</span><textarea rows={2} value={project.decision[key]} onChange={event => patch({ decision: { ...project.decision, [key]: event.target.value } })} /></label>)}
      <h3>Project questions</h3>{project.faq.map((item, i) => <div key={i} className="admin-form"><label className="field"><span>Question {i + 1}</span><input value={item.question} onChange={event => patch({ faq: project.faq.map((q, n) => n === i ? { ...q, question: event.target.value } : q) })} /></label><label className="field"><span>Answer</span><textarea value={item.answer} onChange={event => patch({ faq: project.faq.map((q, n) => n === i ? { ...q, answer: event.target.value } : q) })} /></label><button type="button" className="button secondary" onClick={() => patch({ faq: project.faq.filter((_, n) => n !== i) })}>Remove question</button></div>)}
      <button type="button" className="button secondary" onClick={() => patch({ faq: [...project.faq, { question: "", answer: "" }] })}><Plus size={17} />Add question</button>
    </>}
  </div>;
}
