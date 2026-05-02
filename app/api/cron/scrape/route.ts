export const maxDuration = 300;

import { NextResponse } from "next/server";

// Orchestrateur : appelle toutes les sources de scraping en parallèle
export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monbaito.fr";
  const headers = { Authorization: `Bearer ${process.env.CRON_SECRET}` };

  const results = await Promise.allSettled([
    fetch(`${base}/api/scraping/france-travail`, { headers }),
    fetch(`${base}/api/scraping/lba`, { headers }),
    fetch(`${base}/api/scraping/apify-sources`, { headers }),
  ]);

  const summary = await Promise.all(
    results.map(async (r) => {
      if (r.status === "fulfilled") {
        const json = await r.value.json().catch(() => ({}));
        return { ok: r.value.ok, ...json };
      }
      return { ok: false, error: r.reason?.message };
    })
  );

  // Phase 2 — création des stubs enriched_offers + nettoyage
  await Promise.all([
    fetch(`${base}/api/cron/score`, { headers }).catch(() => {}),
    fetch(`${base}/api/cron/cleanup`, { headers }).catch(() => {}),
  ]);

  // Phase 3 — scoring IA réel (SIRENE + Claude Haiku + embedding) sur les stubs
  const enrichResult = await fetch(`${base}/api/cron/enrich`, { headers })
    .then((r) => r.json().catch(() => ({})))
    .catch(() => ({}));

  return NextResponse.json({ success: true, sources: summary, enrich: enrichResult });
}
