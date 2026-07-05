"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Github, Moon, Sun } from "lucide-react";
import { loadPortfolioData, youtubeEmbedUrl } from "@/lib/content-store";
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

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [shotIndex, setShotIndex] = useState(0);

  useEffect(() => {
    loadPortfolioData().then(setData);
  }, []);

  const project = useMemo(() => {
    if (!data) return null;
    return data.projects.find((item) => item.id === params.id) || data.projects[0] || null;
  }, [data, params.id]);

  const nextProject = useMemo(() => {
    if (!data || !project) return null;
    const publicProjects = data.projects.filter((item) => item.visible !== false);
    if (!publicProjects.length) return null;
    const index = Math.max(0, publicProjects.findIndex((item) => item.id === project.id));
    return publicProjects[(index + 1) % publicProjects.length] || null;
  }, [data, project]);

  if (!data || !project) return null;

  const screenshot = project.screenshots[shotIndex] || { title: "Screenshot pending", caption: "A real project screenshot can be added here.", imageUrl: "" };
  const embedUrl = youtubeEmbedUrl(project.youtubeUrl);
  const imageStyle = screenshot.imageUrl ? ({ "--image": `url(${screenshot.imageUrl})` } as React.CSSProperties) : undefined;
  const { sections } = data;
  const showMedia = sections.projectScreenshots || sections.projectDemo;

  return (
    <>
      <header className="topbar">
        <nav className="shell nav" aria-label="Project navigation">
          <Link className="brand" href="/#work">
            <span className="mark">{data.profile.initials}</span>
            <span>Project case study</span>
          </Link>
          <div className="nav-actions">
            <Link className="button secondary" href="/#work">
              <ArrowLeft size={17} />
              Back
            </Link>
            <ThemeButton />
          </div>
        </nav>
      </header>

      <main>
        <section className="shell hero case-hero">
          <div>
            <div className="kicker">{project.kicker}</div>
            <h1>{project.title}</h1>
            <p className="lead">{project.outcome}</p>
            <div className="hero-actions">
              {sections.projectScreenshots ? (
                <a className="button" href="#screenshots">
                  View screenshots
                </a>
              ) : null}
              {sections.projectDemo ? (
                <a className="button secondary" href="#demo">
                  Project demo
                </a>
              ) : null}
              {project.githubUrl ? (
                <a className="button secondary" href={project.githubUrl} target="_blank" rel="noreferrer">
                  <Github size={17} />
                  GitHub
                </a>
              ) : (
                <span className="button secondary pending">GitHub pending</span>
              )}
              {project.liveUrl ? (
                <a className="button secondary" href={project.liveUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={17} />
                  Live site
                </a>
              ) : (
                <span className="button secondary pending">Live pending</span>
              )}
            </div>
          </div>
          <aside className="case-summary">
            <div className="summary-row">
              <span>Role</span>
              <b>{project.role}</b>
            </div>
            <div className="summary-row">
              <span>Stack</span>
              <b>{project.stack}</b>
            </div>
            <div className="summary-row">
              <span>Status</span>
              <b>{project.status}</b>
            </div>
          </aside>
        </section>

        {showMedia ? (
          <section className="shell section" id="screenshots">
            <div className="section-head">
              <div>
                <div className="kicker">Screenshots and Demo</div>
                <h2>Visual proof first.</h2>
              </div>
              <p>Screenshots and demos make the build easier to verify at a glance: what the interface does, how it behaves, and where the technical work shows up.</p>
            </div>
            <div className={`media-grid ${sections.projectScreenshots && sections.projectDemo ? "" : "single"}`}>
              {sections.projectScreenshots ? (
                <article className="carousel">
                  <div className={`carousel-frame ${screenshot.imageUrl ? "has-image" : ""}`} style={imageStyle}>
                    <div className="screen-ui">
                      <div className="screen-title">{screenshot.title}</div>
                      <p className="screen-caption">{screenshot.caption}</p>
                    </div>
                  </div>
                  <div className="carousel-controls">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setShotIndex((index) => (index - 1 + project.screenshots.length) % project.screenshots.length)}
                      disabled={project.screenshots.length < 2}
                    >
                      Previous
                    </button>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setShotIndex((index) => (index + 1) % project.screenshots.length)}
                      disabled={project.screenshots.length < 2}
                    >
                      Next
                    </button>
                  </div>
                </article>
              ) : null}
              {sections.projectDemo ? (
                <article className="video-card" id="demo">
                  <div className="video-slot">
                    {embedUrl ? <iframe src={embedUrl} title={`${project.title} demo`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="play-mark">Demo</div>}
                  </div>
                  <p>{embedUrl ? "Project demo embedded from YouTube." : "YouTube embed will load here after the demo URL is added."}</p>
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

        {sections.projectCaseStudy ? (
          <section className="shell section">
          <div className="section-head">
            <div>
              <div className="kicker">Case Study</div>
              <h2>Problem, solution, build.</h2>
            </div>
            <p>Keep the hiring signal direct: what problem existed, what you built, and what technical choices matter.</p>
          </div>
          <div className="content-grid">
            <article className="content-card">
              <h3>Problem</h3>
              <p>{project.problem}</p>
            </article>
            <article className="content-card">
              <h3>Solution</h3>
              <p>{project.solution}</p>
            </article>
            <article className="content-card">
              <h3>What I built</h3>
              <p>{project.built}</p>
            </article>
          </div>
          </section>
        ) : null}

        {sections.projectWorkflow ? (
          <section className="shell section">
          <div className="section-head">
            <div>
              <div className="kicker">Architecture</div>
              <h2>Workflow people can follow.</h2>
            </div>
            <p>Use this to show the data/API/user flow without hiding it inside vague project text.</p>
          </div>
          <div className="workflow">
            {project.workflow.map((step) => (
              <article className="workflow-step" key={step}>
                <div>
                  <h3>Workflow step</h3>
                  <p>{step}</p>
                </div>
              </article>
            ))}
          </div>
          </section>
        ) : null}

        {sections.projectLearning ? (
          <section className="shell section">
          <div className="section-head">
            <div>
              <div className="kicker">Learning</div>
              <h2>Challenges and decisions.</h2>
            </div>
            <p>Recruiters and freelance clients care about how you think through implementation, tradeoffs, and reliability.</p>
          </div>
          <div className="two-col">
            <article className="content-card">
              <h3>Challenges</h3>
              <p>{project.challenges}</p>
            </article>
            <article className="content-card">
              <h3>Learnings</h3>
              <p>{project.learnings}</p>
            </article>
          </div>
          </section>
        ) : null}

        {sections.projectFaq ? (
          <section className="shell section">
          <div className="section-head">
            <div>
              <div className="kicker">FAQ</div>
              <h2>Questions this page should answer.</h2>
            </div>
            <p>These FAQs make the project easier to scan and give you a place to answer common recruiter/client questions.</p>
          </div>
          <div className="faq-list">
            {project.faqs.map((faq) => (
              <article className="faq-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
          </section>
        ) : null}

        <div className="shell pager">
          <Link className="button secondary" href="/#work">
            Back to projects
          </Link>
          {nextProject ? (
            <Link className="button" href={`/projects/${nextProject.id}`}>
              Next: {nextProject.title}
            </Link>
          ) : null}
        </div>
      </main>
    </>
  );
}
