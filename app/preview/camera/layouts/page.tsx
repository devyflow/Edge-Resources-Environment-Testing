import type { Metadata } from "next";
import CameraLayoutPreview from "@/components/camera-layout-preview";

export const metadata: Metadata = {
  title: "DevyFlow | Responsive Camera Preview",
  robots: { index: false, follow: false }
};

export default function CameraLayoutsPage() {
  return <CameraLayoutPreview />;
}
