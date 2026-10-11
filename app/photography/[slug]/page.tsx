import type { Metadata } from "next";
import BeyondStudioPhotoDetail from "@/components/beyond-studio-photo-detail";
import { normalizePhotography } from "@/lib/photography-content";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = normalizePhotography((await loadPortfolioDataServer()).photography);
  const photo = content.posts.find((item) => item.slug === slug && item.visible && item.image);
  if (!photo) return { title: "Photo unavailable | DevyFlow", robots: { index: false, follow: true } };
  return { title: `${photo.title} | ${content.name}`, description: photo.caption, alternates: { canonical: `/photography/${photo.slug}` }, openGraph: { title: `${photo.title} | ${content.name}`, description: photo.caption, url: `/photography/${photo.slug}`, images: [{ url: photo.image, width: photo.width ?? 1600, height: photo.height ?? 1067, alt: photo.alt }] } };
}

export default async function PhotoPage({ params }: Props) {
  const { slug } = await params;
  const content = normalizePhotography((await loadPortfolioDataServer()).photography);
  return <BeyondStudioPhotoDetail slug={slug} initialContent={content} />;
}
