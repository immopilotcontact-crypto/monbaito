"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal, X, ChevronLeft, ChevronRight,
  UtensilsCrossed, ShoppingBag, Baby, BookOpen, BedDouble,
  Bike, Headphones, Package, Briefcase, Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { EnrichedOfferWithRaw } from "@/types/database";
import { SECTEURS } from "@/lib/secteurs";
import { SearchBar } from "./SearchBar";
import { SortSelect } from "./SortSelect";
import { FilterPanel } from "./FilterPanel";
import { OfferList } from "./OfferList";
import { EmptyState } from "./EmptyState";

const SECTEUR_ICONS: Record<string, LucideIcon> = {
  restauration: UtensilsCrossed,
  vente: ShoppingBag,
  babysitting: Baby,
  enseignement: BookOpen,
  hotellerie: BedDouble,
  livraison: Bike,
  "service-client": Headphones,
  logistique: Package,
  administratif: Briefcase,
  autre: Sparkles,
};

function SecteurIcon({ slug }: { slug: string }) {
  const Icon = SECTEUR_ICONS[slug];
  if (!Icon) return null;
  return <Icon size={13} />;
}

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
  const totalPages = Math.ceil(total / 40);
  if (totalPages <= 1) return null;

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
        Précédent
      </button>

      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">...</span>
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
        disabled={page >= Math.ceil(total / 40)}
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sort côté client uniquement pour "salaire" (tri serveur = "trust")
  const displayOffres = useMemo(() => {
    if (initialSort === "salaire") {
      return [...initialOffres].sort(
        (a, b) => (b.raw_offers.salary_min ?? -1) - (a.raw_offers.salary_min ?? -1)
      );
    }
    return initialOffres;
  }, [initialOffres, initialSort]);

  function buildUrl(overrides: Record<string, string | number | string[]>) {
    const current: Record<string, string> = {};
    if (initialQ) current.q = initialQ;
    if (initialVille) current.ville = initialVille;
    if (initialType) current.type = initialType;
    if (initialSecteurs.length > 0) current.secteurs = initialSecteurs.join(",");
    if (initialTypes.length > 0) current.types = initialTypes.join(",");
    if (initialTrustMin > 0) current.trust = String(initialTrustMin);
    if (initialSalaireMin > 0) current.salaire = String(initialSalaireMin);
    if (initialSort) current.tri = initialSort;
    current.page = "1";

    const merged = { ...current, ...Object.fromEntries(
      Object.entries(overrides).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : String(v)])
    )};

    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "0") p.set(k, v);
    }
    return `/offres${p.toString() ? `?${p.toString()}` : ""}`;
  }

  function navigate(overrides: Record<string, string | number | string[]>) {
    router.push(buildUrl(overrides));
  }

  function navigateDebounced(overrides: Record<string, string | number | string[]>) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(overrides), 400);
  }

  function handleSearchSubmit(q: string, ville: string, type: string) {
    navigate({ q, ville, type, page: 1 });
  }

  function handleSecteurToggle(slug: string) {
    const next = initialSecteurs.includes(slug)
      ? initialSecteurs.filter((s) => s !== slug)
      : [...initialSecteurs, slug];
    navigate({ secteurs: next, page: 1 });
  }

  function handleFiltersChange(filters: {
    secteurs: string[];
    types: string[];
    trustMin: number;
    salaireMin: number;
    distance: number;
  }) {
    navigateDebounced({
      secteurs: filters.secteurs,
      types: filters.types,
      trust: filters.trustMin || "0",
      salaire: filters.salaireMin || "0",
      page: 1,
    });
  }

  function handleReset() {
    router.push("/offres");
  }

  function handleSortChange(newSort: string) {
    navigate({ tri: newSort, page: 1 });
  }

  function handlePageChange(p: number) {
    const url = buildUrl({ page: p });
    router.push(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasFilters =
    initialQ || initialVille || initialType ||
    initialSecteurs.length > 0 || initialTypes.length > 0 ||
    initialTrustMin > 0 || initialSalaireMin > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-1">
          Trouve ton job étudiant
        </h1>
        <p className="text-sm text-muted-foreground">
          Toutes les offres sont vérifiées par notre IA — résultats rapides, sans perte de temps.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        defaultQ={initialQ}
        defaultVille={initialVille}
        defaultType={initialType}
        onSearch={handleSearchSubmit}
      />
      <p className="text-center text-xs text-muted-foreground mt-3">
        Offres mises à jour toutes les 6h · Vérifiées par notre IA
      </p>

      {/* Sector chips */}
      <div className="flex flex-wrap gap-2 justify-center mt-5 mb-8">
        {SECTEURS.filter((s) => s.slug !== "autre").map((s) => {
          const active = initialSecteurs.includes(s.slug);
          return (
            <button
              key={s.slug}
              onClick={() => handleSecteurToggle(s.slug)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {SECTEUR_ICONS[s.slug] && <SecteurIcon slug={s.slug} />}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Results count + mobile filter btn + sort */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-foreground font-medium">
          {initialTotal} offre{initialTotal !== 1 ? "s" : ""} trouvée{initialTotal !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden flex items-center gap-1.5 text-sm text-muted-foreground border border-border/50 rounded-lg px-3 py-1.5 hover:border-border transition-colors"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={16} />
            Filtrer
          </button>
          <SortSelect value={initialSort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Filtres desktop */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <FilterPanel
            secteurs={initialSecteurs}
            types={initialTypes}
            trustMin={initialTrustMin}
            salaireMin={initialSalaireMin}
            distance={initialDistance}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />
        </aside>

        {/* Résultats */}
        <main className="flex-1 min-w-0" id="main-content">
          {displayOffres.length === 0 ? (
            <EmptyState filtered={!!hasFilters} onReset={handleReset} />
          ) : (
            <OfferList offres={displayOffres} />
          )}

          <Pagination
            total={initialTotal}
            page={initialPage}
            onPageChange={handlePageChange}
          />
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full sm:w-[320px] h-full bg-background overflow-y-auto p-5 sm:p-6">
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
              secteurs={initialSecteurs}
              types={initialTypes}
              trustMin={initialTrustMin}
              salaireMin={initialSalaireMin}
              distance={initialDistance}
              onChange={(filters) => {
                handleFiltersChange(filters);
                setMobileFilterOpen(false);
              }}
              onReset={() => {
                handleReset();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
