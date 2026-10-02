import type { Metadata } from "next";
import CameraPreview from "@/components/camera-preview";

export const metadata: Metadata = {
  title: "DevyFlow | Camera Experience Preview",
  description: "A working camera-inspired portfolio design prototype.",
  robots: { index: false, follow: false }
};

export default function CameraPreviewPage() {
  return <CameraPreview />;
}
