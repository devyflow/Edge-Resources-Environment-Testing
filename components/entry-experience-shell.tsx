"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Aperture, Moon, Music2, Sun, Volume2, VolumeX } from "lucide-react";
import { ExperienceAudio } from "@/lib/experience-audio";
import s from "./entry-experience.module.css";

const ExperienceContext = createContext({ enter: (_href: string) => {}, shutter: () => {} });
export const useExperience = () => useContext(ExperienceContext);

export default function EntryExperienceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(false);
  const [dark, setDark] = useState(false);
  const [phase, setPhase] = useState("");
  const [audioError, setAudioError] = useState("");
  const [focus, setFocus] = useState<{ x: number; y: number; id: number } | null>(null);
  const engine = useRef<ExperienceAudio | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const moving = useRef(false);
  const welcomed = pathname === "/preview/entry";

  useEffect(() => {
    engine.current = new ExperienceAudio();
    try {
      setSound(localStorage.getItem("devyflow-shutter") !== "off");
      const savedTheme = localStorage.getItem("devyflow-preview-dark");
      setDark(savedTheme ? savedTheme === "on" : pathname.startsWith("/preview/entry/personal"));
    } catch { /* The experience still works without browser storage. */ }
    const visibility = () => { void engine.current?.setVisible(!document.hidden).catch(() => {}); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      timers.current.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", visibility);
      engine.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!moving.current) return;
    setPhase("opening");
    const timer = setTimeout(() => { setPhase(""); moving.current = false; }, 440);
    return () => clearTimeout(timer);
  }, [pathname]);

  function shutter() {
    engine.current ??= new ExperienceAudio();
    if (sound) void engine.current.shutter().catch(() => setAudioError("Audio is unavailable in this browser."));
  }

  function enter(href: string) {
    if (moving.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
    moving.current = true;
    setPhase("closing");
    timers.current.push(setTimeout(() => router.push(href), 260));
    timers.current.push(setTimeout(() => { setPhase(""); moving.current = false; }, 1800));
  }

  function toggleSound() {
    setSound(!sound);
    try { localStorage.setItem("devyflow-shutter", sound ? "off" : "on"); } catch {}
    if (!sound) void engine.current?.shutter().catch(() => setAudioError("Audio is unavailable in this browser."));
  }

  async function toggleMusic() {
    setAudioError("");
    if (music) { engine.current?.stopMusic(); setMusic(false); return; }
    try { await engine.current?.startMusic(); setMusic(true); }
    catch { setAudioError("Music could not start. Please try again."); }
  }

  return (
    <ExperienceContext.Provider value={{ enter, shutter }}>
      <div className={s.experience} data-dark={dark} data-welcome={welcomed} data-photography={pathname.startsWith("/preview/entry/personal")} onClickCapture={event => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-audio-control], input, textarea, select, [contenteditable=true]")) return;
        shutter();
        if (!welcomed && event.detail > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setFocus({ x: event.clientX, y: event.clientY, id: Date.now() });
        }
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = (event.target as HTMLElement).closest("a");
        if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
        const destination = new URL(anchor.href, window.location.href);
        if (destination.origin !== window.location.origin || !destination.pathname.startsWith("/preview/entry") || destination.pathname === pathname) return;
        event.preventDefault();
        enter(destination.pathname + destination.search + destination.hash);
      }}>
        {children}
        {focus && <span key={focus.id} className={s.workClickFocus} style={{ left: focus.x, top: focus.y }} aria-hidden="true" />}
        <div className={s.audioDock} aria-label="Experience settings" data-audio-control>
          <span className={s.audioLabel}>{sound ? "SHUTTER ON" : "SHUTTER OFF"}</span>
          <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Mute shutter sounds" : "Enable shutter sounds"} title={sound ? "Mute shutter sounds" : "Enable shutter sounds"}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
          <button type="button" onClick={() => void toggleMusic()} aria-pressed={music} aria-label={music ? "Pause ambient music" : "Play ambient music"} title={music ? "Pause River Study" : "Play River Study: original ambient sound"}><Music2 size={17} /><i className={s.musicLed} /></button>
          {!welcomed && <button type="button" onClick={() => { setDark(!dark); try { localStorage.setItem("devyflow-preview-dark", dark ? "off" : "on"); } catch {} }} aria-label={dark ? "Use light theme" : "Use dark theme"} title="Switch theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>}
          {audioError && <span role="status" className={s.audioError}>{audioError}</span>}
        </div>
        {phase && <div className={s.transition} data-phase={phase} aria-hidden="true"><div /><div /><Aperture size={36} strokeWidth={1} /></div>}
      </div>
    </ExperienceContext.Provider>
  );
}
