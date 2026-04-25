export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

const CITIES = [
  { lat: 48.8566, lng: 2.3522 },   // Paris
  { lat: 45.764,  lng: 4.8357 },   // Lyon
  { lat: 43.2965, lng: 5.3698 },   // Marseille
  { lat: 43.6047, lng: 1.4442 },   // Toulouse
  { lat: 44.8378, lng: -0.5792 },  // Bordeaux
  { lat: 47.2184, lng: -1.5536 },  // Nantes
  { lat: 50.6292, lng: 3.0573 },   // Lille
  { lat: 48.5734, lng: 7.7521 },   // Strasbourg
];

const ROMES = "G1803,D1506,N4105,K1302,D1507,M1607,K2112,G1802,N4101";

const LBAJobSchema = z.object({
  identifier: z.object({
    id: z.string(),
    partner_job_id: z.string().optional(),
  }),
  workplace: z.object({
    name: z.string().optional(),
    siret: z.string().optional(),
    description: z.string().optional(),
    location: z.object({
      address: z.string().optional(),
      geopoint: z.object({
        coordinates: z.tuple([z.number(), z.number()]).optional(),
      }).optional(),
    }).optional(),
  }).optional(),
  apply: z.object({
    url: z.string().optional(),
  }).optional(),
  offer: z.object({
    title: z.string(),
    description: z.string().optional(),
    publication: z.object({
      creation: z.string().optional(),
    }).optional(),
  }),
  contract: z.object({
    start: z.string().optional(),
    type: z.array(z.string()).optional(),
  }).optional(),
}).passthrough();

function parseAddress(address: string | undefined): { city: string | null; postal: string | null } {
  if (!address) return { city: null, postal: null };
  const match = address.match(/(\d{5})\s+([A-Z\s-]+)$/);
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

    const cityDebug: string[] = [];
    const responses = await Promise.allSettled(
      CITIES.map(({ lat, lng }) =>
        fetch(
          `https://api.apprentissage.beta.gouv.fr/api/job/v1/search?romes=${ROMES}&latitude=${lat}&longitude=${lng}&radius=50`,
          { headers: { Accept: "application/json", Authorization: `Bearer ${lbaApiKey}` } }
        ).then(async (r) => {
          const body = await r.json();
          cityDebug.push(`${lat}:${r.status}:${body.jobs?.length ?? 0}`);
          return r.ok ? body : { jobs: [] };
        })
      )
    );

    const seen = new Set<string>();
    const rows: Record<string, unknown>[] = [];
    let totalJobs = 0, parseFail = 0, dupSkip = 0;

    for (const result of responses) {
      if (result.status !== "fulfilled") continue;
      const jobs: unknown[] = result.value?.jobs ?? [];
      totalJobs += jobs.length;
      for (const raw of jobs) {
        const parsed = LBAJobSchema.safeParse(raw);
        if (!parsed.success) { parseFail++; if (parseFail === 1) errors.push("ZOD: " + JSON.stringify(parsed.error.issues[0])); continue; }
        const o = parsed.data;
        const id = o.identifier.id;
        if (seen.has(id)) { dupSkip++; continue; }
        seen.add(id);

        const description = o.offer.description
          ? sanitizeHtml(o.offer.description, { allowedTags: [], allowedAttributes: {} })
          : null;
        const { city, postal } = parseAddress(o.workplace?.location?.address);
        const coords = o.workplace?.location?.geopoint?.coordinates;

        rows.push({
          source: "lba",
          source_id: id,
          url: o.apply?.url ?? null,
          title: o.offer.title,
          company_name: o.workplace?.name ?? null,
          company_siren: o.workplace?.siret?.slice(0, 9) ?? null,
          description,
          salary_raw: null,
          salary_min: null,
          salary_max: null,
          salary_period: null,
          location_city: city,
          location_postal: postal,
          location_lat: coords ? coords[1] : null,
          location_lng: coords ? coords[0] : null,
          contract_type: "alternance",
          posted_at: o.offer.publication?.creation ?? o.contract?.start ?? null,
          raw_data: { id: o.identifier.id, contract: o.contract, offer_status: (o as Record<string, unknown>)?.offer_status },
          scraped_at: now,
        });
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: true, inserted: 0 });
    }

    let inserted = 0;
    const errors: string[] = [];
    const supabase = createServiceClient();
    for (let i = 0; i < rows.length; i += 20) {
      const batch = rows.slice(i, i + 20);
      const { error } = await supabase
        .from("raw_offers")
        .upsert(batch, { onConflict: "source,source_id" });
      if (!error) inserted += batch.length;
      else errors.push(error.message);
    }

    return NextResponse.json({ success: true, totalJobs, parseFail, dupSkip, collected: rows.length, inserted, errors: errors.slice(0, 3) });
  } catch (err) {
    console.error("[lba]", err);
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
}
