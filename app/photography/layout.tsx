import type { Metadata } from "next";
import EntryExperienceShell from "@/components/entry-experience-shell";
import { normalizePhotography } from "@/lib/photography-content";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";

export const metadata: Metadata = {
  title: "Beyond the Code | Photography by Devyanshu Agrawal",
  description: "An archive of streets, celebrations, details, and field notes photographed by Devyanshu Agrawal.",
  alternates: { canonical: "/photography" },
  openGraph: { title: "Beyond the Code | Photography by Devyanshu Agrawal", description: "An archive of streets, celebrations, details, and field notes photographed by Devyanshu Agrawal.", url: "/photography", images: [{ url: "/photography/golden-street.jpg", width: 2592, height: 1728, alt: "Festival lights above a night street" }] }
};

export default async function PhotographyLayout({ children }: { children: React.ReactNode }) {
  const data = await loadPortfolioDataServer();
  const photography = normalizePhotography(data.photography);
  return <EntryExperienceShell area="photography" defaultTheme={photography.defaultTheme} defaultSound={!photography.quietShutter}>{children}</EntryExperienceShell>;
}
