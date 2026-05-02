import { createClient as createSupabase } from "@supabase/supabase-js";
import type { EnrichedOfferWithRaw } from "@/types/database";
import { getSecteurBySlug } from "@/lib/secteurs";

export const PER_PAGE = 40;
const STUDENT_CONTRACT_TYPES = ["student", "seasonal", "alternance", "internship"];
// Offres considérées fraîches si vues dans les 7 derniers jours
const FRESHNESS_DAYS = 2; // 48h — offres retirées de la source disparaissent au prochain cycle

function getPublicClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Sentinel envoyé par le client pour "afficher tous les types sans exception"
export const ALL_TYPES_SENTINEL = "all";

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

    const freshnessCutoff = new Date(
      Date.now() - FRESHNESS_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    // "all" = sentinelle "tout voir", on ignore le filtre type dans ce cas
    const isShowAll = types.includes(ALL_TYPES_SENTINEL) || type === ALL_TYPES_SENTINEL;
    const rawExplicit = types.filter((t) => t !== ALL_TYPES_SENTINEL);
    const explicitTypes = rawExplicit.length > 0 ? rawExplicit : type && type !== ALL_TYPES_SENTINEL ? [type] : [];

    // Par défaut (aucun filtre type choisi) : jobs courts en premier plan
    // L'utilisateur doit cliquer "Tout voir" ou "Alternance" pour voir les autres
    const effectiveTypes = isShowAll
      ? []
      : explicitTypes.length > 0
      ? explicitTypes
      : ["student", "seasonal"];

    // Requête unique : enriched_offers ⟶ raw_offers (INNER JOIN)
    // Évite le pattern en 2 étapes qui génère une URL trop longue avec de nombreux IDs
    let query = supabase
      .from("enriched_offers")
      .select("*, raw_offers!inner(*)", { count: "exact" })
      .filter("raw_offers.contract_type", "in", `(${STUDENT_CONTRACT_TYPES.join(",")})`)
      .filter("raw_offers.scraped_at", "gte", freshnessCutoff);

    if (q.trim()) {
      const term = q.trim();
      query = query.or(
        `title.ilike.%${term}%,company_name.ilike.%${term}%`,
        { referencedTable: "raw_offers" }
      );
    }

    if (ville.trim()) {
      query = query.filter("raw_offers.location_city", "ilike", `%${ville.trim()}%`);
    }

    if (salaire_min > 0) {
      query = query.filter("raw_offers.salary_min", "gte", salaire_min);
    }

    if (secteurs.length > 0) {
      const keywords = secteurs
        .flatMap((slug) => getSecteurBySlug(slug)?.keywords ?? [])
        .slice(0, 25);
      if (keywords.length > 0) {
        const orFilter = keywords.map((kw) => `title.ilike.%${kw}%`).join(",");
        query = query.or(orFilter, { referencedTable: "raw_offers" });
      }
    }

    if (effectiveTypes.length > 0) {
      query = query.in("contract_type_clean", effectiveTypes);
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
      console.error("[getOffres] error:", error.message);
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
