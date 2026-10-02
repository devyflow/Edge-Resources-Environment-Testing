"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Aperture, ArrowUpRight, Braces, Check, ChevronLeft, Copy, FileDown, Github, Image, Linkedin, Mail } from "lucide-react";
import { defaultData } from "@/lib/default-data";
import { engineerProfile } from "@/lib/engineer-profile";
import { loadLocalData } from "@/lib/content-store";
import SelectedProjects from "./selected-projects";
import { useEngineerProjects } from "./use-engineer-projects";
import JsonDesk from "./json-desk";
import EngineerCameraControls from "./engineer-camera-controls";
import s from "./entry-experience.module.css";
import e from "./engineer-editorial.module.css";

export default function EngineerPreview() {
  const { projects, ready } = useEngineerProjects();
  const piksy = ready ? projects.find(project => project.slug === "piksy" && project.visible) : undefined;
  const [toolOpen, setToolOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState(engineerProfile.email);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => { setCopyState("idle"); }, [contactEmail]);
  async function copyEmail() {
    try { await navigator.clipboard.writeText(contactEmail); setCopyState("copied"); }
    catch { setCopyState("failed"); }
  }
  useEffect(() => {
    const syncContact = () => {
      try {
        const email = loadLocalData().profile.email.trim();
        setContactEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : engineerProfile.email);
      } catch { setContactEmail(engineerProfile.email); }
    };
    syncContact();
    window.addEventListener("storage", syncContact);
    window.addEventListener("focus", syncContact);
    window.addEventListener("portfolio-content-updated", syncContact);
    return () => {
      window.removeEventListener("storage", syncContact);
      window.removeEventListener("focus", syncContact);
      window.removeEventListener("portfolio-content-updated", syncContact);
    };
  }, []);
  return (
    <main className={s.engineer}>
      <header className={s.workHeader}>
        <Link className={s.brand} href="/preview/entry">devyflow<span>.</span></Link>
        <span className={s.headerMode}><Aperture size={15} /> THE ENGINEER</span>
        <nav aria-label="Portfolio navigation"><a href="#selected-work">Work</a><a href="#tools">Tools</a><a href="#about">About</a><a href="#contact">Contact <ArrowUpRight size={14} /></a></nav>
        <a className={s.resumeLink} href={engineerProfile.resumeUrl}><FileDown size={16} />Resume</a>
      </header>

      <section className={s.profileBand}>
        <div><span className={s.kicker}><span className={s.statusDot} /> SOFTWARE ENGINEER / LUCKNOW, INDIA</span><h1>Devyanshu Agrawal<span>.</span></h1><p>{engineerProfile.summary}</p><div className={s.profileActions}><a href={`mailto:${contactEmail}`}>Let&apos;s talk <ArrowUpRight size={16} /></a><a href={defaultData.profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><Github size={19} /></a><a href={defaultData.profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><Linkedin size={19} /></a></div></div>
        <EngineerCameraControls />
      </section>

      <SelectedProjects />
      <section id="tools" className={e.tools}>
        <header className={e.heading}><h2>Tools you can use</h2><span>SMALL UTILITIES</span></header>
        {piksy && <article className={e.toolRow}><Image size={27} /><div><h3>{piksy.name}</h3><p>{piksy.summary}</p></div><div className={e.toolActions}>{piksy.liveUrl && <a href={piksy.liveUrl}>Open {piksy.name} <ArrowUpRight size={17} /></a>}<Link href={`/preview/entry/work/${piksy.slug}`}>Project notes <ArrowUpRight size={17} /></Link></div></article>}
        <article className={e.toolRow}><Braces size={27} /><div><h3>JSON Desk</h3><p>Format, validate, and export JSON in your browser.</p></div><div className={e.toolActions}><button type="button" onClick={() => setToolOpen(true)}>Open JSON Desk <ArrowUpRight size={17} /></button></div></article>
      </section>

      <section className={s.resumeSection} aria-labelledby="skills-title"><div className={s.sectionHeading}><h2 id="skills-title">What I work with</h2><span>SKILLS / IN PRACTICE</span></div><div className={s.skillColumns}>
        {engineerProfile.skills.map(skill => <div key={skill.title}><h3>{skill.title}</h3><p>{skill.text}</p></div>)}
      </div><div className={s.dsaPractice}><h3>DSA practice in Java</h3><p>{engineerProfile.dsa}</p></div></section>
      <section className={s.resumeSection} id="about"><div className={s.sectionHeading}><h2>Experience & education</h2><span>BACKGROUND</span></div><div className={s.experienceRows}>
        <div><span>{engineerProfile.experience.period}</span><h3>{engineerProfile.experience.company}</h3><div className={s.experienceDetail}><p>{engineerProfile.experience.role}</p><ul>{engineerProfile.experience.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div></div>
        <div><span>Expected June 2027</span><h3>University of Lucknow</h3><p>B.Tech in Computer Science<br />CGPA: 8.8/10</p></div>
      </div></section>
      <section className={s.aboutBand}><span className={s.kicker}>OUTSIDE THE CODE</span><h2>Through the lens.<br /><span>Beyond the screen.</span></h2><div><p>Photographs, field notes, and moments between builds.</p><Link href="/preview/entry/personal">Beyond the Code <ArrowUpRight size={16} /></Link></div></section>
      <section id="contact" className={e.contact}><div><h2>Let&apos;s talk.</h2><p>Available for full-time or part-time internships; remote or onsite, subject to location.</p></div><div><div className={e.emailRow}><a href={`mailto:${contactEmail}`}>{contactEmail}</a><button type="button" onClick={() => void copyEmail()} aria-label="Copy email address" title="Copy email address">{copyState === "copied" ? <Check size={18} /> : <Copy size={18} />}</button></div><a className={e.emailAction} href={`mailto:${contactEmail}`}><Mail size={17} />Email me <ArrowUpRight size={16} /></a><span className={e.copyStatus} role="status">{copyState === "copied" ? "Email copied." : copyState === "failed" ? "Copy unavailable. Select the email address above to copy it." : ""}</span></div></section>
      <footer className={s.workFooter}><Link href="/preview/entry"><ChevronLeft size={15} />Back to the welcome</Link><span>Devyanshu Agrawal / DevyFlow</span><a href={`mailto:${contactEmail}`}><Mail size={15} />Get in touch</a></footer>
      {toolOpen && <JsonDesk onClose={() => setToolOpen(false)} />}
    </main>
  );
}
