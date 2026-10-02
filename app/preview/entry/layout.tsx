import type { Metadata } from "next";
import EntryExperienceShell from "@/components/entry-experience-shell";

export const metadata: Metadata = {
  title: "DevyFlow | A Different Perspective",
  description: "Devyanshu Agrawal: software, useful tools, and life beyond the code.",
  robots: { index: false, follow: false }
};

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return <EntryExperienceShell>{children}</EntryExperienceShell>;
}
