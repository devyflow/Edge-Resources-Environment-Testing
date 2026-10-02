import { ArrowRight, Database, MessageSquare, Monitor, Server } from "lucide-react";
import s from "./entry-experience.module.css";

export default function ChitChatOverview() {
  return <div className={s.systemOverview} role="img" aria-label="CraveNChat architecture overview: React ordering and chat interface, Spring Boot APIs and WebSockets, and PostgreSQL storage. This is a diagram, not a product screenshot.">
    <span className={s.overviewLabel}>CRAVENCHAT / SYSTEM OVERVIEW</span>
    <div className={s.systemNodes}>
      <div><Monitor size={28} /><strong>Order & chat</strong><span>React</span></div>
      <ArrowRight size={20} />
      <div><Server size={28} /><strong>APIs & live updates</strong><span>Spring Boot / WebSockets</span></div>
      <ArrowRight size={20} />
      <div><Database size={28} /><strong>Application data</strong><span>PostgreSQL</span></div>
    </div>
    <span className={s.overviewFoot}><MessageSquare size={14} />Real-time food ordering<span>Architecture illustration</span></span>
  </div>;
}
