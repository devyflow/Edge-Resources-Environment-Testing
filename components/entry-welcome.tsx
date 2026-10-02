"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Aperture, ArrowDownRight, ArrowRight, Camera, ChevronLeft, ChevronRight, Code2 } from "lucide-react";
import { useExperience } from "./entry-experience-shell";
import { useHomeContent } from "./use-home-content";
import s from "./entry-experience.module.css";

export default function EntryWelcome() {
  const content = useHomeContent();
  const destinations = useMemo(() => content.destinations.map((item) => ({
    ...item,
    href: item.id === "engineering" ? "/preview/entry/work" : "/preview/entry/personal",
    icon: item.id === "engineering" ? Code2 : Camera
  })), [content.destinations]);
  const [selected, setSelected] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [focusing, setFocusing] = useState(false);
  const gesture = useRef<{ x: number; selected: number; moved: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { enter, shutter } = useExperience();
  const router = useRouter();
  const destination = destinations[selected];

  useEffect(() => {
    destinations.forEach(item => router.prefetch(item.href));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [router]);

  function change(index: number) { setSelected(Math.max(0, Math.min(1, index))); }

  return (
    <main className={s.welcome} data-selection={selected} onClick={event => {
      if ((event.target as HTMLElement).closest("a,button,[role=slider]")) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      setPosition({ x: (event.clientX - bounds.left) / bounds.width * 100, y: (event.clientY - bounds.top) / bounds.height * 100 });
      setFocusing(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setFocusing(false), 450);
    }}>
      <div className={s.welcomeScene} aria-hidden="true">
        <img className={s.engineerScene} src={destinations[0].scene} alt="" />
        <img className={s.personalScene} src={destinations[1].scene} alt="" />
      </div>
      <header className={s.welcomeHeader}><a href="/preview/entry" className={s.brand}>{content.brand}<span>.</span></a><span className={s.edition}>{content.edition}</span><span className={s.liveLabel}><i /> {content.readyLabel}</span></header>
      <div className={s.welcomeBody}>
        <div className={s.welcomeCopy}>
          <span className={s.kicker}>{content.kicker}</span>
          <h1>{content.nameLineOne}<br />{content.nameLineTwo}<span>.</span></h1>
          <p>{content.statementLineOne}<br />{content.statementLineTwo}</p>
          <div className={s.welcomeCoordinates}><span>{content.coordinates}</span><span>{content.location}</span></div>
        </div>
        <div className={s.selector}>
          <div className={s.selectorHeading}><span>CHOOSE YOUR PERSPECTIVE</span><ArrowDownRight size={20} /></div>
          <div className={s.dialStage}>
            <span className={s.dialTopMark} />
            <span className={s.dialLeftLabel} data-active={selected === 0}>01<br />WORK</span>
            <span className={s.dialRightLabel} data-active={selected === 1}>02<br />LIFE</span>
            <div className={s.selectionDial} role="slider" tabIndex={0} aria-label="Choose experience" aria-valuemin={0} aria-valuemax={1} aria-valuenow={selected} aria-valuetext={destination.title}
              title="Choose experience: drag sideways or use arrow keys"
              onKeyDown={event => {
                if (["ArrowLeft", "ArrowDown", "Home", "ArrowRight", "ArrowUp", "End"].includes(event.key)) {
                  event.preventDefault(); shutter(); change(["ArrowLeft", "ArrowDown", "Home"].includes(event.key) ? 0 : 1);
                }
              }}
              onPointerDown={event => { event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); gesture.current = { x: event.clientX, selected, moved: false }; }}
              onPointerMove={event => {
                const start = gesture.current;
                if (!start) return;
                const distance = event.clientX - start.x;
                if (Math.abs(distance) > 12) start.moved = true;
                if (Math.abs(distance) > 25) change(distance > 0 ? 1 : 0);
              }}
              onPointerUp={() => { if (gesture.current && !gesture.current.moved) change(1 - selected); gesture.current = null; }}
              onPointerCancel={() => { gesture.current = null; }}
              style={{ "--rotation": `${selected ? 52 : -52}deg` } as CSSProperties}>
              <div className={s.knurl}><div className={s.rotor}><i /><span>DF / 01</span><Aperture size={74} strokeWidth={0.7} /></div></div>
            </div>
            <button type="button" className={s.dialPrev} onClick={() => change(0)} aria-label={`Select ${destinations[0].title}`} title={destinations[0].title}><ChevronLeft size={18} /></button>
            <button type="button" className={s.dialNext} onClick={() => change(1)} aria-label={`Select ${destinations[1].title}`} title={destinations[1].title}><ChevronRight size={18} /></button>
          </div>
          <div className={s.destination} aria-live="polite"><span>{destination.caption}</span><h2>{destination.title}</h2><p>{destination.detail}</p></div>
          <button type="button" className={s.enterButton} onClick={() => enter(destination.href)}><span className={s.release}><Aperture size={20} /></span><span>Enter {destination.title}</span><ArrowRight size={18} /></button>
          <div className={s.directChoices} role="group" aria-label="Experience shortcuts">{destinations.map((item, i) => <button key={item.href} type="button" aria-pressed={i === selected} onClick={() => change(i)}><item.icon size={13} />{i ? "Personal" : "Professional"}</button>)}</div>
        </div>
      </div>
      <div className={s.welcomeFooter}><span><Aperture size={14} /> TWO PERSPECTIVES. SAME PERSON.</span>{destination.creditUrl ? <a href={destination.creditUrl} target="_blank" rel="noreferrer">Reference photo / {destination.creditLabel}</a> : <span>Photo / {destination.creditLabel}</span>}</div>
      <div className={s.edgeMarks} aria-hidden="true"><i /><i /><i /><i /></div>
      {focusing && <span className={s.clickFocus} style={{ left: `${position.x}%`, top: `${position.y}%` }} aria-hidden="true" />}
    </main>
  );
}
