import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevyFlow Studio",
  description: "Private controls for the DevyFlow entry, engineering, and photography experiences."
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
