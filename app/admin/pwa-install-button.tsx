"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import s from "./admin.module.css";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function PwaInstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    setInstalled(isStandalone());
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
      setHint("");
    };
    const markInstalled = () => {
      setInstalled(true);
      setPrompt(null);
      setHint("Studio installed.");
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  async function install() {
    setHint("");
    if (installed || isStandalone()) {
      setInstalled(true);
      setHint("Studio is already installed on this device.");
      return;
    }
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      setHint(choice.outcome === "accepted" ? "Installing DevyFlow Studio..." : "Installation was cancelled.");
      return;
    }
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setHint(isiOS
      ? "On iPhone or iPad: tap Share, then Add to Home Screen."
      : "Open the browser menu and choose Install app or Add to Home screen.");
  }

  return <div className={s.installControl}>
    <button type="button" onClick={() => void install()} title="Install DevyFlow Studio on this device">
      {installed ? <Smartphone size={17} /> : <Download size={17} />}{installed ? "Installed" : "Install app"}
    </button>
    {hint && <span role="status">{hint}</span>}
  </div>;
}
