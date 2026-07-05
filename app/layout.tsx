import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devyanshu Agrawal - AI and Web Portfolio",
  description: "Recruiter-ready portfolio for React, Python automation, AI workflows, dashboards, and full-stack project case studies."
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
