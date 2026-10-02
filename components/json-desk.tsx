"use client";

import { useEffect, useRef, useState } from "react";
import { Braces, Copy, Download, Minimize2, RotateCcw, WrapText, X } from "lucide-react";
import s from "./entry-experience.module.css";

const example = '{"project":"DevyFlow","stack":["Next.js","TypeScript","Supabase"],"public":true}';

export default function JsonDesk({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [input, setInput] = useState(example);
  const [output, setOutput] = useState(() => JSON.stringify(JSON.parse(example), null, 2));
  const [message, setMessage] = useState("Valid JSON");
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);

  function transform(compact: boolean) {
    try {
      if (input.length > 250_000) throw new Error("Please use a payload under 250,000 characters.");
      const value = JSON.parse(input);
      setOutput(JSON.stringify(value, null, compact ? undefined : 2));
      setInvalid(false);
      setMessage(`Valid JSON / ${Array.isArray(value) ? "array" : value === null ? "null" : typeof value}`);
    } catch (error) {
      setOutput(""); setInvalid(true);
      setMessage(error instanceof Error ? error.message : "Invalid JSON");
    }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(output); setMessage("Copied to clipboard"); }
    catch { setMessage("Clipboard unavailable. Select the output to copy it."); }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([output], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "payload.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("JSON download started");
  }

  return (
    <dialog ref={dialog} className={s.toolDialog} aria-labelledby="json-desk-title" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header><div><span className={s.kicker}>FREE TOOL / 01</span><h2 id="json-desk-title"><Braces size={24} />JSON Desk</h2></div><button type="button" title="Close JSON Desk" aria-label="Close JSON Desk" onClick={() => dialog.current?.close()}><X size={22} /></button></header>
      <div className={s.jsonToolbar}>
        <button type="button" onClick={() => transform(false)} title="Format JSON"><WrapText size={17} />Format</button>
        <button type="button" onClick={() => transform(true)} title="Minify JSON"><Minimize2 size={17} />Minify</button>
        <button type="button" onClick={() => { setInput(example); setOutput(JSON.stringify(JSON.parse(example), null, 2)); setMessage("Example restored"); setInvalid(false); }} title="Restore example" aria-label="Restore example"><RotateCcw size={17} /></button>
        <button type="button" onClick={() => void copy()} disabled={!output} title="Copy output" aria-label="Copy output"><Copy size={17} /></button>
        <button type="button" onClick={download} disabled={!output} title="Download JSON" aria-label="Download JSON"><Download size={17} /></button>
      </div>
      <div className={s.jsonEditors}>
        <label>Input<textarea autoFocus spellCheck={false} value={input} maxLength={250_001} onChange={event => { setInput(event.target.value); setOutput(""); setInvalid(false); setMessage("Input changed"); }} /></label>
        <label>Output<textarea readOnly spellCheck={false} value={output} placeholder="" /></label>
      </div>
      <footer><span role="status" data-error={invalid}>{message}</span><span>Processed on your device. Nothing uploaded.</span></footer>
    </dialog>
  );
}
