import { engineerProjects } from "./engineer-preview-data";

export type EngineerProject = (typeof engineerProjects)[number] & {
  visible: boolean;
  selected: boolean;
  cover: "store" | "food" | "generic";
};

export function initialEngineerProjects(): EngineerProject[] {
  return [engineerProjects[1], engineerProjects[0], engineerProjects[2]].map(project => ({
    ...structuredClone(project), visible: true, selected: project.slug !== "piksy",
    cover: project.slug === "store-intelligence" ? "store" : project.slug === "chit-chat-with-food" ? "food" : "generic",
  }));
}

export function safeProjectUrl(value: string) {
  if (!value) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
}

export function validateEngineerProjects(projects: EngineerProject[]) {
  const seen = new Set<string>();
  for (const project of projects) {
    if (!project.name.trim()) throw new Error("Each Engineer project needs a name.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || project.slug === "devyflow") throw new Error("Use a unique lowercase project slug with hyphens (devyflow is reserved).");
    if (seen.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
    seen.add(project.slug);
    if (![project.liveUrl, project.sourceUrl, project.decision.url].every(safeProjectUrl)) throw new Error(`Use complete http or https links for ${project.name}.`);
  }
}
