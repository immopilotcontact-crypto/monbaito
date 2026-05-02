export const runtime = "nodejs";
export const maxDuration = 90;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { computeTrustScore } from "@/lib/trust-score";
import { embedText } from "@/lib/openai-client";

// Traite N offres stub (score=50) par run, en parallèle par lots
const MAX_PER_RUN = 10;
const BATCH_SIZE = 5;

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Stubs = enriched_offers encore à 50/100, on récupère les données raw en même temps
  const { data: stubs, error } = await supabase
    .from("enriched_offers")
    .select(
      "raw_offer_id, raw_offers(id, title, company_name, company_siren, salary_min, salary_period, contract_type, description, url)"
    )
    .eq("trust_score", 50)
    .is("description_embedding", null)
    .limit(MAX_PER_RUN);

  if (error) {
    console.error("[cron/enrich] fetch stubs:", error.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  if (!stubs?.length) {
    return NextResponse.json({ success: true, enriched: 0, failed: 0 });
  }

  let enriched = 0;
  let failed = 0;

  // Traitement par lots pour ne pas saturer les APIs IA
  for (let i = 0; i < stubs.length; i += BATCH_SIZE) {
    const batch = stubs.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (stub) => {
        const raw = stub.raw_offers as unknown as Record<string, unknown> | null;
        if (!raw) return;

        // Trust score IA (SIRENE + détection arnaque Claude Haiku + salary)
        const trust = await computeTrustScore({
          companyName: raw.company_name as string | null,
          siren: raw.company_siren as string | null,
          salaryMin: raw.salary_min as number | null,
          salaryPeriod: raw.salary_period as string | null,
          contractType: raw.contract_type as string | null,
          description: raw.description as string | null,
          applyUrl: raw.url as string | null,
        });

        // Embedding (facultatif — matching sémantique)
        let embedding: number[] | null = null;
        const desc = raw.description as string | null;
        if (desc && desc.length > 20) {
          try {
            embedding = await embedText(`${raw.title ?? ""}\n${desc}`);
          } catch {
            // embedding non bloquant
          }
        }

        const { error: updateErr } = await supabase
          .from("enriched_offers")
          .update({
            trust_score: trust.score,
            trust_reasons: trust.reasons,
            company_verified: trust.companyVerified,
            sirene_data: trust.sireneData,
            description_embedding: embedding,
            is_scam_likely: trust.isScamLikely,
          })
          .eq("raw_offer_id", stub.raw_offer_id);

        if (updateErr) throw new Error(updateErr.message);
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") enriched++;
      else {
        failed++;
        console.error("[cron/enrich] offer failed:", r.reason);
      }
    }
  }

  return NextResponse.json({ success: true, enriched, failed });
}
