"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { useEngineerProjects } from "./use-engineer-projects";
import ChitChatOverview from "@/components/crave-architecture";
import StoreArchitecture from "@/components/store-architecture";
import ProjectQuestions from "@/components/project-questions";
import s from "@/components/entry-experience.module.css";
import e from "@/components/engineer-editorial.module.css";

export default function EngineerProjectPage({ slug }: { slug: string }) {
  const { projects, ready } = useEngineerProjects();
  const engineerProjects = projects.filter(project => project.visible);
  if (!ready) return <main className={s.engineer}><p>Loading project...</p></main>;
  const project = engineerProjects.find((item) => item.slug === slug);
  if (!project) return <main className={s.engineer}><h1>Project unavailable</h1><Link href="/preview/entry/work">Back to projects</Link></main>;
  const next = engineerProjects[(engineerProjects.indexOf(project) + 1) % engineerProjects.length];
  return <main className={`${s.engineer} ${s.casePage}`}>
    <header className={s.workHeader}><Link className={s.brand} href="/preview/entry">devyflow<span>.</span></Link><Link href="/preview/entry/work#selected-work"><ArrowLeft size={17} />Selected work</Link></header>
    <section className={s.caseIntro}>
      <span className={s.kicker}>{project.role || "CASE STUDY IN PREPARATION"}{project.period && ` / ${project.period}`}</span>
      <h1>{project.name}</h1><p>{project.summary}</p>
      <div className={s.stack}>{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
      {(project.liveUrl || project.sourceUrl) && <div className={s.caseLinks}>{project.liveUrl && <a href={project.liveUrl}>View project <ArrowUpRight size={16} /></a>}{project.sourceUrl && <a href={project.sourceUrl}><Github size={16} />Source code</a>}</div>}
    </section>
      <nav className={s.caseNavigation} aria-label="Project sections"><a href="#overview">Overview</a>{project.contributions.length > 0 && <a href="#contribution">My contribution</a>}<a href="#architecture">{project.architecture ? "Architecture" : "Workflow"}</a><a href="#questions">FAQ</a></nav>
      <section id="overview" className={s.caseDetails}><div><span className={s.kicker}>THE PROJECT</span><h2>{project.overviewTitle}</h2></div><div><p>{project.overview}</p><p>{project.technicalFocus}</p></div></section>
      {project.contributions.length > 0 && <section id="contribution" className={`${s.caseDetails} ${s.caseDivider}`}><div><span className={s.kicker}>MY CONTRIBUTION</span><h2>My part in the project.</h2></div><ol className={s.contributionList}>{project.contributions.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></section>}
      <section id="architecture" className={s.caseArchitecture}><div className={s.sectionHeading}><h2>{project.architecture ? "Architecture" : "Workflow"}</h2><span>{project.architecture ? "CORE COMPONENTS" : "TEXT TO IMAGE"}</span></div>{slug === "chit-chat-with-food" ? <ChitChatOverview /> : slug === "store-intelligence" ? <StoreArchitecture /> : <ol className={s.projectWorkflow}>{project.workflow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < project.workflow.length - 1 && <ArrowRight size={18} />}</li>)}</ol>}{project.architecture && <p>{project.architecture}</p>}</section>
      {project.decision.title && <section className={e.decision} aria-labelledby="decision-heading"><div><span className={e.decisionLabel}>AN IMPLEMENTATION DECISION</span><h2 id="decision-heading">{project.decision.title}</h2></div><div><p>{project.decision.detail}</p>{project.decision.tradeoff && <p><strong>Trade-off. </strong>{project.decision.tradeoff}</p>}{project.decision.url && <a href={project.decision.url}>{project.decision.label}<ArrowUpRight size={16} /></a>}</div></section>}
      {project.faq.length > 0 && <ProjectQuestions name={project.name} questions={project.faq} sourceUrl={project.sourceUrl} liveUrl={project.liveUrl} />}
    <footer className={s.workFooter}><Link href="/preview/entry/work#selected-work"><ArrowLeft size={16} />Back to projects</Link><Link href={`/preview/entry/work/${next.slug}`}>{next.name}<ArrowRight size={16} /></Link></footer>
  </main>;
}
