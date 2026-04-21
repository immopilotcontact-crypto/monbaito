import { createClient as createSupabase } from "@supabase/supabase-js";
import type { EnrichedOfferWithRaw } from "@/types/database";

export async function getOffreById(
  id: string
): Promise<EnrichedOfferWithRaw | null> {
  try {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from("enriched_offers")
      .select("*, raw_offers(*)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as unknown as EnrichedOfferWithRaw;
  } catch {
    return null;
  }
}

const PER_PAGE = 20;

function getPublicClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface GetOffresOptions {
  page?: number;
  ville?: string;
  q?: string;
  trust_min?: number;
}

export async function getOffres(
  opts: GetOffresOptions = {}
): Promise<{ offres: EnrichedOfferWithRaw[]; total: number }> {
  try {
    const supabase = getPublicClient();
    const page = Math.max(1, opts.page ?? 1);
    const from = (page - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    let query = supabase
      .from("enriched_offers")
      .select("*, raw_offers(*)", { count: "exact" })
      .order("enriched_at", { ascending: false })
      .range(from, to);

    if (opts.trust_min && opts.trust_min > 0) {
      query = query.gte("trust_score", opts.trust_min);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[getOffres] Supabase error:", error.message);
      return { offres: [], total: 0 };
    }

    return {
      offres: (data as unknown as EnrichedOfferWithRaw[]) ?? [],
      total: count ?? 0,
    };
  } catch (err) {
    console.error("[getOffres] Unexpected error:", err);
    return { offres: [], total: 0 };
  }
}
