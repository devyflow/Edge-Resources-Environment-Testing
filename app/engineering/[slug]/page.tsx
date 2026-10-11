import type { Metadata } from "next";
import EngineerProjectPage from "@/components/engineer-project-page";
import { initialEngineerProjects } from "@/lib/engineer-project-store";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPortfolioDataServer();
  const project = (data.engineerProjects ?? initialEngineerProjects()).find((item) => item.slug === slug && item.visible);
  if (!project) return { title: "Project unavailable | DevyFlow", robots: { index: false, follow: true } };
  return { title: `${project.name} | DevyFlow`, description: project.summary, alternates: { canonical: `/engineering/${project.slug}` }, openGraph: { title: `${project.name} | DevyFlow`, description: project.summary, url: `/engineering/${project.slug}`, images: [{ url: "/camera-preview/portfolio-home.png", width: 1200, height: 630, alt: `${project.name} case study` }] } };
}

export default async function EngineeringProjectPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadPortfolioDataServer();
  return <EngineerProjectPage slug={slug} initialProjects={data.engineerProjects ?? initialEngineerProjects()} />;
}
