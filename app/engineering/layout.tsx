import type { Metadata } from "next";
import EntryExperienceShell from "@/components/entry-experience-shell";
import { normalizeEngineering } from "@/lib/engineering-content";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";

export const metadata: Metadata = {
  title: "Software Engineer | Devyanshu Agrawal",
  description: "Backend systems, APIs, real-time applications, and practical engineering work by Devyanshu Agrawal.",
  alternates: { canonical: "/engineering" },
  openGraph: { title: "Software Engineer | Devyanshu Agrawal", description: "Backend systems, APIs, real-time applications, and practical engineering work by Devyanshu Agrawal.", url: "/engineering", images: [{ url: "/camera-preview/portfolio-home.png", width: 1200, height: 630, alt: "DevyFlow engineering portfolio" }] }
};

export default async function EngineeringLayout({ children }: { children: React.ReactNode }) {
  const data = await loadPortfolioDataServer();
  return <EntryExperienceShell area="engineering" defaultTheme={normalizeEngineering(data.engineering).defaultTheme}>{children}</EntryExperienceShell>;
}
