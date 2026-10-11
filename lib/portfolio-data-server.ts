import "server-only";

import { defaultData } from "./default-data";
import { cloneData, mergeData } from "./portfolio-data-shared";
import type { PortfolioData } from "./types";

type ContentRow = { content?: Partial<PortfolioData> };

export async function loadPortfolioDataServer(): Promise<PortfolioData> {
  const fallback = cloneData(defaultData);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || process.env.NEXT_PUBLIC_CONTENT_MODE === "local") return fallback;

  try {
    const response = await fetch(`${url}/rest/v1/portfolio_content?id=eq.main&select=content`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`
      },
      next: { revalidate: 60 }
    });
    if (!response.ok) return fallback;
    const rows = await response.json() as ContentRow[];
    return rows[0]?.content ? mergeData(fallback, rows[0].content) : fallback;
  } catch {
    return fallback;
  }
}
