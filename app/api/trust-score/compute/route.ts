export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { computeTrustScore } from "@/lib/trust-score";
import { embedText } from "@/lib/openai-client";
import { z } from "zod";

const BodySchema = z.object({ rawOfferId: z.string().uuid() });

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const supabase = createServiceClient();
  const { data: raw, error: fetchErr } = await supabase
    .from("raw_offers")
    .select("*")
    .eq("id", parsed.data.rawOfferId)
    .single();

  if (fetchErr || !raw) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

  // Calcul trust score
  const result = await computeTrustScore({
    companyName: raw.company_name,
    siren: raw.company_siren,
    salaryMin: raw.salary_min,
    salaryPeriod: raw.salary_period,
    contractType: raw.contract_type,
    description: raw.description,
    applyUrl: raw.url,
  });

  // Embedding de la description
  let embedding: number[] | null = null;
  if (raw.description && raw.description.length > 20) {
    try {
      embedding = await embedText(`${raw.title}\n${raw.description}`);
    } catch {
      // Embedding facultatif — on continue sans
    }
  }

  const { error } = await supabase.from("enriched_offers").upsert(
    {
      raw_offer_id: raw.id,
      trust_score: result.score,
      trust_reasons: result.reasons,
      salary_score: null,
      company_verified: result.companyVerified,
      sirene_data: result.sireneData,
      description_embedding: embedding,
      is_scam_likely: result.isScamLikely,
      contract_type_clean: raw.contract_type,
    },
    { onConflict: "raw_offer_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, score: result.score, scam: result.isScamLikely });
}
