import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://devyflow.in"),
  title: "Devyanshu Agrawal - AI and Web Portfolio",
  description: "Recruiter-ready portfolio for React, Python automation, AI workflows, dashboards, and full-stack project case studies.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }]
  },
  openGraph: {
    siteName: "DevyFlow",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d100f"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
