"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, ImagePlus, Lock, LogOut, Plus, Save, Trash2, Upload } from "lucide-react";
import {
  getConfiguredAdminEmail,
  getSupabaseUser,
  hasPasscode,
  isConfiguredAdminEmail,
  isSignedIn,
  loadPortfolioData,
  resetLocalData,
  savePortfolioData,
  setPasscode,
  setSignedIn,
  shouldUseSupabaseContent,
  signInSupabaseAdmin,
  signOutSupabaseAdmin,
  signUpSupabaseAdmin,
  slugify,
  uploadSupabaseAsset,
  verifyPasscode
} from "@/lib/content-store";
import type { FieldNote, NoteType, PortfolioData, Project, Screenshot, SectionVisibility, ThumbType } from "@/lib/types";

type AdminTab = "profile" | "sections" | "projects" | "notes" | "resume" | "skills" | "data";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "sections", label: "Sections" },
  { id: "projects", label: "Projects" },
  { id: "notes", label: "Field Notes" },
  { id: "resume", label: "Resume" },
  { id: "skills", label: "Skills" },
  { id: "data", label: "Data" }
];

const homepageSections: { key: keyof SectionVisibility; label: string; description: string }[] = [
  { key: "hero", label: "Hero", description: "Main first-screen intro and proof queue." },
  { key: "proof", label: "Hero proof cards", description: "Small proof cards under the hero copy." },
  { key: "focus", label: "Focus areas", description: "Store intelligence, automation, AI/Python, and proof positioning." },
  { key: "projects", label: "Projects", description: "Public project cards and filters." },
  { key: "notes", label: "Field notes", description: "Curated event, build, demo, and learning gallery." },
  { key: "skills", label: "Skills", description: "AI/Python and web engineering skills." },
  { key: "experience", label: "Experience", description: "Training, education, and practical work timeline." },
  { key: "resume", label: "Resume/contact form", description: "Sanitized resume and routed contact form." },
  { key: "contact", label: "Final contact strip", description: "Bottom contact call-to-action." },
  { key: "footer", label: "Footer", description: "Small closing line at the bottom." }
];

const projectSections: { key: keyof SectionVisibility; label: string; description: string }[] = [
  { key: "projectScreenshots", label: "Project screenshots", description: "Screenshot carousel on each case page." },
  { key: "projectDemo", label: "Project demo", description: "YouTube demo embed area on each case page." },
  { key: "projectCaseStudy", label: "Problem/solution/build", description: "Core written case-study cards." },
  { key: "projectWorkflow", label: "Architecture/workflow", description: "Step-by-step data, API, or user flow." },
  { key: "projectLearning", label: "Challenges/learnings", description: "Implementation decisions and learnings." },
  { key: "projectFaq", label: "FAQ", description: "Recruiter/client questions for each project." }
];

const lines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const toLines = (items?: string[]) => (items || []).join("\n");

const splitRows = (value: string, count: number) =>
  lines(value).map((line) => {
    const parts = line.split("|").map((part) => part.trim());
    while (parts.length < count) parts.push("");
    return parts.slice(0, count);
  });

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be loaded."));
    image.src = src;
  });
}

async function imageFileToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const raw = await readFileAsDataUrl(file);
  const image = await loadImage(raw);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image optimization failed.");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.84);
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
  note
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
  note?: string;
}) {
  return (
    <label className="field">
      {label}
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} type={type} onChange={(event) => onChange(event.target.value)} />
      )}
      {note ? <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{note}</span> : null}
    </label>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle-switch" aria-hidden="true">
        <span />
      </span>
      <span>
        <b>{label}</b>
        <small>{description}</small>
      </span>
    </label>
  );
}

function AssetField({
  label,
  value,
  onChange,
  remoteMode,
  uploadFolder,
  note
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  remoteMode: boolean;
  uploadFolder: string;
  note?: string;
}) {
  const [status, setStatus] = useState("");

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setStatus(remoteMode ? "Uploading to Supabase..." : "Preparing image...");
      const nextUrl = remoteMode ? await uploadSupabaseAsset(file, uploadFolder) : await imageFileToDataUrl(file);
      onChange(nextUrl);
      setStatus(`Uploaded ${file.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="asset-control">
      <Field label={`${label} URL`} value={value} onChange={onChange} note={note || "Paste an image URL, or upload a real screenshot from this computer."} />
      <div className="asset-actions">
        <label className="button secondary upload-button">
          <ImagePlus size={17} />
          Upload image
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
        {value ? (
          <button className="button secondary" type="button" onClick={() => onChange("")}>
            Clear image
          </button>
        ) : null}
      </div>
      {status ? <span className="upload-status">{status}</span> : null}
    </div>
  );
}

function ScreenshotEditor({
  screenshots,
  remoteMode,
  uploadFolder,
  onChange
}: {
  screenshots: Screenshot[];
  remoteMode: boolean;
  uploadFolder: string;
  onChange: (screenshots: Screenshot[]) => void;
}) {
  function updateShot(index: number, changes: Partial<Screenshot>) {
    const next = screenshots.map((shot, shotIndex) => (shotIndex === index ? { ...shot, ...changes } : shot));
    onChange(next);
  }

  return (
    <div className="nested-editor">
      <div className="inline-actions">
        <h3>Screenshots</h3>
        <button className="button secondary" type="button" onClick={() => onChange([...screenshots, { title: "New screenshot", caption: "What this screen proves.", imageUrl: "" }])}>
          <Plus size={17} />
          Add screenshot
        </button>
      </div>
      {screenshots.map((shot, index) => (
        <article className="nested-card" key={`${shot.title}-${index}`}>
          <div className="inline-actions">
            <span className="kicker">Screenshot {index + 1}</span>
            <button
              className="button secondary"
              type="button"
              onClick={() => onChange(screenshots.filter((_, shotIndex) => shotIndex !== index))}
              disabled={screenshots.length <= 1}
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>
          <div className="admin-form-grid">
            <Field label="Title" value={shot.title} onChange={(value) => updateShot(index, { title: value })} />
            <Field label="Caption" value={shot.caption} onChange={(value) => updateShot(index, { caption: value })} />
          </div>
          <AssetField
            label="Screenshot image"
            value={shot.imageUrl || ""}
            remoteMode={remoteMode}
            uploadFolder={uploadFolder}
            onChange={(value) => updateShot(index, { imageUrl: value })}
          />
        </article>
      ))}
    </div>
  );
}

function LoginScreen({ onSignedIn, remoteMode }: { onSignedIn: () => void; remoteMode: boolean }) {
  const [email, setEmail] = useState(getConfiguredAdminEmail());
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [hasExisting, setHasExisting] = useState(false);
  const [status, setStatus] = useState("");
  const allowAdminSignup = process.env.NEXT_PUBLIC_ALLOW_ADMIN_SIGNUP === "true";

  useEffect(() => {
    setHasExisting(hasPasscode());
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    if (remoteMode) {
      try {
        await signInSupabaseAdmin(email, pass);
        onSignedIn();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Supabase sign-in failed.");
      }
      return;
    }
    if (!hasExisting) {
      if (pass !== confirm) {
        setStatus("Passcodes do not match.");
        return;
      }
      await setPasscode(pass);
      onSignedIn();
      return;
    }
    if (await verifyPasscode(pass)) {
      setSignedIn(true);
      onSignedIn();
    } else {
      setStatus("Wrong passcode.");
    }
  }

  async function createSupabaseAccount() {
    if (!remoteMode) return;
    setStatus("");
    try {
      await signUpSupabaseAdmin(email, pass);
      setStatus("Admin account created. If Supabase sent a confirmation email, confirm it first, then sign in.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create admin account.");
    }
  }

  return (
    <main className="shell" style={{ minHeight: "calc(100vh - 66px)", display: "grid", placeItems: "center", padding: "42px 0" }}>
      <form className="admin-card admin-form" style={{ width: "min(520px, 100%)" }} onSubmit={submit}>
        <div className="kicker">{remoteMode ? "Supabase admin sign-in" : hasExisting ? "Admin sign-in" : "Create local passcode"}</div>
        <h1>{remoteMode || hasExisting ? "Welcome back." : "Create your admin passcode."}</h1>
        <p>{remoteMode ? "Sign in with the admin user you created in Supabase Auth." : "Local preview mode saves only in this browser."}</p>
        {remoteMode ? <Field label="Admin email" type="email" value={email} onChange={setEmail} /> : null}
        <Field label={remoteMode ? "Password" : "Passcode"} type="password" value={pass} onChange={setPass} />
        {!remoteMode && !hasExisting ? <Field label="Confirm passcode" type="password" value={confirm} onChange={setConfirm} /> : null}
        <button className="button" type="submit">
          <Lock size={17} />
          {remoteMode || hasExisting ? "Sign in" : "Create and open admin"}
        </button>
        {remoteMode && allowAdminSignup ? (
          <button className="button secondary" type="button" onClick={createSupabaseAccount}>
            Create admin account
          </button>
        ) : null}
        <p className="status">{status}</p>
      </form>
    </main>
  );
}

function projectToForm(project: Project) {
  return {
    ...project,
    tagsText: toLines(project.tags),
    pillsText: toLines(project.pills),
    workflowText: toLines(project.workflow),
    screenshotsText: project.screenshots.map((shot) => `${shot.title} | ${shot.caption} | ${shot.imageUrl || ""}`).join("\n"),
    faqsText: project.faqs.map((faq) => `${faq.question} | ${faq.answer}`).join("\n")
  };
}

function noteToForm(note: FieldNote) {
  return { ...note };
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [remoteMode, setRemoteMode] = useState(false);
  const [signedIn, setSignedInState] = useState(false);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [tab, setTab] = useState<AdminTab>("profile");
  const [selectedProject, setSelectedProject] = useState(0);
  const [selectedNote, setSelectedNote] = useState(0);
  const [status, setStatus] = useState("Saved");
  const [json, setJson] = useState("");

  useEffect(() => {
    async function boot() {
      const usesSupabase = shouldUseSupabaseContent();
      setRemoteMode(usesSupabase);
      if (usesSupabase) {
        const user = await getSupabaseUser();
        setSignedInState(Boolean(user && isConfiguredAdminEmail(user.email)));
      } else {
        setSignedInState(isSignedIn());
      }
      const loaded = await loadPortfolioData();
      setData(loaded);
      setJson(JSON.stringify(loaded, null, 2));
      setReady(true);
    }
    boot();
  }, []);

  const projectForm = useMemo(() => (data?.projects[selectedProject] ? projectToForm(data.projects[selectedProject]) : null), [data, selectedProject]);
  const noteForm = useMemo(() => (data?.notes[selectedNote] ? noteToForm(data.notes[selectedNote]) : null), [data, selectedNote]);

  function updateData(updater: (draft: PortfolioData) => void, dirty = true) {
    setData((current) => {
      if (!current) return current;
      const draft = JSON.parse(JSON.stringify(current)) as PortfolioData;
      updater(draft);
      if (dirty) setStatus("Unsaved changes");
      return draft;
    });
  }

  async function saveAll(message = "Saved") {
    if (!data) return;
    try {
      setStatus("Saving...");
      await savePortfolioData(data);
      setJson(JSON.stringify(data, null, 2));
      setStatus(message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function signOut() {
    if (remoteMode) await signOutSupabaseAdmin();
    else setSignedIn(false);
    setSignedInState(false);
  }

  if (!ready || !data) return null;

  if (!signedIn) {
    return (
      <>
        <AdminTopbar signedIn={false} onSignOut={signOut} />
        <LoginScreen remoteMode={remoteMode} onSignedIn={() => setSignedInState(true)} />
      </>
    );
  }

  return (
    <>
      <AdminTopbar signedIn onSignOut={signOut} />
      <main className="shell admin-shell">
        <div className="section-head">
          <div>
            <div className="kicker">Content manager</div>
            <h1>Edit projects, gallery, resume, and profile.</h1>
          </div>
          <div className="inline-actions">
            <button className="button" type="button" onClick={() => saveAll()}>
              <Save size={17} />
              Save all
            </button>
            <Link className="button secondary" href="/" target="_blank">
              <Eye size={17} />
              Open site
            </Link>
          </div>
        </div>
        <p className="notice">
          {remoteMode
            ? "Production mode is active. Content saves to Supabase and uploaded files go to Supabase Storage."
            : "Local preview mode is active. Add Supabase environment variables to enable auth, database, and storage."}
        </p>

        <div className="admin-layout" style={{ marginTop: 16 }}>
          <aside className="admin-card">
            <div className="admin-tabs">
              {tabs.map((item) => (
                <button className={`tab ${tab === item.id ? "is-active" : ""}`} type="button" key={item.id} onClick={() => setTab(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="skill-list">
              <div className="proof">
                <strong>{data.projects.length}</strong>
                <span>Projects</span>
              </div>
              <div className="proof">
                <strong>{data.notes.length}</strong>
                <span>Gallery notes</span>
              </div>
              <div className="proof">
                <strong>{status}</strong>
                <span>Current state</span>
              </div>
            </div>
          </aside>

          <section className="admin-card">
            {tab === "sections" ? (
              <div className="admin-form">
                <div className="section-head">
                  <div>
                    <div className="kicker">Visibility</div>
                    <h2>Hide sections without deleting content.</h2>
                  </div>
                  <p>Use these controls when a project, gallery, resume, or case-study area is not ready for public viewing yet.</p>
                </div>
                <div className="visibility-grid">
                  <article className="nested-card">
                    <h3>Homepage sections</h3>
                    <div className="toggle-list">
                      {homepageSections.map((item) => (
                        <ToggleField
                          key={item.key}
                          label={item.label}
                          description={item.description}
                          checked={data.sections[item.key]}
                          onChange={(checked) => updateData((draft) => (draft.sections[item.key] = checked))}
                        />
                      ))}
                    </div>
                  </article>
                  <article className="nested-card">
                    <h3>Project page sections</h3>
                    <div className="toggle-list">
                      {projectSections.map((item) => (
                        <ToggleField
                          key={item.key}
                          label={item.label}
                          description={item.description}
                          checked={data.sections[item.key]}
                          onChange={(checked) => updateData((draft) => (draft.sections[item.key] = checked))}
                        />
                      ))}
                    </div>
                  </article>
                </div>
                <div className="inline-actions">
                  <button className="button" type="button" onClick={() => saveAll("Visibility saved")}>
                    <Save size={17} />
                    Save visibility
                  </button>
                </div>
              </div>
            ) : null}

            {tab === "profile" ? (
              <div className="admin-form">
                <div className="section-head">
                  <div>
                    <div className="kicker">Profile</div>
                    <h2>Hero, socials, contact.</h2>
                  </div>
                </div>
                <div className="admin-form-grid">
                  <Field label="Name" value={data.profile.name} onChange={(value) => updateData((draft) => (draft.profile.name = value))} />
                  <Field label="Initials" value={data.profile.initials} onChange={(value) => updateData((draft) => (draft.profile.initials = value))} />
                  <Field label="Role line" value={data.profile.roleLine} onChange={(value) => updateData((draft) => (draft.profile.roleLine = value))} />
                  <Field label="Email" type="email" value={data.profile.email} onChange={(value) => updateData((draft) => (draft.profile.email = value))} />
                  <Field label="GitHub URL" value={data.profile.github} onChange={(value) => updateData((draft) => (draft.profile.github = value))} />
                  <Field label="LinkedIn URL" value={data.profile.linkedin} onChange={(value) => updateData((draft) => (draft.profile.linkedin = value))} />
                  <Field label="YouTube URL" value={data.profile.youtube} onChange={(value) => updateData((draft) => (draft.profile.youtube = value))} />
                  <Field label="Hero prefix" value={data.profile.heroPrefix} onChange={(value) => updateData((draft) => (draft.profile.heroPrefix = value))} />
                </div>
                <Field label="Hero rotating words" textarea value={toLines(data.profile.heroWords)} onChange={(value) => updateData((draft) => (draft.profile.heroWords = lines(value)))} note="One item per line." />
                <Field label="Hero lead" textarea value={data.profile.heroLead} onChange={(value) => updateData((draft) => (draft.profile.heroLead = value))} />
                <Field label="Availability headline" textarea value={data.profile.availability} onChange={(value) => updateData((draft) => (draft.profile.availability = value))} />
              </div>
            ) : null}

            {tab === "projects" && projectForm ? (
              <div className="admin-grid">
                <div>
                  <div className="inline-actions" style={{ marginBottom: 12 }}>
                    <button
                      className="button"
                      type="button"
                      onClick={() => {
                        updateData((draft) => {
                          draft.projects.push({
                            ...draft.projects[0],
                            id: `project-${Date.now()}`,
                            visible: true,
                            title: "New Project",
                            cardSummary: "Short project summary.",
                            outcome: "One-line project outcome."
                          });
                          setSelectedProject(draft.projects.length - 1);
                        });
                      }}
                    >
                      <Plus size={17} />
                      Add
                    </button>
                  </div>
                  <div className="admin-list">
                    {data.projects.map((project, index) => (
                      <button className={`admin-list-item ${index === selectedProject ? "is-active" : ""}`} type="button" key={project.id} onClick={() => setSelectedProject(index)}>
                        {project.title}
                        {project.visible === false ? <span className="hidden-badge">Hidden</span> : null}
                        <br />
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{project.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="admin-form">
                  <ToggleField
                    label="Show this project publicly"
                    description="Turn this off when screenshots, links, or demo video are not ready yet."
                    checked={projectForm.visible !== false}
                    onChange={(checked) => updateData((draft) => (draft.projects[selectedProject].visible = checked))}
                  />
                  <div className="admin-form-grid">
                    <Field label="Title" value={projectForm.title} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].title = value))} />
                    <Field label="Slug / ID" value={projectForm.id} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].id = slugify(value)))} />
                    <label className="field">
                      Type
                      <select value={projectForm.thumbType} onChange={(event) => updateData((draft) => (draft.projects[selectedProject].thumbType = event.target.value as ThumbType))}>
                        <option value="store">store</option>
                        <option value="whatsapp">whatsapp</option>
                        <option value="food">food</option>
                        <option value="ai">ai</option>
                      </select>
                    </label>
                    <Field label="Kicker" value={projectForm.kicker} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].kicker = value))} />
                    <Field label="Status" value={projectForm.status} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].status = value))} />
                    <Field label="Role" value={projectForm.role} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].role = value))} />
                    <Field label="Stack" value={projectForm.stack} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].stack = value))} />
                    <Field label="GitHub URL" value={projectForm.githubUrl || ""} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].githubUrl = value))} />
                    <Field label="Live URL" value={projectForm.liveUrl || ""} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].liveUrl = value))} />
                    <Field label="YouTube demo URL" value={projectForm.youtubeUrl || ""} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].youtubeUrl = value))} />
                  </div>
                  <AssetField
                    label="Project thumbnail"
                    value={projectForm.thumbnailUrl || ""}
                    remoteMode={remoteMode}
                    uploadFolder={`projects/${projectForm.id}/thumbnail`}
                    onChange={(value) => updateData((draft) => (draft.projects[selectedProject].thumbnailUrl = value))}
                  />
                  <Field label="Card summary" textarea value={projectForm.cardSummary} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].cardSummary = value))} />
                  <Field label="One-line outcome" textarea value={projectForm.outcome} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].outcome = value))} />
                  <div className="admin-form-grid">
                    <Field label="Tags" textarea value={projectForm.tagsText} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].tags = lines(value)))} note="One per line." />
                    <Field label="Pills" textarea value={projectForm.pillsText} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].pills = lines(value)))} note="One per line." />
                  </div>
                  <div className="admin-form-grid">
                    <Field label="Problem" textarea value={projectForm.problem} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].problem = value))} />
                    <Field label="Solution" textarea value={projectForm.solution} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].solution = value))} />
                  </div>
                  <Field label="What I built" textarea value={projectForm.built} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].built = value))} />
                  <Field label="Workflow steps" textarea value={projectForm.workflowText} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].workflow = lines(value)))} note="One step per line." />
                  <div className="admin-form-grid">
                    <Field label="Challenges" textarea value={projectForm.challenges} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].challenges = value))} />
                    <Field label="Learnings" textarea value={projectForm.learnings} onChange={(value) => updateData((draft) => (draft.projects[selectedProject].learnings = value))} />
                  </div>
                  <ScreenshotEditor
                    screenshots={projectForm.screenshots}
                    remoteMode={remoteMode}
                    uploadFolder={`projects/${projectForm.id}/screenshots`}
                    onChange={(screenshots) =>
                      updateData((draft) => {
                        draft.projects[selectedProject].screenshots = screenshots;
                      })
                    }
                  />
                  <Field
                    label="FAQ"
                    textarea
                    value={projectForm.faqsText}
                    onChange={(value) =>
                      updateData((draft) => {
                        draft.projects[selectedProject].faqs = splitRows(value, 2).map(([question, answer]) => ({ question, answer }));
                      })
                    }
                    note="One per line: Question | Answer"
                  />
                  <div className="inline-actions">
                    <button className="button" type="button" onClick={() => saveAll("Project saved")}>
                      <Save size={17} />
                      Save project
                    </button>
                    <Link className="button secondary" href={`/projects/${projectForm.id}`} target="_blank">
                      <Eye size={17} />
                      Preview
                    </Link>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        if (data.projects.length <= 1 || !window.confirm("Delete this project?")) return;
                        updateData((draft) => {
                          draft.projects.splice(selectedProject, 1);
                          setSelectedProject(Math.max(0, selectedProject - 1));
                        });
                      }}
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "notes" && noteForm ? (
              <div className="admin-grid">
                <div>
                  <button
                    className="button"
                    type="button"
                    style={{ marginBottom: 12 }}
                    onClick={() => {
                      updateData((draft) => {
                        draft.notes.push({ id: `note-${Date.now()}`, visible: true, title: "New field note", label: "Note", type: "event", caption: "Caption for this photo or learning moment." });
                        setSelectedNote(draft.notes.length - 1);
                      });
                    }}
                  >
                    <Plus size={17} />
                    Add note
                  </button>
                  <div className="admin-list">
                    {data.notes.map((note, index) => (
                      <button className={`admin-list-item ${index === selectedNote ? "is-active" : ""}`} type="button" key={note.id} onClick={() => setSelectedNote(index)}>
                        {note.title}
                        {note.visible === false ? <span className="hidden-badge">Hidden</span> : null}
                        <br />
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{note.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="admin-form">
                  <ToggleField
                    label="Show this note publicly"
                    description="Turn this off for casual photos or unfinished captions."
                    checked={noteForm.visible !== false}
                    onChange={(checked) => updateData((draft) => (draft.notes[selectedNote].visible = checked))}
                  />
                  <div className="admin-form-grid">
                    <Field label="Title" value={noteForm.title} onChange={(value) => updateData((draft) => (draft.notes[selectedNote].title = value))} />
                    <Field label="Label" value={noteForm.label} onChange={(value) => updateData((draft) => (draft.notes[selectedNote].label = value))} />
                    <label className="field">
                      Type
                      <select value={noteForm.type} onChange={(event) => updateData((draft) => (draft.notes[selectedNote].type = event.target.value as NoteType))}>
                        <option value="event">event</option>
                        <option value="build">build</option>
                        <option value="demo">demo</option>
                        <option value="research">research</option>
                      </select>
                    </label>
                  </div>
                  <AssetField
                    label="Note image"
                    value={noteForm.imageUrl || ""}
                    remoteMode={remoteMode}
                    uploadFolder={`notes/${noteForm.id}`}
                    onChange={(value) => updateData((draft) => (draft.notes[selectedNote].imageUrl = value))}
                  />
                  <Field label="Caption" textarea value={noteForm.caption} onChange={(value) => updateData((draft) => (draft.notes[selectedNote].caption = value))} />
                  <div className="inline-actions">
                    <button className="button" type="button" onClick={() => saveAll("Note saved")}>
                      <Save size={17} />
                      Save note
                    </button>
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        if (data.notes.length <= 1 || !window.confirm("Delete this note?")) return;
                        updateData((draft) => {
                          draft.notes.splice(selectedNote, 1);
                          setSelectedNote(Math.max(0, selectedNote - 1));
                        });
                      }}
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "resume" ? (
              <div className="admin-form">
                <div className="section-head">
                  <div>
                    <div className="kicker">Resume</div>
                    <h2>Public download and request flow.</h2>
                  </div>
                </div>
                <Field label="Public resume title" value={data.resume.publicTitle} onChange={(value) => updateData((draft) => (draft.resume.publicTitle = value))} />
                <Field label="Public resume note" textarea value={data.resume.publicNote} onChange={(value) => updateData((draft) => (draft.resume.publicNote = value))} />
                <Field label="Download resume URL" value={data.resume.downloadUrl} onChange={(value) => updateData((draft) => (draft.resume.downloadUrl = value))} />
                <Field label="Request full resume URL" value={data.resume.requestUrl} onChange={(value) => updateData((draft) => (draft.resume.requestUrl = value))} />
              </div>
            ) : null}

            {tab === "skills" ? (
              <div className="admin-form">
                <div className="admin-form-grid">
                  <Field label="Primary skills title" value={data.skills.primaryTitle} onChange={(value) => updateData((draft) => (draft.skills.primaryTitle = value))} />
                  <Field label="Secondary skills title" value={data.skills.secondaryTitle} onChange={(value) => updateData((draft) => (draft.skills.secondaryTitle = value))} />
                </div>
                <Field label="Primary skills description" textarea value={data.skills.primaryDescription} onChange={(value) => updateData((draft) => (draft.skills.primaryDescription = value))} />
                <Field label="Primary skill rows" textarea value={data.skills.primaryRows.map((row) => row.join(" | ")).join("\n")} onChange={(value) => updateData((draft) => (draft.skills.primaryRows = splitRows(value, 2) as [string, string][]))} note="One per line: Label | Description" />
                <Field label="Secondary skill rows" textarea value={data.skills.secondaryRows.map((row) => row.join(" | ")).join("\n")} onChange={(value) => updateData((draft) => (draft.skills.secondaryRows = splitRows(value, 2) as [string, string][]))} note="One per line: Label | Description" />
                <Field
                  label="Experience rows"
                  textarea
                  value={data.experience.map((row) => `${row.when} | ${row.title} | ${row.summary}`).join("\n")}
                  onChange={(value) => updateData((draft) => (draft.experience = splitRows(value, 3).map(([when, title, summary]) => ({ when, title, summary }))))}
                  note="One per line: Date | Title | Summary"
                />
              </div>
            ) : null}

            {tab === "data" ? (
              <div className="admin-form">
                <div className="section-head">
                  <div>
                    <div className="kicker">Data</div>
                    <h2>Backup, import, reset.</h2>
                  </div>
                </div>
                <label className="field">
                  Export / import JSON
                  <textarea value={json} onChange={(event) => setJson(event.target.value)} style={{ minHeight: 300 }} />
                </label>
                <div className="inline-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => {
                      setJson(JSON.stringify(data, null, 2));
                      setStatus("Export ready");
                    }}
                  >
                    <Download size={17} />
                    Export
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={async () => {
                      try {
                        const parsed = JSON.parse(json) as PortfolioData;
                        setData(parsed);
                        await savePortfolioData(parsed);
                        setStatus("Imported and saved");
                      } catch {
                        setStatus("Import failed");
                      }
                    }}
                  >
                    <Upload size={17} />
                    Import
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={async () => {
                      const next = resetLocalData();
                      setData(next);
                      setJson(JSON.stringify(next, null, 2));
                      setSelectedProject(0);
                      setSelectedNote(0);
                      if (remoteMode) {
                        await savePortfolioData(next);
                        setStatus("Reset defaults saved to Supabase");
                      } else {
                        setStatus("Reset to defaults");
                      }
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
}

function AdminTopbar({ signedIn, onSignOut }: { signedIn: boolean; onSignOut: () => void | Promise<void> }) {
  return (
    <header className="topbar">
      <nav className="shell nav" aria-label="Admin navigation">
        <Link className="brand" href="/">
          <span className="mark">DA</span>
          <span>Portfolio Admin</span>
        </Link>
        <div className="nav-actions">
          <Link className="button secondary" href="/">
            <Eye size={17} />
            Preview site
          </Link>
          {signedIn ? (
            <button className="button secondary" type="button" onClick={onSignOut}>
              <LogOut size={17} />
              Sign out
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
