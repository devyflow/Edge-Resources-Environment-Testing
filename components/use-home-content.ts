"use client";

import { useEffect, useState } from "react";
import { loadPortfolioData } from "@/lib/content-store";
import { initialHomeExperience } from "@/lib/home-content";

export function useHomeContent() {
  const [content, setContent] = useState(initialHomeExperience);

  useEffect(() => {
    const sync = async () => {
      try { setContent((await loadPortfolioData()).homeExperience ?? initialHomeExperience()); }
      catch { setContent(initialHomeExperience()); }
    };
    const handleSync = () => void sync();
    void sync();
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    window.addEventListener("portfolio-content-updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("portfolio-content-updated", handleSync);
    };
  }, []);

  return content;
}
