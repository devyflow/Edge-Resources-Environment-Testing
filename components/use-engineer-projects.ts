"use client";
import { useEffect, useState } from "react";
import { loadPortfolioData } from "@/lib/content-store";
import { initialEngineerProjects, validateEngineerProjects } from "@/lib/engineer-project-store";

export function useEngineerProjects() {
  const [projects, setProjects] = useState(initialEngineerProjects);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    async function sync() {
      try {
        const items = (await loadPortfolioData()).engineerProjects ?? initialEngineerProjects();
        validateEngineerProjects(items);
        setProjects(items);
      } catch { setProjects(initialEngineerProjects()); }
      setReady(true);
    }
    void sync();
    const handleSync = () => void sync();
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    window.addEventListener("portfolio-content-updated", handleSync);
    return () => { window.removeEventListener("storage", handleSync); window.removeEventListener("focus", handleSync); window.removeEventListener("portfolio-content-updated", handleSync); };
  }, []);
  return { projects, ready };
}
