"use client";
import { useId, useState } from "react";
import { ArrowRight, Camera, ScanLine, FileJson, Server, Database, ChartNoAxesCombined, ReceiptText } from "lucide-react";
import s from "./project-details.module.css";

const stages = [
  { title: "CCTV clips", label: "VIDEO INPUT", icon: Camera, detail: "Recorded footage enters the detection pipeline. Frames are sampled before person detection and tracking.", tech: "Recorded video / frame sampling" },
  { title: "Detect & track", label: "COMPUTER VISION", icon: ScanLine, detail: "OpenCV HOG detection, motion contours, and tracking produce visitor observations. YOLOv8 is an optional detection path, not a measured accuracy guarantee.", tech: "Python / OpenCV / optional YOLOv8" },
  { title: "Visitor events", label: "STRUCTURED OUTPUT", icon: FileJson, detail: "The pipeline emits JSONL event records. A replay utility sends those records to the ingestion API in batches.", tech: "JSONL / HTTP replay" },
  { title: "Ingestion API", label: "VALIDATE", icon: Server, detail: "FastAPI and Pydantic validate incoming events. Rejected records are logged, while accepted events proceed to persistence.", tech: "FastAPI / Pydantic" },
  { title: "Event store", label: "PERSIST", icon: Database, detail: "SQLite stores event records with event-ID deduplication and parameterized SQL. Analytics also use point-of-sale data.", tech: "SQLite / event-ID deduplication" },
  { title: "Store analytics", label: "QUERY & DISPLAY", icon: ChartNoAxesCombined, detail: "Analytics endpoints serve visitor metrics, conversion funnels, heatmaps, and rule-based alerts. The web dashboard refreshes every three seconds.", tech: "REST API / HTML, CSS & JavaScript" },
];

export default function StoreArchitecture() {
  const inspectorId = useId();
  const [selected, setSelected] = useState(3);
  const current = stages[selected];
  return <div className={s.architecture}>
    <header className={s.diagramHeader}><span>STORE INTELLIGENCE / DATA FLOW</span><span className={s.prototype}>CHALLENGE PROTOTYPE</span></header>
    <div className={s.flowGrid}>{stages.map((stage, index) => <div className={s.stageWrap} key={stage.title}>
      <button type="button" className={s.stage} aria-pressed={selected === index} onClick={() => setSelected(index)} aria-controls={inspectorId}>
        <span className={s.stageTop}><stage.icon size={24} strokeWidth={1.5} /><span>{String(index + 1).padStart(2, "0")}</span></span>
        <strong>{stage.title}</strong><span className={s.stageLabel}>{stage.label}</span>
      </button>
      {index < stages.length - 1 && <span className={s.connector} aria-hidden="true"><ArrowRight size={20} /></span>}
    </div>)}</div>
    <div className={s.posBranch}><ReceiptText size={18} /><strong>POS transactions</strong><span>Sales data</span><ArrowRight size={17} /><span>Analytics queries</span></div>
    <div className={s.inspector} id={inspectorId} aria-live="polite"><div><span className={s.eyebrow}>COMPONENT {String(selected + 1).padStart(2, "0")}</span><h3>{current.title}</h3><span className={s.tech}>{current.tech}</span></div><p>{current.detail}</p></div>
    <p className={s.caveat}>Architecture overview, not a live feed. Some generated behavior uses illustrative heuristics; production accuracy has not been established.</p>
  </div>;
}
