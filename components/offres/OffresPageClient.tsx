"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { EnrichedOfferWithRaw } from "@/types/database";
import { matchesSecteur, SECTEURS } from "@/lib/secteurs";
import { SearchBar } from "./SearchBar";
import { SortSelect } from "./SortSelect";
import { FilterPanel } from "./FilterPanel";
import { OfferList } from "./OfferList";
import { EmptyState } from "./EmptyState";

const SECTEUR_ICONS: Record<string, string> = {
  restauration: "🍽️",
  vente: "🛍️",
  babysitting: "👶",
  enseignement: "📚",
  hotellerie: "🏨",
  livraison: "🚴",
  "service-client": "🎧",
  logistique: "📦",
  administratif: "💼",
  autre: "✨",
};

interface OffresPageClientProps {
  initialOffres: EnrichedOfferWithRaw[];
  initialTotal: number;
  initialPage: number;
  initialQ: string;
  initialVille: string;
  initialType: string;
  initialSecteurs: string[];
  initialTypes: string[];
  initialTrustMin: number;
  initialSalaireMin: number;
  initialDistance: number;
  initialSort: string;
}

function Pagination({
  total,
  page,
  onPageChange,
}: {
  total: number;
  page: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / 20);
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-8"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
        Précédent
      </button>

      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Suivant
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export function OffresPageClient({
  initialOffres,
  initialTotal,
  initialPage,
  initialQ,
  initialVille,
  initialType,
  initialSecteurs,
  initialTypes,
  initialTrustMin,
  initialSalaireMin,
  initialDistance,
  initialSort,
}: OffresPageClientProps) {
  const router = useRouter();

  // Search bar state
  const [q, setQ] = useState(initialQ);
  const [ville, setVille] = useState(initialVille);
  const [type, setType] = useState(initialType);

  // Filter state
  const [secteurs, setSecteurs] = useState<string[]>(initialSecteurs);
  const [types, setTypes] = useState<string[]>(initialTypes);
  const [trustMin, setTrustMin] = useState(initialTrustMin);
  const [salaireMin, setSalaireMin] = useState(initialSalaireMin);
  const [distance, setDistance] = useState(initialDistance);

  // Sort & UI state
  const [sort, setSort] = useState(initialSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredOffres = useMemo(() => {
    let results = [...initialOffres];

    // 1. Text filter
    if (q.trim()) {
      const qLower = q.toLowerCase();
      results = results.filter(
        (o) =>
          o.raw_offers.title.toLowerCase().includes(qLower) ||
          (o.raw_offers.company_name?.toLowerCase().includes(qLower) ?? false) ||
          (o.raw_offers.description?.toLowerCase().includes(qLower) ?? false)
      );
    }

    // 2. Ville filter
    if (ville.trim()) {
      const villeLower = ville.toLowerCase();
      results = results.filter((o) =>
        (o.raw_offers.location_city?.toLowerCase().includes(villeLower) ?? false)
      );
    }

    // 3. Contract type filter (from search bar)
    if (type) {
      results = results.filter((o) => o.raw_offers.contract_type === type);
    }

    // 4. Secteur filter
    if (secteurs.length > 0) {
      results = results.filter((o) =>
        secteurs.some((s) =>
          matchesSecteur(
            o.raw_offers.title,
            o.raw_offers.description,
            s
          )
        )
      );
    }

    // 5. Contract types filter (from filter panel)
    if (types.length > 0) {
      results = results.filter((o) =>
        types.includes(o.raw_offers.contract_type ?? "")
      );
    }

    // 6. Trust score filter
    if (trustMin > 0) {
      results = results.filter(
        (o) => o.trust_score !== null && o.trust_score >= trustMin
      );
    }

    // 7. Salaire filter
    if (salaireMin > 0) {
      results = results.filter(
        (o) => o.raw_offers.salary_min !== null && o.raw_offers.salary_min >= salaireMin
      );
    }

    // 8. Sort
    if (sort === "trust") {
      results.sort((a, b) => (b.trust_score ?? -1) - (a.trust_score ?? -1));
    } else if (sort === "salaire") {
      results.sort((a, b) => (b.raw_offers.salary_min ?? -1) - (a.raw_offers.salary_min ?? -1));
    }
    // default: keep original enriched_at order from server

    return results;
  }, [initialOffres, q, ville, type, secteurs, types, trustMin, salaireMin, sort]);

  function handleSearchSubmit(newQ: string, newVille: string, newType: string) {
    setQ(newQ);
    setVille(newVille);
    setType(newType);
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newVille) params.set("ville", newVille);
    if (newType) params.set("type", newType);
    params.set("page", "1");
    router.replace(`/offres${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleFiltersChange(filters: {
    secteurs: string[];
    types: string[];
    trustMin: number;
    salaireMin: number;
    distance: number;
  }) {
    setSecteurs(filters.secteurs);
    setTypes(filters.types);
    setTrustMin(filters.trustMin);
    setSalaireMin(filters.salaireMin);
    setDistance(filters.distance);
  }

  function handleReset() {
    setQ("");
    setVille("");
    setType("");
    setSecteurs([]);
    setTypes([]);
    setTrustMin(0);
    setSalaireMin(0);
    setDistance(30);
    setSort("");
    router.replace("/offres");
  }

  const hasFilters =
    q || ville || type || secteurs.length > 0 || types.length > 0 || trustMin > 0 || salaireMin > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-1">
          Trouve ton job étudiant
        </h1>
        <p className="text-sm text-muted-foreground">
          Toutes les offres sont vérifiées par notre IA — zéro arnaque, zéro perte de temps.
        </p>
      </div>

      {/* Hero Search Bar */}
      <SearchBar
        defaultQ={q}
        defaultVille={ville}
        defaultType={type}
        onSearch={handleSearchSubmit}
      />
      <p className="text-center text-xs text-muted-foreground mt-3">
        Offres mises à jour toutes les 3h · Vérifiées par notre IA
      </p>

      {/* Sector chips */}
      <div className="flex flex-wrap gap-2 justify-center mt-5 mb-8">
        {SECTEURS.filter((s) => s.slug !== "autre").map((s) => {
          const active = secteurs.includes(s.slug);
          return (
            <button
              key={s.slug}
              onClick={() => {
                const next = active
                  ? secteurs.filter((x) => x !== s.slug)
                  : [...secteurs, s.slug];
                setSecteurs(next);
                handleFiltersChange({ secteurs: next, types, trustMin, salaireMin, distance });
              }}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span>{SECTEUR_ICONS[s.slug]}</span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Results count + mobile filter btn */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-foreground font-medium">
          {filteredOffres.length} offre{filteredOffres.length !== 1 ? "s" : ""} trouvée
          {filteredOffres.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden flex items-center gap-1.5 text-sm text-muted-foreground border border-border/50 rounded-lg px-3 py-1.5 hover:border-border transition-colors"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={16} />
            Filtrer
          </button>
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Left column: filters (desktop) */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <FilterPanel
            secteurs={secteurs}
            types={types}
            trustMin={trustMin}
            salaireMin={salaireMin}
            distance={distance}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />
        </aside>

        {/* Right: results */}
        <main className="flex-1 min-w-0" id="main-content">
          {filteredOffres.length === 0 && hasFilters ? (
            <EmptyState filtered onReset={handleReset} />
          ) : (
            <OfferList offres={filteredOffres} />
          )}

          {/* Pagination */}
          {initialTotal > 20 && (
            <Pagination
              total={initialTotal}
              page={initialPage}
              onPageChange={(p) => router.push(`/offres?page=${p}`)}
            />
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-[300px] h-full bg-background overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-foreground">Filtres</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              secteurs={secteurs}
              types={types}
              trustMin={trustMin}
              salaireMin={salaireMin}
              distance={distance}
              onChange={handleFiltersChange}
              onReset={handleReset}
            />
          </div>
        </div>
      )}
    </div>
  );
}
