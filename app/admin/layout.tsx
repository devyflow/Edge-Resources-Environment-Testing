import type { Metadata } from "next";
import PwaRegister from "@/components/pwa-register";

export const metadata: Metadata = {
  applicationName: "DevyFlow Studio",
  manifest: "/admin/manifest.webmanifest",
  title: "DevyFlow Studio",
  description: "Private controls for the DevyFlow entry, engineering, and photography experiences.",
  icons: {
    icon: [{ url: "/studio-icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: [{ url: "/studio-icon-192.png", type: "image/png", sizes: "192x192" }]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DevyFlow Studio"
  },
  robots: { index: false, follow: false, noarchive: true }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PwaRegister />
    </>
  );
}
