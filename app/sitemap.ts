import type { MetadataRoute } from "next";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";
import { initialEngineerProjects } from "@/lib/engineer-project-store";
import { initialPhotography, normalizePhotography } from "@/lib/photography-content";

const origin = "https://devyflow.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await loadPortfolioDataServer();
  const projects = (data.engineerProjects ?? initialEngineerProjects()).filter(project => project.visible);
  const photos = normalizePhotography(data.photography ?? initialPhotography()).posts.filter(photo => photo.visible && photo.image);
  const now = new Date();

  return [
    { url: `${origin}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${origin}/engineering`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...projects.map(project => ({ url: `${origin}/engineering/${project.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.75 })),
    { url: `${origin}/photography`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...photos.map(photo => ({ url: `${origin}/photography/${photo.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 }))
  ];
}
