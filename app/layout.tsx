import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://devyflow.in"),
  title: "Devyanshu Agrawal - AI and Web Portfolio",
  description: "Recruiter-ready portfolio for React, Python automation, AI workflows, dashboards, and full-stack project case studies.",
  openGraph: {
    siteName: "DevyFlow",
    type: "website"
  }
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
