import type { Metadata } from "next";
import EntryExperienceShell from "@/components/entry-experience-shell";
import EntryWelcome from "@/components/entry-welcome";
import { initialHomeExperience } from "@/lib/home-content";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "DevyFlow | A Different Perspective",
  description: "Devyanshu Agrawal: software, useful tools, photography, and life beyond the code.",
  alternates: { canonical: "/" },
  openGraph: { title: "DevyFlow | A Different Perspective", description: "Software, useful tools, photography, and life beyond the code.", url: "/", images: [{ url: "/camera-preview/portfolio-home.png", width: 1200, height: 630, alt: "DevyFlow portfolio" }] }
};

export default async function HomePage() {
  const data = await loadPortfolioDataServer();
  return <EntryExperienceShell area="home" defaultTheme="dark"><EntryWelcome initialContent={data.homeExperience ?? initialHomeExperience()} /></EntryExperienceShell>;
}
