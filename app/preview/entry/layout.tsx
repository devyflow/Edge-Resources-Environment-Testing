import type { Metadata } from "next";
import EntryExperienceShell from "@/components/entry-experience-shell";

export const metadata: Metadata = {
  title: "DevyFlow | A Different Perspective",
  description: "Devyanshu Agrawal: software, useful tools, and life beyond the code.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: "DevyFlow | A Different Perspective",
    description: "Devyanshu Agrawal: software, useful tools, and life beyond the code.",
    url: "/",
    images: [{ url: "/camera-preview/portfolio-home.png", width: 1200, height: 630, alt: "DevyFlow portfolio" }]
  }
};

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return <EntryExperienceShell>{children}</EntryExperienceShell>;
}
