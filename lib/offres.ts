import { createClient as createSupabase } from "@supabase/supabase-js";
import type { EnrichedOfferWithRaw } from "@/types/database";
import { getSecteurBySlug } from "@/lib/secteurs";

export const PER_PAGE = 40;
const STUDENT_CONTRACT_TYPES = ["student", "seasonal", "alternance", "internship"];
// Offres considérées fraîches si vues dans les 7 derniers jours
const FRESHNESS_DAYS = 7;

function getPublicClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface GetOffresOptions {
  page?: number;
  q?: string;
  ville?: string;
  type?: string;
  types?: string[];
  secteurs?: string[];
  trust_min?: number;
  salaire_min?: number;
  sort?: string;
}

export async function getOffres(
  opts: GetOffresOptions = {}
): Promise<{ offres: EnrichedOfferWithRaw[]; total: number }> {
  try {
    const supabase = getPublicClient();
    const page = Math.max(1, opts.page ?? 1);
    const from = (page - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    const {
      q = "",
      ville = "",
      type = "",
      types = [],
      secteurs = [],
      trust_min = 0,
      salaire_min = 0,
      sort = "",
    } = opts;

    // Étape 1 — Récupère les IDs de raw_offers correspondant aux filtres + fraîcheur
    const freshnessCutoff = new Date(
      Date.now() - FRESHNESS_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    let rawQuery = supabase
      .from("raw_offers")
      .select("id")
      .in("contract_type", STUDENT_CONTRACT_TYPES)
      .gte("scraped_at", freshnessCutoff);

    if (q.trim()) {
      rawQuery = rawQuery.or(
        `title.ilike.%${q.trim()}%,company_name.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`
      );
    }

    if (ville.trim()) {
      rawQuery = rawQuery.ilike("location_city", `%${ville.trim()}%`);
    }

    if (salaire_min > 0) {
      rawQuery = rawQuery.gte("salary_min", salaire_min);
    }

    if (secteurs.length > 0) {
      const keywords = secteurs
        .flatMap((slug) => getSecteurBySlug(slug)?.keywords ?? [])
        .slice(0, 25);
      if (keywords.length > 0) {
        const orFilter = keywords.map((kw) => `title.ilike.%${kw}%`).join(",");
        rawQuery = rawQuery.or(orFilter);
      }
    }

    const { data: rawData, error: rawError } = await rawQuery;

    if (rawError) {
      console.error("[getOffres] raw_offers error:", rawError.message);
      return { offres: [], total: 0 };
    }

    const rawIds = (rawData ?? []).map((r) => r.id);

    if (rawIds.length === 0) return { offres: [], total: 0 };

    // Étape 2 — Récupère enriched_offers filtrés sur ces IDs
    // types (plural, FilterPanel) prend la priorité sur type (singular, SearchBar)
    const explicitTypes = types.length > 0 ? types : type ? [type] : [];

    let query = supabase
      .from("enriched_offers")
      .select("*, raw_offers(*)", { count: "exact" })
      .in("raw_offer_id", rawIds);

    // Ne filtre contract_type_clean que si l'utilisateur a choisi un type.
    // Sans filtre, on inclut aussi les lignes NULL (offres pas encore enrichies).
    if (explicitTypes.length > 0) {
      query = query.in("contract_type_clean", explicitTypes);
    }

    if (trust_min > 0) {
      query = query.gte("trust_score", trust_min);
    }

    if (sort === "trust") {
      query = query.order("trust_score", { ascending: false, nullsFirst: false });
    } else {
      query = query.order("enriched_at", { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[getOffres] enriched_offers error:", error.message);
      return { offres: [], total: 0 };
    }

    return {
      offres: (data as unknown as EnrichedOfferWithRaw[]) ?? [],
      total: count ?? 0,
    };
  } catch (err) {
    console.error("[getOffres] unexpected:", err);
    return { offres: [], total: 0 };
  }
}

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
