"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Aperture,
  Camera,
  Code2,
  Download,
  Eye,
  Home,
  Lock,
  LogOut,
  RotateCcw,
  Save,
  Upload
} from "lucide-react";
import EngineerProjectEditor from "@/components/engineer-project-editor";
import HomeExperienceEditor from "@/components/home-experience-editor";
import PhotographyEditor from "@/components/photography-editor";
import {
  getSupabaseUser,
  hasPasscode,
  isConfiguredAdminEmail,
  isSignedIn,
  loadPortfolioData,
  mergeData,
  savePortfolioData,
  setPasscode,
  setSignedIn,
  shouldUseSupabaseContent,
  signOutSupabaseAdmin,
  verifyPasscode
} from "@/lib/content-store";
import { defaultData } from "@/lib/default-data";
import { initialEngineerProjects } from "@/lib/engineer-project-store";
import { initialHomeExperience } from "@/lib/home-content";
import { initialPhotography, normalizePhotography } from "@/lib/photography-content";
import type { PortfolioData } from "@/lib/types";
import s from "./admin.module.css";

type StudioTab = "home" | "engineering" | "photography";

const destinations = [
  { id: "home" as const, label: "Home", path: "/preview/entry", icon: Home, note: "Entry experience" },
  { id: "engineering" as const, label: "Engineering", path: "/preview/entry/work", icon: Code2, note: "Projects and contact" },
  { id: "photography" as const, label: "Photography", path: "/preview/entry/personal", icon: Camera, note: "Archive and profile" }
];

function completeData(data: PortfolioData): PortfolioData {
  return {
    ...data,
    homeExperience: data.homeExperience ?? initialHomeExperience(),
    engineerProjects: data.engineerProjects ?? initialEngineerProjects(),
    photography: normalizePhotography(data.photography)
  };
}

function LoginScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [creating] = useState(() => !hasPasscode());
  const [passcode, setPasscodeValue] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    try {
      if (creating) {
        if (passcode.length < 6) throw new Error("Use at least six characters.");
        if (passcode !== confirmation) throw new Error("The passcodes do not match.");
        await setPasscode(passcode);
      } else {
        if (!(await verifyPasscode(passcode))) throw new Error("That passcode is not correct.");
        setSignedIn(true);
      }
      onSignedIn();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign-in failed.");
    }
  }

  return (
    <main className={s.loginPage}>
      <form className={s.loginPanel} onSubmit={submit}>
        <Aperture size={42} strokeWidth={1.25} />
        <span className={s.eyebrow}>LOCAL STUDIO</span>
        <h1>{creating ? "Create your studio passcode." : "Open the studio."}</h1>
        <p>This development-only passcode protects editing in this browser. Production uses Supabase and MFA.</p>
        <label><span>Passcode</span><input type="password" value={passcode} onChange={(event) => setPasscodeValue(event.target.value)} required /></label>
        {creating && <label><span>Confirm passcode</span><input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>}
        {status && <p className={s.error} role="alert">{status}</p>}
        <button type="submit"><Lock size={17} />{creating ? "Create and enter" : "Enter studio"}</button>
        <Link href="/preview/entry"><Eye size={16} />Open current experience</Link>
      </form>
    </main>
  );
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [remoteMode, setRemoteMode] = useState(false);
  const [signedIn, setSignedInState] = useState(false);
  const [tab, setTab] = useState<StudioTab>("home");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [status, setStatus] = useState("Saved");

  useEffect(() => {
    async function boot() {
      const usesSupabase = shouldUseSupabaseContent();
      setRemoteMode(usesSupabase);
      if (usesSupabase) {
        const user = await getSupabaseUser();
        setSignedInState(Boolean(user && isConfiguredAdminEmail(user.email)));
        if (!user || !isConfiguredAdminEmail(user.email)) {
          window.location.replace("/admin/login");
          return;
        }
      } else {
        setSignedInState(isSignedIn());
      }
      setData(completeData(await loadPortfolioData()));
      setReady(true);
    }
    void boot();
  }, []);

  function updateData(updater: (draft: PortfolioData) => void) {
    setData((current) => {
      if (!current) return current;
      const draft = JSON.parse(JSON.stringify(current)) as PortfolioData;
      updater(draft);
      setStatus("Unsaved changes");
      return draft;
    });
  }

  async function saveAll(message = "Saved") {
    if (!data) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.profile.email.trim())) {
      setStatus("Enter a valid engineering contact email.");
      return;
    }
    try {
      setStatus("Saving...");
      const next = completeData({ ...data, profile: { ...data.profile, email: data.profile.email.trim() } });
      await savePortfolioData(next);
      setData(next);
      setStatus(message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function signOut() {
    if (remoteMode) {
      await signOutSupabaseAdmin();
      window.location.assign("/admin/login");
      return;
    }
    setSignedIn(false);
    setSignedInState(false);
  }

  function downloadBackup() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(completeData(data), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `devyflow-studio-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file: File) {
    try {
      const incoming = JSON.parse(await file.text()) as Partial<PortfolioData>;
      setData(completeData(mergeData(defaultData, incoming)));
      setStatus("Backup loaded. Review it, then save.");
    } catch {
      setStatus("That backup file could not be read.");
    }
  }

  if (!ready || !data) return <main className={s.loading}>Preparing studio...</main>;
  if (!signedIn) return remoteMode ? <main className={s.loading}>Verifying secure session...</main> : <LoginScreen onSignedIn={() => setSignedInState(true)} />;

  const engineeringProjects = data.engineerProjects ?? initialEngineerProjects();
  const homeExperience = data.homeExperience ?? initialHomeExperience();
  const photography = normalizePhotography(data.photography);
  const activeIndex = destinations.findIndex((item) => item.id === tab);
  const activeDestination = destinations[activeIndex] ?? destinations[0];
  const previewPath = activeDestination.path;

  return (
    <div className={s.studio} data-area={tab}>
      <header className={s.topbar}>
        <Link className={s.brand} href="/preview/entry"><Aperture size={25} /><span>DevyFlow Studio</span></Link>
        <div className={s.topActions}>
          <span className={s.saveState} data-dirty={status === "Unsaved changes"}>{status}</span>
          <button type="button" onClick={() => void saveAll()}><Save size={17} />Save all</button>
          <Link href={previewPath} target="_blank"><Eye size={17} />Preview {activeDestination.label}</Link>
          <button type="button" className={s.iconButton} onClick={() => void signOut()} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button>
        </div>
      </header>

      <div className={s.workspace}>
        <aside className={s.sidebar}>
          <div className={s.modeLabel}><span>CONTROL ROOM</span><b>{String(activeIndex + 1).padStart(2, "0")} / 03</b></div>
          <nav aria-label="Studio sections">
            {destinations.map((item, index) => <button key={item.id} type="button" data-active={tab === item.id} onClick={() => setTab(item.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span><item.icon size={19} /><div><strong>{item.label}</strong><small>{item.note}</small></div>
            </button>)}
          </nav>
          <div className={s.sidebarStatus}><span className={s.liveDot} />{remoteMode ? "PRODUCTION CONTENT" : "LOCAL PREVIEW DATA"}</div>
        </aside>

        <main className={s.editor}>
          {tab === "home" && <section className={s.homePanel}>
            <header className={s.panelHeader}><div><span className={s.eyebrow}>EXPERIENCE MAP</span><h1>Current portfolio controls.</h1><p>Only the three live experiences are shown here. Legacy website sections have been removed from this admin.</p></div><Aperture size={64} strokeWidth={0.8} /></header>
            <div className={s.routeList}>
              {destinations.map((item, index) => <article key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><item.icon size={22} /><div><h2>{item.label}</h2><p>{item.note}</p></div><Link href={item.path} target="_blank"><Eye size={17} />Open</Link></article>)}
            </div>
            <HomeExperienceEditor value={homeExperience} onChange={(value) => updateData((draft) => { draft.homeExperience = value; })} />
            <section className={s.utilitySection}>
              <div><span className={s.eyebrow}>BACKUP</span><h2>Studio data</h2><p>Download a portable copy before large edits. Importing loads a reviewable draft and does not save automatically.</p></div>
              <div className={s.utilityActions}>
                <button type="button" onClick={downloadBackup}><Download size={17} />Download backup</button>
                <label><Upload size={17} />Import backup<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBackup(file); event.target.value = ""; }} /></label>
                <button type="button" onClick={() => { if (!window.confirm("Load the default content as an unsaved draft?")) return; setData(completeData(defaultData)); setStatus("Unsaved changes"); }}><RotateCcw size={17} />Load defaults</button>
              </div>
            </section>
          </section>}

          {tab === "engineering" && <section className={s.contentPanel}>
            <header className={s.panelHeader}><div><span className={s.eyebrow}>THE ENGINEER</span><h1>Engineering portfolio.</h1><p>These controls feed the current selected-work cards and case-study pages.</p></div><Code2 size={54} strokeWidth={1} /></header>
            <div className={s.connectedField}><label><span>Public contact email</span><input type="email" value={data.profile.email} onChange={(event) => updateData((draft) => { draft.profile.email = event.target.value; })} /></label><small>Used by the Contact navigation, email link, and copy button.</small></div>
            <EngineerProjectEditor value={engineeringProjects} onChange={(items) => updateData((draft) => { draft.engineerProjects = items; })} />
          </section>}

          {tab === "photography" && <section className={`${s.contentPanel} ${s.photoPanel}`}>
            <header className={s.panelHeader}><div><span className={s.eyebrow}>BEYOND THE CODE</span><h1>Photography archive.</h1><p>Arrange the contact sheet, manage collections, and prepare each frame for the full-screen viewer.</p></div><Camera size={54} strokeWidth={1} /></header>
            <PhotographyEditor value={photography} onChange={(value) => updateData((draft) => { draft.photography = value; })} />
          </section>}
        </main>
      </div>
    </div>
  );
}
