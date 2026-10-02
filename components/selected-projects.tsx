import Link from "next/link";
import { ArrowRight, Database, FileJson, Github, Server } from "lucide-react";
import { useEngineerProjects } from "./use-engineer-projects";
import ChitChatOverview from "./chit-chat-overview";
import s from "./engineer-editorial.module.css";

export default function SelectedProjects() {
  const { projects: allProjects, ready } = useEngineerProjects();
  const projects = allProjects.filter(project => project.visible && project.selected);
  return <section id="selected-work" className={s.work}>
    <header className={s.heading}><h2>Selected work</h2><span>BACKEND / SYSTEMS / APPLICATIONS</span></header>
    {!ready ? <p role="status">Loading selected work...</p> : <div className={s.projects}>{projects.map(project => <article key={project.slug} className={s.project}>
      <Link className={s.coverLink} href={`/preview/entry/work/${project.slug}`} aria-label={`Read ${project.name} case study`}>
        {project.cover === "store" ? <div className={s.storeCover}>
          <span className={s.coverLabel}>{project.name.toUpperCase()} / INGESTION DESIGN</span>
          <div className={s.storeFlow}><div><FileJson size={28} /><strong>Events</strong></div><ArrowRight size={18} /><div><Server size={28} /><strong>Validate</strong></div><ArrowRight size={18} /><div><Database size={28} /><strong>Persist</strong></div></div>
          <div className={s.coverFoot}><span>FastAPI / Pydantic / SQLite</span><span>System overview</span></div>
        </div> : project.cover === "food" ? <ChitChatOverview /> : <div className={s.storeCover}><span className={s.coverLabel}>PROJECT OVERVIEW</span><Server size={36} /><strong>{project.name}</strong><span>{project.stack.slice(0, 3).join(" / ")}</span></div>}
      </Link>
      <div className={s.projectBody}><span className={s.role}>My role: {project.role}</span><h3><Link href={`/preview/entry/work/${project.slug}`}>{project.name}</Link></h3><p>{project.summary}</p>
        {project.contributions[0] && <p className={s.ownership}>{project.contributions[0]}</p>}
        <div className={s.projectTech}>{project.stack.map(tech => <span key={tech}>{tech}</span>)}</div>
        <div className={s.projectActions}><Link href={`/preview/entry/work/${project.slug}`}>View case study <ArrowRight size={17} /></Link>{project.sourceUrl && <a href={project.sourceUrl}><Github size={17} />Source</a>}{project.liveUrl && <a href={project.liveUrl}>Live project <ArrowRight size={17} /></a>}</div>
      </div>
    </article>)}</div>}
  </section>;
}
