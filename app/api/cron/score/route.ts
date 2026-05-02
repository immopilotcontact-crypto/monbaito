export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

// Enrichit toutes les raw_offers qui n'ont pas encore d'enriched_offer
// Sans appel IA — trust score par défaut à 50, scoring IA déclenché séparément
export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Trouve les raw_offers sans enriched_offer via LEFT JOIN
  const { data: pending, error: pendingError } = await supabase
    .from("raw_offers")
    .select("*, enriched_offers!left(raw_offer_id)")
    .is("enriched_offers.raw_offer_id", null)
    .limit(100);

  if (pendingError) {
    console.error("[cron/score] fetch pending:", pendingError.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  if (!pending?.length) {
    return NextResponse.json({ success: true, scored: 0 });
  }

  // Insertion directe dans enriched_offers sans appel IA
  const rows = pending.map((raw) => ({
    raw_offer_id: raw.id,
    trust_score: 50,
    trust_reasons: ["Offre importée — scoring IA en attente"],
    company_verified: false,
    sirene_data: null,
    description_embedding: null,
    is_scam_likely: false,
    contract_type_clean: raw.contract_type,
  }));

  const { error: insertError } = await supabase
    .from("enriched_offers")
    .upsert(rows, { onConflict: "raw_offer_id" });

  if (insertError) {
    console.error("[cron/score] upsert enriched:", insertError.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ success: true, scored: rows.length });
}
