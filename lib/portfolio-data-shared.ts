import type { PortfolioData } from "./types";

export function cloneData(data: PortfolioData): PortfolioData {
  return JSON.parse(JSON.stringify(data)) as PortfolioData;
}

export function mergeData(base: PortfolioData, incoming: Partial<PortfolioData>): PortfolioData {
  return {
    ...base,
    ...incoming,
    engineering: incoming.engineering ?? base.engineering,
    sections: { ...base.sections, ...(incoming.sections || {}) },
    profile: { ...base.profile, ...(incoming.profile || {}) },
    resume: { ...base.resume, ...(incoming.resume || {}) },
    projects: Array.isArray(incoming.projects) ? incoming.projects : base.projects,
    notes: Array.isArray(incoming.notes) ? incoming.notes : base.notes,
    tools: Array.isArray(incoming.tools) ? incoming.tools : base.tools,
    posts: Array.isArray(incoming.posts) ? incoming.posts : base.posts,
    skills: { ...base.skills, ...(incoming.skills || {}) },
    experience: Array.isArray(incoming.experience) ? incoming.experience : base.experience
  };
}
