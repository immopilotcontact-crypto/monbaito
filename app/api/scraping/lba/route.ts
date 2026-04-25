export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import sanitizeHtml from "sanitize-html";

const CITIES = [
  { lat: 48.8566, lng: 2.3522 },
  { lat: 45.764,  lng: 4.8357 },
  { lat: 43.2965, lng: 5.3698 },
  { lat: 43.6047, lng: 1.4442 },
  { lat: 44.8378, lng: -0.5792 },
  { lat: 47.2184, lng: -1.5536 },
  { lat: 50.6292, lng: 3.0573 },
  { lat: 48.5734, lng: 7.7521 },
];

const ROMES = "G1803,D1506,N4105,K1302,D1507,M1607,K2112,G1802,N4101";

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
