import type { MetadataRoute } from "next";
import { VILLES } from "@/lib/villes";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://monbaito.fr";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/offres`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${baseUrl}/alternance`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${baseUrl}/auth/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const villePages: MetadataRoute.Sitemap = VILLES.map((v) => ({
    url: `${baseUrl}/job-etudiant/${v.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Toutes les offres actives (48h de fraîcheur)
  let offerPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const freshnessCutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("enriched_offers")
      .select("id, enriched_at")
      .gte("enriched_at", freshnessCutoff)
      .order("enriched_at", { ascending: false })
      .limit(5000);

    offerPages = (data ?? []).map((o) => ({
      url: `${baseUrl}/offres/${o.id}`,
      lastModified: new Date(o.enriched_at),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    // Sitemap sans offres si Supabase est inaccessible
  }

  return [...staticPages, ...villePages, ...offerPages];
}
