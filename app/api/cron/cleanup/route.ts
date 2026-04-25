export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

// Vérifie si une offre France Travail existe encore (404 = supprimée)
async function isFTOfferDead(sourceId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/${sourceId}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    );
    return res.status === 404;
  } catch {
    return false; // en cas d'erreur réseau, on ne supprime pas
  }
}

async function getFTToken(): Promise<string | null> {
  const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  try {
    const res = await fetch(
      "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
          scope: "api_offresdemploiv2 o2dsoffre",
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  let deleted = 0;
  let verified = 0;

  // Étape 1 — Hard-delete de tout ce qui dépasse 3 jours (toutes sources)
  const cutoff3d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { error: deleteOldError, count: oldCount } = await supabase
    .from("raw_offers")
    .delete({ count: "exact" })
    .lt("scraped_at", cutoff3d);

  if (!deleteOldError && oldCount) deleted += oldCount;

  // Étape 2 — Vérifie les offres France Travail "vieillissantes" (12h–48h sans refresh)
  const cutoff12h = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: agingOffers } = await supabase
    .from("raw_offers")
    .select("id, source_id")
    .eq("source", "france_travail")
    .lt("scraped_at", cutoff12h)
    .gte("scraped_at", cutoff48h)
    .limit(80); // max 80 vérifications par run pour tenir dans 60s

  if (agingOffers && agingOffers.length > 0) {
    const token = await getFTToken();
    if (token) {
      // Vérifie en lot de 10 en parallèle
      const BATCH = 10;
      for (let i = 0; i < agingOffers.length; i += BATCH) {
        const batch = agingOffers.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map(async (offer) => ({
            id: offer.id,
            dead: offer.source_id ? await isFTOfferDead(offer.source_id, token) : false,
          }))
        );
        verified += batch.length;

        const deadIds = results.filter((r) => r.dead).map((r) => r.id);
        if (deadIds.length > 0) {
          const { count } = await supabase
            .from("raw_offers")
            .delete({ count: "exact" })
            .in("id", deadIds);
          if (count) deleted += count;
        }
      }
    }
  }

  return NextResponse.json({ success: true, deleted, verified });
}
