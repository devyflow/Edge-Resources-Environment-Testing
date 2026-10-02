"use client";

import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { initialHomeExperience, type HomeExperienceContent } from "@/lib/home-content";
import s from "./home-experience-editor.module.css";

export default function HomeExperienceEditor({ value, onChange }: { value?: HomeExperienceContent; onChange: (value: HomeExperienceContent) => void }) {
  const data = value ?? initialHomeExperience();
  const [status, setStatus] = useState("");

  async function uploadScene(index: 0 | 1, file: File) {
    setStatus("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 12 * 1024 * 1024) {
      setStatus("Choose a JPG, PNG, or WebP under 12 MB.");
      return;
    }
    try {
      setStatus("Preparing background...");
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const scene = canvas.toDataURL("image/jpeg", 0.82);
      if (scene.length > 1_500_000) throw new Error("This background is too large for local storage. Try a smaller image.");
      const destinations = [...data.destinations] as HomeExperienceContent["destinations"];
      destinations[index] = { ...destinations[index], scene, creditLabel: "Devyanshu Agrawal", creditUrl: "" };
      onChange({ ...data, destinations });
      setStatus("Background ready. Save all to publish it locally.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not read this image.");
    }
  }

  function field(label: string, key: keyof Omit<HomeExperienceContent, "destinations">) {
    return <label><span>{label}</span><input value={data[key]} onChange={(event) => onChange({ ...data, [key]: event.target.value })} /></label>;
  }

  return (
    <div className={s.editor}>
      <section>
        <header><span>01</span><div><strong>First frame</strong><small>Identity and location shown before a perspective is chosen</small></div></header>
        <div className={s.fields}>
          {field("Brand", "brand")}{field("Edition", "edition")}{field("Ready label", "readyLabel")}{field("Role line", "kicker")}
          {field("First name line", "nameLineOne")}{field("Second name line", "nameLineTwo")}{field("Statement line one", "statementLineOne")}{field("Statement line two", "statementLineTwo")}{field("Coordinates", "coordinates")}{field("Location", "location")}
        </div>
      </section>

      <section>
        <header><span>02</span><div><strong>Perspective backgrounds</strong><small>The dial crossfades between these two images</small></div></header>
        <div className={s.scenes}>{data.destinations.map((destination, index) => <article key={destination.id}>
          <div className={s.image}>{destination.scene ? <img src={destination.scene} alt="" /> : <Camera size={34} />}<span>{index ? "LIFE" : "WORK"}</span></div>
          <div className={s.sceneFields}>
            <label><span>Title</span><input value={destination.title} onChange={(event) => { const destinations = [...data.destinations] as HomeExperienceContent["destinations"]; destinations[index] = { ...destination, title: event.target.value }; onChange({ ...data, destinations }); }} /></label>
            <label><span>Caption</span><input value={destination.caption} onChange={(event) => { const destinations = [...data.destinations] as HomeExperienceContent["destinations"]; destinations[index] = { ...destination, caption: event.target.value }; onChange({ ...data, destinations }); }} /></label>
            <label className={s.wide}><span>Short description</span><input value={destination.detail} onChange={(event) => { const destinations = [...data.destinations] as HomeExperienceContent["destinations"]; destinations[index] = { ...destination, detail: event.target.value }; onChange({ ...data, destinations }); }} /></label>
            <label><span>Photo credit</span><input value={destination.creditLabel} onChange={(event) => { const destinations = [...data.destinations] as HomeExperienceContent["destinations"]; destinations[index] = { ...destination, creditLabel: event.target.value }; onChange({ ...data, destinations }); }} /></label>
            <label><span>Credit URL</span><input value={destination.creditUrl} onChange={(event) => { const destinations = [...data.destinations] as HomeExperienceContent["destinations"]; destinations[index] = { ...destination, creditUrl: event.target.value }; onChange({ ...data, destinations }); }} /></label>
          </div>
          <label className={s.upload}><Upload size={16} />Replace background<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadScene(index as 0 | 1, file); event.target.value = ""; }} /></label>
        </article>)}</div>
        <p className={s.status} role="status">{status}</p>
      </section>
    </div>
  );
}
