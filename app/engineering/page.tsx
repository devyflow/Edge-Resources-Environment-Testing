import EngineerPreview from "@/components/engineer-preview";
import { initialEngineerProjects } from "@/lib/engineer-project-store";
import { normalizeEngineering } from "@/lib/engineering-content";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";

export const revalidate = 60;

export default async function EngineeringPage() {
  const data = await loadPortfolioDataServer();
  return <EngineerPreview initialProjects={data.engineerProjects ?? initialEngineerProjects()} initialEmail={data.profile.email} initialContent={normalizeEngineering(data.engineering)} />;
}
