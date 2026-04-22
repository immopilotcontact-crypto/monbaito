import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

// Enrichit toutes les raw_offers qui n'ont pas encore d'enriched_offer
export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Récupère les IDs déjà enrichis
  const { data: enriched } = await supabase
    .from("enriched_offers")
    .select("raw_offer_id");

  const enrichedIds = (enriched ?? []).map((e) => e.raw_offer_id).filter(Boolean);

  // Raw offers sans enrichissement
  let pendingQuery = supabase.from("raw_offers").select("id").limit(50);
  if (enrichedIds.length > 0) {
    pendingQuery = pendingQuery.not("id", "in", `(${enrichedIds.join(",")})`);
  }
  const { data: pending } = await pendingQuery;

  if (!pending?.length) return NextResponse.json({ success: true, scored: 0 });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monbaito.fr";
  const headers = {
    Authorization: `Bearer ${process.env.CRON_SECRET}`,
    "Content-Type": "application/json",
  };

  let scored = 0;
  // Traitement séquentiel pour ne pas surcharger l'API Anthropic
  for (const { id } of pending) {
    const res = await fetch(`${base}/api/trust-score/compute`, {
      method: "POST",
      headers,
      body: JSON.stringify({ rawOfferId: id }),
    });
    if (res.ok) scored++;
  }

  // Déclenche le matching
  await fetch(`${base}/api/cron/match`, { method: "POST", headers }).catch(() => {});

  return NextResponse.json({ success: true, scored });
}
