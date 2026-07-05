"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Github, Linkedin, Mail, Moon, Sun } from "lucide-react";
import { loadPortfolioData } from "@/lib/content-store";
import type { PortfolioData, Project } from "@/lib/types";

function ThemeButton() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("devyanshu-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const next = saved || preferred;
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("devyanshu-theme", next);
  }

  return (
    <button className="icon-button secondary" type="button" onClick={toggleTheme} aria-label="Toggle color theme">
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function MiniVisual({ project }: { project: Project }) {
  const imageStyle = project.thumbnailUrl ? ({ "--image": `url(${project.thumbnailUrl})` } as React.CSSProperties) : undefined;
  const classes = `thumb ${project.thumbnailUrl ? "has-image" : project.thumbType}`;

  return (
    <div className={classes} style={imageStyle}>
      <div className="thumb-card">
        {project.thumbType === "whatsapp" || project.thumbType === "food" ? (
          <div className="chat-flow" aria-hidden="true">
            <span className="bubble" />
            <span className="bubble alt" />
            <span className="bubble" />
          </div>
        ) : (
          <div className="mini-chart" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project" data-tags={project.tags.join(" ")}>
      <MiniVisual project={project} />
      <div className="project-body">
        <div>
          <h3>{project.title}</h3>
          <p>{project.cardSummary}</p>
          <div className="project-meta">
            {project.pills.map((pill) => (
              <span className="pill" key={pill}>
                {pill}
              </span>
            ))}
          </div>
        </div>
        <div className="project-links">
          <Link className="mini-button" href={`/projects/${project.id}`}>
            Open case
          </Link>
          <span className="mini-button secondary pending">{project.githubUrl || project.liveUrl ? "Links added" : "Links pending"}</span>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    loadPortfolioData().then(setData);
  }, []);

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      document.body.style.setProperty("--mx", `${event.clientX}px`);
      document.body.style.setProperty("--my", `${event.clientY}px`);
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    if (!data?.profile.heroWords.length) return;
    const timer = window.setInterval(() => {
      setWordIndex((index) => (index + 1) % data.profile.heroWords.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [data?.profile.heroWords.length]);

  const visibleProjects = useMemo(() => {
    if (!data) return [];
    const publicProjects = data.projects.filter((project) => project.visible !== false);
    if (activeFilter === "all") return publicProjects;
    return publicProjects.filter((project) => project.tags.includes(activeFilter));
  }, [activeFilter, data]);

  if (!data) return null;

  const { profile, resume, skills, sections } = data;
  const heroWord = profile.heroWords[wordIndex] || profile.heroWords[0] || "products";
  const publicProjects = data.projects.filter((project) => project.visible !== false);
  const publicNotes = data.notes.filter((note) => note.visible !== false);
  const navItems = [
    { href: "#work", label: "Work", show: sections.projects },
    { href: "#skills", label: "Skills", show: sections.skills },
    { href: "#notes", label: "Notes", show: sections.notes },
    { href: "#experience", label: "Experience", show: sections.experience },
    { href: "#contact", label: "Contact", show: sections.resume || sections.contact }
  ];

  return (
    <>
      <header className="topbar">
        <nav className="shell nav" aria-label="Main navigation">
          <Link className="brand" href="#top">
            <span className="mark">{profile.initials}</span>
            <span>{profile.name}</span>
          </Link>
          <div className="navlinks">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <a href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
          </div>
          <div className="nav-actions">
            <a className="icon-button secondary" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github size={17} />
            </a>
            <a className="icon-button secondary" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={17} />
            </a>
            <ThemeButton />
            <a className="button" href={`mailto:${profile.email}`}>
              <Mail size={17} />
              Email
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        {sections.hero ? (
          <section className="shell hero">
          <div>
            <div className="eyebrow">
              <span className="status-dot" />
              {profile.name} - {profile.roleLine}
            </div>
            <h1>
              {profile.heroPrefix} <span className="dynamic-word">{heroWord}</span>
            </h1>
            <p className="lead">{profile.heroLead}</p>
            <div className="hero-actions">
              {sections.projects ? (
                <a className="button" href="#work">
                  View project cases
                </a>
              ) : null}
              {sections.skills ? (
                <a className="button secondary" href="#skills">
                  AI + Python skills
                </a>
              ) : null}
              <a className="button secondary" href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="button secondary" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              {sections.projects ? (
                <a className="button secondary" href="#work">
                  Project demos
                </a>
              ) : null}
            </div>
            {sections.proof ? (
              <div className="proof-row" aria-label="Profile proof points">
                {publicProjects.slice(0, 2).map((project) => (
                  <div className="proof" key={project.id}>
                    <strong>{project.title}</strong>
                    <span>{project.cardSummary}</span>
                  </div>
                ))}
                <div className="proof">
                  <strong>AI + Python</strong>
                  <span>OpenAI SDK, Vertex AI, NLP/BioBERT, workflow scripts</span>
                </div>
                <div className="proof">
                  <strong>Case-study pages</strong>
                  <span>Screenshots, video demo, FAQs, GitHub, live links</span>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="workbench" aria-label="Portfolio proof queue">
            <div className="workbench-screen">
              <div className="kicker">Current build queue</div>
              <h2>Project proof queue.</h2>
              {publicProjects.slice(0, 3).map((project, index) => (
                <div className="queue-card" key={project.id}>
                  <div className="queue-top">
                    <span>
                      {String(index + 1).padStart(2, "0")} - {project.title}
                    </span>
                    <b>{project.kicker}</b>
                  </div>
                  <div className="queue-bar">
                    <span style={{ "--value": `${86 - index * 12}%` } as React.CSSProperties} />
                  </div>
                  <p>{project.outcome}</p>
                </div>
              ))}
            </div>
            <div className="live-strip">
              <div className="live-item">
                <b>{publicProjects.length}+</b>
                <p>Project case studies</p>
              </div>
              <div className="live-item">
                <b>AI</b>
                <p>Positioning tied to proof</p>
              </div>
              <div className="live-item">
                <b>Proof</b>
                <p>Screenshots, demos, FAQs</p>
              </div>
            </div>
          </aside>
          </section>
        ) : null}

        {sections.focus ? (
          <section className="shell section">
          <div className="section-head">
            <div>
              <div className="kicker">What the site should prove</div>
              <h2>Clear product thinking, visible technical depth.</h2>
            </div>
            <p>
              The homepage should not hide important details. Recruiters and clients should see the stack, role, result, demo, GitHub link,
              screenshots, and AI/Python context without digging.
            </p>
          </div>
          <div className="focus-grid">
            <article className="focus-card">
              <h3>Store intelligence systems</h3>
              <p>Dashboards and data views that explain what changed, why it matters, and what action a user should take.</p>
            </article>
            <article className="focus-card">
              <h3>WhatsApp/API automations</h3>
              <p>Webhook-style flows, notifications, support/order journeys, backend services, and practical integration logic.</p>
            </article>
            <article className="focus-card">
              <h3>AI and Python layer</h3>
              <p>OpenAI SDK, Vertex AI, NLP/BioBERT, FastAPI, scripts, benchmark work, and automation tied to actual projects.</p>
            </article>
            <article className="focus-card">
              <h3>Recruiter-ready proof</h3>
              <p>Every major project can have a thumbnail, screenshots, video, FAQs, GitHub link, live link, and clear outcome.</p>
            </article>
          </div>
          </section>
        ) : null}

        {sections.projects ? (
          <section className="shell section" id="work">
          <div className="section-head">
            <div>
              <div className="kicker">Projects</div>
              <h2>Project cards with proof first.</h2>
            </div>
            <p>Every card opens a case page with visible context: outcome, role, stack, screenshots, demo space, GitHub, and live links.</p>
          </div>
          <div className="filters" aria-label="Project filters">
            {["all", "ai", "frontend", "automation", "backend"].map((filter) => (
              <button className={`filter ${activeFilter === filter ? "is-active" : ""}`} type="button" key={filter} onClick={() => setActiveFilter(filter)}>
                {filter === "all" ? "All" : filter}
              </button>
            ))}
          </div>
          <div className="projects">
            {visibleProjects.map((project) => (
              <ProjectCard project={project} key={project.id} />
            ))}
          </div>
          </section>
        ) : null}

        {sections.notes ? (
          <section className="shell section" id="notes">
          <div className="section-head">
            <div>
              <div className="kicker">Field Notes</div>
              <h2>Behind the work, curated.</h2>
            </div>
            <p>Events, build logs, demos, and learning moments. Each note should explain what happened, what you learned, and why it matters.</p>
          </div>
          <div className="notes-grid">
            {publicNotes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className={`note-shot ${note.imageUrl ? "has-image" : note.type}`} style={note.imageUrl ? ({ "--image": `url(${note.imageUrl})` } as React.CSSProperties) : undefined}>
                  <span>{note.label}</span>
                </div>
                <h3>{note.title}</h3>
                <p>{note.caption}</p>
              </article>
            ))}
          </div>
          </section>
        ) : null}

        {sections.skills ? (
          <section className="shell section" id="skills">
          <div className="section-head">
            <div>
              <div className="kicker">Skills</div>
              <h2>Intelligence stack for real products.</h2>
            </div>
            <p>This groups the skills around the work you want to sell: AI-enabled products, Python automation, dashboards, integrations, and reliable web systems.</p>
          </div>
          <div className="skills-board">
            <article className="skill-panel panel">
              <h3>{skills.primaryTitle}</h3>
              <p>{skills.primaryDescription}</p>
              <div className="skill-list">
                {skills.primaryRows.map(([label, value]) => (
                  <div className="skill-row" key={label}>
                    <b>{label}</b>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="skill-panel panel">
              <h3>{skills.secondaryTitle}</h3>
              <div className="skill-list">
                {skills.secondaryRows.map(([label, value]) => (
                  <div className="skill-row" key={label}>
                    <b>{label}</b>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
          </section>
        ) : null}

        {sections.experience ? (
          <section className="shell section" id="experience">
          <div className="section-head">
            <div>
              <div className="kicker">Experience</div>
              <h2>Recent practical web work.</h2>
            </div>
            <p>Recruiters should be able to scan this quickly: role, dates, and what kind of engineering you practiced.</p>
          </div>
          <div className="timeline panel">
            {data.experience.map((item) => (
              <div className="time-item" key={`${item.when}-${item.title}`}>
                <time>{item.when}</time>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
          </section>
        ) : null}

        {sections.resume ? (
          <section className="shell section" id="contact">
          <div className="resume-contact">
            <article className="resume-card">
              <div className="kicker">Resume</div>
              <h2>{resume.publicTitle}</h2>
              <p>{resume.publicNote}</p>
              <div className="resume-actions" style={{ marginTop: 20 }}>
                <a className="button" href={resume.downloadUrl} download>
                  Download resume
                </a>
                <a className="button secondary" href={resume.requestUrl}>
                  Request full resume
                </a>
              </div>
            </article>
            <form className="contact-form" action={`mailto:${profile.email}`} method="post" encType="text/plain">
              <label className="field">
                Purpose
                <select name="purpose">
                  <option>Hiring</option>
                  <option>Freelance project</option>
                  <option>Collaboration</option>
                  <option>Project question</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field">
                Email
                <input name="email" type="email" placeholder="your@email.com" />
              </label>
              <label className="field">
                Message
                <textarea name="message" rows={4} placeholder="Tell me what you want to discuss" />
              </label>
              <button className="button" type="submit">
                Send routed message
              </button>
            </form>
          </div>
          </section>
        ) : null}

        {sections.contact ? (
          <section className="shell section" id={sections.resume ? undefined : "contact"}>
          <div className="contact">
            <div>
              <div className="kicker">Contact</div>
              <h2>{profile.availability}</h2>
            </div>
            <div className="contact-actions">
              <a className="button secondary" href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="button secondary" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a className="button secondary" href="#work">
                Project demos
              </a>
              <a className="button" href={`mailto:${profile.email}`}>
                Email me
              </a>
            </div>
          </div>
          </section>
        ) : null}
      </main>

      {sections.footer ? <footer className="shell footer">Devyanshu Agrawal - product-minded web, AI, and automation portfolio.</footer> : null}
    </>
  );
}
