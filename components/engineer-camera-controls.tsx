"use client";
import { useState, type CSSProperties } from "react";
import { Aperture, ArrowRight } from "lucide-react";
import { useExperience } from "./entry-experience-shell";
import s from "./entry-experience.module.css";

const modes = [{ name: "Work", id: "selected-work" }, { name: "Tools", id: "tools" }, { name: "About", id: "about" }];

export default function EngineerCameraControls() {
  const [selected, setSelected] = useState(0);
  const { shutter } = useExperience();
  const mode = modes[selected];
  return <div className={s.engineerCamera}>
    <div className={s.cameraReadout}><span>DF / ENGINEER</span><strong>{String(selected + 1).padStart(2, "0")} / {mode.name.toUpperCase()}</strong><span>READY</span></div>
    <div className={s.engineerDialRow}>
      <button type="button" className={s.engineerDial} aria-label={`Mode: ${mode.name}. Select next section`} title="Select section" onClick={() => setSelected((selected + 1) % 3)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault(); shutter();
        setSelected(event.key === "Home" ? 0 : event.key === "End" ? 2 : (selected + (event.key === "ArrowRight" ? 1 : 2)) % 3);
      }} style={{ "--rotation": `${selected * 70 - 70}deg` } as CSSProperties}>
        <span className={s.knurl}><span className={s.rotor}><i /><Aperture size={37} strokeWidth={1} /></span></span>
      </button>
      <div className={s.engineerModeChoices} role="group" aria-label="Portfolio section">{modes.map((item, index) => <button key={item.id} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}>{item.name}</button>)}</div>
      <button type="button" className={s.engineerRelease} onClick={() => document.getElementById(mode.id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" })} aria-label={`Open ${mode.name}`} title={`Open ${mode.name}`}><span className={s.release}><Aperture size={22} /></span><ArrowRight size={16} /></button>
    </div>
  </div>;
}
