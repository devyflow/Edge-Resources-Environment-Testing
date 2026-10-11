import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beyond the Code Studio Preview",
  description: "An isolated design preview for the DevyFlow photography archive.",
  robots: { index: false, follow: false }
};

export default function BeyondStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
