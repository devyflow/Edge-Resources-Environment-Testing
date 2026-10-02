"use client";
import { useId, useState } from "react";
import { ArrowRight, Monitor, Server, Database, Radio, ChefHat, ShoppingBag, MessageSquare, Bot } from "lucide-react";
import s from "./project-details.module.css";

const stages = [
  { title: "Student interface", label: "BROWSE & ORDER", icon: Monitor, tech: "React / Vite / Axios", detail: "Students browse the menu and submit an order from the React interface. Axios sends the request to the backend REST API." },
  { title: "Order endpoint", label: "REST REQUEST", icon: Server, tech: "Java 21 / Spring Boot", detail: "The Spring Boot order endpoint accepts the request and coordinates persistence before broadcasting an update." },
  { title: "Save order", label: "PERSISTENCE", icon: Database, tech: "Spring Data JPA / PostgreSQL", detail: "Spring Data JPA saves the order in PostgreSQL. The controller saves before publishing the live notification; this is not a transactional outbox or a guarantee of message delivery." },
  { title: "Broadcast update", label: "LIVE MESSAGING", icon: Radio, tech: "WebSocket / STOMP", detail: "After saving, the backend publishes an order update through its messaging template. Connected subscribers can receive updates without repeatedly polling the orders endpoint." },
  { title: "Kitchen dashboard", label: "ORDER VISIBILITY", icon: ChefHat, tech: "React / order updates", detail: "The admin kitchen dashboard displays incoming orders. Live messages keep connected views informed of new order activity." },
  { title: "Student updates", label: "CONNECTED CLIENTS", icon: ShoppingBag, tech: "React / STOMP subscriptions", detail: "Student-facing views receive live order updates. The kitchen and student interfaces are subscribers to the backend, not a chain of services forwarding messages to each other." },
];

export default function CraveArchitecture() {
  const [selected, setSelected] = useState(2);
  const inspectorId = useId();
  const current = stages[selected];
  return <div className={s.architecture}>
    <header className={s.diagramHeader}><span>CRAVENCHAT / ORDER FLOW</span><span className={s.prototype}>CAMPUS APPLICATION</span></header>
    <div className={s.flowGrid}>{stages.map((stage, index) => <div className={s.stageWrap} key={stage.title}>
      <button type="button" className={s.stage} aria-pressed={selected === index} aria-controls={inspectorId} onClick={() => setSelected(index)}>
        <span className={s.stageTop}><stage.icon size={24} strokeWidth={1.5} /><span>{String(index + 1).padStart(2, "0")}</span></span>
        <strong>{stage.title}</strong><span className={s.stageLabel}>{stage.label}</span>
      </button>
      {index < 4 && <span className={s.connector} aria-hidden="true"><ArrowRight size={20} /></span>}
    </div>)}</div>
    <div className={s.posBranch}><Radio size={18} /><strong>Live order updates</strong><ArrowRight size={17} /><span>Kitchen + student subscribers</span></div>
    <div className={s.posBranch}><MessageSquare size={18} /><strong>Campus chat</strong><ArrowRight size={17} /><span>WebSocket / STOMP</span></div>
    <div className={s.posBranch}><Bot size={18} /><strong>Menu & order help</strong><ArrowRight size={17} /><span>AI assistant endpoint</span></div>
    <div className={s.inspector} id={inspectorId} aria-live="polite"><div><span className={s.eyebrow}>COMPONENT {String(selected + 1).padStart(2, "0")}</span><h3>{current.title}</h3><span className={s.tech}>{current.tech}</span></div><p>{current.detail}</p></div>
    <p className={s.caveat}>Architecture overview, not a live order demo. Chat and assistant requests are separate from order persistence.</p>
  </div>;
}
