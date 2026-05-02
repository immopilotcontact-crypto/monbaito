export const runtime = "nodejs";
export const maxDuration = 90;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import sanitizeHtml from "sanitize-html";

const CITIES = [
  { lat: 48.8566, lng: 2.3522 },   // Paris
  { lat: 45.764,  lng: 4.8357 },   // Lyon
  { lat: 43.2965, lng: 5.3698 },   // Marseille
  { lat: 43.6047, lng: 1.4442 },   // Toulouse
  { lat: 44.8378, lng: -0.5792 },  // Bordeaux
  { lat: 47.2184, lng: -1.5536 },  // Nantes
  { lat: 50.6292, lng: 3.0573 },   // Lille
  { lat: 48.5734, lng: 7.7521 },   // Strasbourg
  { lat: 43.7102, lng: 7.2620 },   // Nice
  { lat: 48.1173, lng: -1.6778 },  // Rennes
  { lat: 43.6108, lng: 3.8767 },   // Montpellier
  { lat: 45.1885, lng: 5.7245 },   // Grenoble
  { lat: 45.4397, lng: 4.3872 },   // Saint-Étienne
  { lat: 43.1242, lng: 5.9280 },   // Toulon
  { lat: 49.4432, lng: 1.0993 },   // Rouen
  { lat: 47.3220, lng: 5.0415 },   // Dijon
  { lat: 49.2583, lng: 4.0317 },   // Reims
  { lat: 45.7797, lng: 3.0863 },   // Clermont-Ferrand
  { lat: 47.4784, lng: -0.5632 },  // Angers
  { lat: 48.6921, lng: 6.1844 },   // Nancy
  { lat: 49.1829, lng: -0.3707 },  // Caen
  { lat: 43.5297, lng: 5.4474 },   // Aix-en-Provence
  { lat: 48.3904, lng: -4.4861 },  // Brest
  { lat: 49.1193, lng: 6.1757 },   // Metz
];

const ROMES = "G1803,D1506,N4105,K1302,D1507,M1607,K2112,G1802,N4101";

function parseAddress(address: string | undefined): { city: string | null; postal: string | null } {
  if (!address) return { city: null, postal: null };
  // Matches "75001 Paris", "75001 PARIS", "13001 Marseille", etc.
  const match = address.match(/(\d{5})\s+(.+)$/);
  if (match) return { city: match[2].trim(), postal: match[1] };
  return { city: null, postal: null };
}

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lbaApiKey = process.env.LBA_API_KEY;
  if (!lbaApiKey) {
    return NextResponse.json({ success: true, inserted: 0, skipped: "LBA_API_KEY not configured" });
  }

  try {
    const now = new Date().toISOString();

    const responses = await Promise.allSettled(
      CITIES.map(({ lat, lng }) =>
        fetch(
          `https://api.apprentissage.beta.gouv.fr/api/job/v1/search?romes=${ROMES}&latitude=${lat}&longitude=${lng}&radius=50`,
          { headers: { Accept: "application/json", Authorization: `Bearer ${lbaApiKey}` } }
        ).then(async (r) => {
          const body = await r.json();
          return r.ok ? body : { jobs: [] };
        })
      )
    );

    const seen = new Set<string>();
    const rows: Record<string, unknown>[] = [];

    for (const result of responses) {
      if (result.status !== "fulfilled") continue;
      const jobs = result.value?.jobs;
      if (!Array.isArray(jobs)) continue;

      for (const job of jobs) {
        if (!job || typeof job !== "object") continue;
        const id = job?.identifier?.id;
        if (typeof id !== "string" || !id) continue;
        if (seen.has(id)) continue;
        seen.add(id);

        const title = job?.offer?.title;
        if (typeof title !== "string" || !title) continue;

        const description = job?.offer?.description
          ? sanitizeHtml(String(job.offer.description), { allowedTags: [], allowedAttributes: {} })
          : null;
        const address = job?.workplace?.location?.address;
        const { city, postal } = parseAddress(typeof address === "string" ? address : undefined);
        const coords = job?.workplace?.location?.geopoint?.coordinates;

        rows.push({
          source: "lba",
          source_id: id,
          url: job?.apply?.url ?? null,
          title,
          company_name: job?.workplace?.name ?? null,
          company_siren: typeof job?.workplace?.siret === "string" ? job.workplace.siret.slice(0, 9) : null,
          description,
          salary_raw: null,
          salary_min: null,
          salary_max: null,
          salary_period: null,
          location_city: city,
          location_postal: postal,
          location_lat: Array.isArray(coords) ? coords[1] : null,
          location_lng: Array.isArray(coords) ? coords[0] : null,
          contract_type: "alternance",
          posted_at: job?.offer?.publication?.creation ?? job?.contract?.start ?? null,
          raw_data: { id, contract_type: job?.contract?.type },
          scraped_at: now,
        });
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: true, inserted: 0 });
    }

    let inserted = 0;
    const supabase = createServiceClient();
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { data: upserted, error } = await supabase
        .from("raw_offers")
        .upsert(batch, { onConflict: "source,source_id" })
        .select("id, contract_type");
      if (!error && upserted) {
        inserted += upserted.length;
        const enrichedRows = upserted.map((r) => ({
          raw_offer_id: r.id,
          trust_score: 50,
          trust_reasons: ["Offre importée — scoring IA en attente"],
          company_verified: false,
          sirene_data: null,
          description_embedding: null,
          is_scam_likely: false,
          contract_type_clean: r.contract_type,
        }));
        await supabase
          .from("enriched_offers")
          .upsert(enrichedRows, { onConflict: "raw_offer_id", ignoreDuplicates: true });
      }
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error("[lba]", err);
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
}
