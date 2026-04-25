export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

// Grandes villes pour couvrir la France — l'API LBA est géolocalisée
const CITIES = [
  { lat: 48.8566, lng: 2.3522 },   // Paris
  { lat: 45.764, lng: 4.8357 },    // Lyon
  { lat: 43.2965, lng: 5.3698 },   // Marseille
  { lat: 43.6047, lng: 1.4442 },   // Toulouse
  { lat: 44.8378, lng: -0.5792 },  // Bordeaux
  { lat: 47.2184, lng: -1.5536 },  // Nantes
  { lat: 50.6292, lng: 3.0573 },   // Lille
  { lat: 48.5734, lng: 7.7521 },   // Strasbourg
];

// Codes ROME ciblés : métiers accessibles aux étudiants
const ROMES = "G1803,D1506,N4105,K1302,D1507,M1607,K2112,G1802,N4101";

const LBAMatchaSchema = z.object({
  id: z.string(),
  ideaType: z.string().optional(),
  title: z.string(),
  company: z.object({
    name: z.string().optional(),
    siret: z.string().optional(),
  }).optional(),
  place: z.object({
    city: z.string().optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  contract: z.object({
    startDate: z.string().optional(),
    contractType: z.string().optional(),
  }).optional(),
}).passthrough();

function mapContractType(contractType: string | undefined): string {
  if (!contractType) return "alternance";
  const u = contractType.toLowerCase();
  if (u.includes("apprentissage") || u.includes("alternance")) return "alternance";
  if (u.includes("professionnalisation")) return "alternance";
  return "alternance"; // LBA est 100% alternance
}

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Une requête par ville, toutes en parallèle
    const responses = await Promise.allSettled(
      CITIES.map(({ lat, lng }) =>
        fetch(
          `https://api.labonnealternance.apprentissage.beta.gouv.fr/api/v1/jobs/?` +
            new URLSearchParams({
              caller: "strada",
              romes: ROMES,
              latitude: String(lat),
              longitude: String(lng),
              radius: "50",
              sources: "matcha",
            }),
          { headers: { Accept: "application/json" } }
        ).then((r) => (r.ok ? r.json() : { matchas: { results: [] } }))
      )
    );

    // Déduplique par id
    const seen = new Set<string>();
    const rows: Record<string, unknown>[] = [];

    for (const result of responses) {
      if (result.status !== "fulfilled") continue;
      const matchas: unknown[] = result.value?.matchas?.results ?? [];
      for (const raw of matchas) {
        const parsed = LBAMatchaSchema.safeParse(raw);
        if (!parsed.success || seen.has(parsed.data.id)) continue;
        seen.add(parsed.data.id);
        const o = parsed.data;
        const description = o.description
          ? sanitizeHtml(o.description, { allowedTags: [], allowedAttributes: {} })
          : null;
        rows.push({
          source: "lba",
          source_id: o.id,
          url: o.url ?? null,
          title: o.title,
          company_name: o.company?.name ?? null,
          company_siren: o.company?.siret?.slice(0, 9) ?? null,
          description,
          salary_raw: null,
          salary_min: null,
          salary_max: null,
          salary_period: null,
          location_city: o.place?.city ?? null,
          location_postal: o.place?.zipCode ?? null,
          location_lat: o.place?.latitude ?? null,
          location_lng: o.place?.longitude ?? null,
          contract_type: mapContractType(o.contract?.contractType),
          posted_at: o.contract?.startDate ?? null,
          raw_data: o as Record<string, unknown>,
          scraped_at: now,
        });
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: true, inserted: 0 });
    }

    let inserted = 0;
    const supabase = createServiceClient();
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase
        .from("raw_offers")
        .upsert(batch, { onConflict: "source,source_id" });
      if (!error) inserted += batch.length;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error("[lba]", err);
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
}
