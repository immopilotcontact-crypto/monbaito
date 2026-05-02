import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/profil",
          "/candidatures",
          "/settings",
          "/onboarding",
        ],
      },
    ],
    sitemap: "https://monbaito.fr/sitemap.xml",
  };
}
