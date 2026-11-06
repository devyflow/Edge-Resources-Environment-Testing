"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Aperture, Moon, Music2, Sun, Volume2, VolumeX } from "lucide-react";
import { ExperienceAudio } from "@/lib/experience-audio";
import s from "./entry-experience.module.css";

type ExperienceArea = "home" | "engineering" | "photography";
type ExperienceTheme = "light" | "dark";

const ExperienceContext = createContext({ enter: (_href: string) => {}, shutter: () => {}, sound: true, toggleSound: () => {}, dark: false, toggleTheme: () => {} });
export const useExperience = () => useContext(ExperienceContext);

export default function EntryExperienceShell({ children, area = "home", defaultTheme = "dark", defaultSound = false }: { children: React.ReactNode; area?: ExperienceArea; defaultTheme?: ExperienceTheme; defaultSound?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sound, setSound] = useState(defaultSound);
  const [music, setMusic] = useState(false);
  const [dark, setDark] = useState(defaultTheme === "dark");
  const [phase, setPhase] = useState("");
  const [audioError, setAudioError] = useState("");
  const engine = useRef<ExperienceAudio | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const moving = useRef(false);
  const welcomed = pathname === "/";
  const photography = area === "photography";
  const themeKey = `devyflow-theme-${area}`;

  useEffect(() => {
    engine.current = new ExperienceAudio();
    try {
      const savedSound = localStorage.getItem("devyflow-shutter");
      setSound(savedSound ? savedSound === "on" : defaultSound);
      const savedTheme = localStorage.getItem(themeKey);
      setDark(savedTheme ? savedTheme === "dark" : defaultTheme === "dark");
    } catch { /* The experience still works without browser storage. */ }
    const visibility = () => { void engine.current?.setVisible(!document.hidden).catch(() => {}); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      timers.current.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", visibility);
      engine.current?.dispose();
    };
  }, [defaultSound, defaultTheme, themeKey]);

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
    if (moving.current) { router.push(href); return; }
    if (!welcomed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
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

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem(themeKey, next ? "dark" : "light"); } catch {}
  }

  async function toggleMusic() {
    setAudioError("");
    if (music) { engine.current?.stopMusic(); setMusic(false); return; }
    try { await engine.current?.startMusic(); setMusic(true); }
    catch { setAudioError("Music could not start. Please try again."); }
  }

  return (
    <ExperienceContext.Provider value={{ enter, shutter, sound, toggleSound, dark, toggleTheme }}>
      <div className={s.experience} data-dark={dark} data-welcome={welcomed} data-photography={photography}>
        {children}
        <div className={s.audioDock} role="group" aria-label="Experience settings" data-audio-control>
          <div className={s.audioOptions}>
            <span className={s.audioLabel}>{sound ? "SHUTTER ON" : "SHUTTER OFF"}</span>
              <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Mute shutter sounds" : "Enable shutter sounds"} title={sound ? "Mute shutter sounds" : "Enable shutter sounds"}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
              <button type="button" onClick={() => void toggleMusic()} aria-pressed={music} aria-label={music ? "Pause ambient music" : "Play ambient music"} title={music ? "Pause River Study" : "Play River Study: original ambient sound"}><Music2 size={17} /><i className={s.musicLed} /></button>
            <button type="button" onClick={toggleTheme} aria-label={dark ? "Use light theme" : "Use dark theme"} title="Switch theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
            {audioError && <span role="status" className={s.audioError}>{audioError}</span>}
          </div>
        </div>
        {phase && <div className={s.transition} data-phase={phase} aria-hidden="true"><div /><div /><Aperture size={36} strokeWidth={1} /></div>}
      </div>
    </ExperienceContext.Provider>
  );
}
