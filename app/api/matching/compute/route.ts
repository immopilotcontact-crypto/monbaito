export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { createClient } from "@/lib/supabase-server";
import { haversineKm } from "@/lib/geo";
import { z } from "zod";

const BodySchema = z.object({ userId: z.string().uuid().optional() });

// Score de similarité cosinus entre deux vecteurs
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { userId } = BodySchema.parse(body);

  const supabase = createServiceClient();

  // Récupère les profils à matcher (1 user ou tous)
  const profileQuery = supabase.from("profiles").select("*");
  if (userId) profileQuery.eq("id", userId);
  const { data: profiles } = await profileQuery;
  if (!profiles?.length) return NextResponse.json({ success: true, matched: 0 });

  // Récupère toutes les offres enrichies non-arnaque
  const { data: offers } = await supabase
    .from("enriched_offers")
    .select("*, raw_offers(*)")
    .eq("is_scam_likely", false)
    .gte("trust_score", 20)
    .order("enriched_at", { ascending: false })
    .limit(500);

  if (!offers?.length) return NextResponse.json({ success: true, matched: 0 });

  let totalMatched = 0;

  for (const profile of profiles) {
    const lookingFor = profile.looking_for ?? {};
    const acceptedContracts = new Set<string>();
    if (lookingFor.student_job) acceptedContracts.add("student");
    if (lookingFor.alternance) acceptedContracts.add("alternance");
    if (lookingFor.internship) acceptedContracts.add("internship");
    if (lookingFor.seasonal) acceptedContracts.add("seasonal");

    const upsertRows: Record<string, unknown>[] = [];

    for (const offer of offers) {
      const raw = (offer as any).raw_offers;

      // ── Filtres durs ──────────────────────────────────────
      // Type de contrat
      if (acceptedContracts.size > 0 && raw.contract_type && !acceptedContracts.has(raw.contract_type)) continue;

      // Salaire minimum
      if (profile.min_hourly_rate && raw.salary_min && raw.salary_period === "hour" && raw.salary_min < profile.min_hourly_rate) continue;

      // Distance
      let distanceKm: number | null = null;
      if (raw.location_lat && raw.location_lng) {
        // Pour le MVP, on utilise la ville du profil via geocoding adresse.data.gouv.fr (lazy)
        // Pour simplifier, on skip le filtre distance si on n'a pas les coordonnées du profil
        // TODO: stocker lat/lng dans le profil lors de l'onboarding
        distanceKm = null;
      }
      if (distanceKm !== null && distanceKm > profile.mobility_km) continue;

      // Red flags textuels
      const description = (raw.description ?? "").toLowerCase();
      const hasRedFlag = (profile.red_flags ?? []).some((flag: string) => {
        const patterns: Record<string, string[]> = {
          porte_a_porte: ["porte à porte", "porte-à-porte", "prospection terrain"],
          mlm: ["mlm", "réseau de vente", "marketing de réseau", "pyramide"],
          commission_only: ["commission uniquement", "rémunération variable", "selon performance"],
          stage_non_remunere: ["non rémunéré", "sans rémunération"],
          frais_candidat: ["kit de démarrage", "formation obligatoire payante", "frais d'adhésion"],
        };
        return (patterns[flag] ?? []).some((p) => description.includes(p));
      });
      if (hasRedFlag) continue;

      // ── Filtres doux (score) ──────────────────────────────
      let matchScore = 0;
      const reasons: { type: string; label: string; score: number }[] = [];

      // 1. Similarité embedding (poids 50)
      if (profile.cv_embedding && offer.description_embedding) {
        const sim = cosineSimilarity(profile.cv_embedding as number[], offer.description_embedding as number[]);
        const embScore = Math.round(sim * 50);
        matchScore += embScore;
        reasons.push({ type: "embedding", label: "Correspondance CV/offre", score: embScore });
      } else {
        matchScore += 25; // Pas d'embedding : score neutre
      }

      // 2. Trust score (poids 30)
      const trustContrib = Math.round(((offer.trust_score ?? 50) / 100) * 30);
      matchScore += trustContrib;
      reasons.push({ type: "trust", label: "Trust Score", score: trustContrib });

      // 3. Disponibilités (poids 20) — simplifié
      matchScore += 15; // Score statique pour le MVP

      if (matchScore < 50) continue;

      upsertRows.push({
        user_id: profile.id,
        offer_id: offer.id,
        match_score: Math.min(100, matchScore),
        match_reasons: reasons,
        distance_km: distanceKm,
      });
    }

    if (upsertRows.length > 0) {
      await supabase.from("user_matches").upsert(upsertRows as any, { onConflict: "user_id,offer_id" });
      totalMatched += upsertRows.length;
    }
  }

  return NextResponse.json({ success: true, matched: totalMatched });
}
