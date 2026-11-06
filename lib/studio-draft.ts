import type { PortfolioData } from "./types";

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type StudioSection = "home" | "engineering" | "photography";
export function studioDraftKey(account: string) {
  return `devyflow-studio-draft-v1:${encodeURIComponent(account)}`;
}
export function readStudioDraft(storage: DraftStorage, key: string): PortfolioData | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    return draft?.version === 1 && draft.data?.profile && Array.isArray(draft.data.projects) ? draft.data : null;
  } catch { return null; }
}
export function writeStudioDraft(storage: DraftStorage, key: string, data: PortfolioData): boolean {
  try { storage.setItem(key, JSON.stringify({ version: 1, data })); return true; }
  catch { return false; }
}
