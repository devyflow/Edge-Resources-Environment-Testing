import EngineerProjectPage from "@/components/engineer-project-page";

export const dynamic = "force-dynamic";

export default async function ProjectPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EngineerProjectPage slug={slug} />;
}
