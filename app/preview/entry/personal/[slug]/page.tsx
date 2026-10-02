import PhotoDetail from "@/components/photo-detail";
export const dynamic = "force-dynamic";
export default async function PhotoPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 return <PhotoDetail slug={slug}/>;
}
