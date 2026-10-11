import BeyondStudioLive from "@/components/beyond-studio-live";
import { normalizePhotography } from "@/lib/photography-content";
import { loadPortfolioDataServer } from "@/lib/portfolio-data-server";

export const revalidate = 60;
export default async function PhotographyPage() {
  const data = await loadPortfolioDataServer();
  return <BeyondStudioLive initialContent={normalizePhotography(data.photography)} />;
}
