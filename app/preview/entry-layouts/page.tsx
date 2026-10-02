import type { Metadata } from "next";
import CameraLayoutPreview from "@/components/camera-layout-preview";
export const metadata: Metadata = { title: "DevyFlow | Entrance Layouts", robots: { index: false, follow: false } };
export default function EntryLayoutsPage() { return <CameraLayoutPreview source="/preview/entry" desktopHeight={900} />; }
