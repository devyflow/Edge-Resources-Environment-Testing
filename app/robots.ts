import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/preview/"]
    },
    sitemap: "https://devyflow.in/sitemap.xml",
    host: "https://devyflow.in"
  };
}
