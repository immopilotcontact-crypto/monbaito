import Link from "next/link";
import type { EnrichedOfferWithRaw } from "@/types/database";
import { TrustBadge } from "./TrustBadge";
import { PostulerButton } from "./PostulerButton";

interface OfferCardProps {
  offer: EnrichedOfferWithRaw;
}

const CONTRACT_LABELS: Record<string, string> = {
  student: "Job étudiant",
  alternance: "Alternance",
  internship: "Stage",
  seasonal: "Saisonnier",
  other: "Autre",
};

function formatSalary(
  salaryMin: number | null,
  salaryPeriod: "hour" | "month" | "year" | null
): string | null {
  if (salaryMin === null) return null;
  const periodLabel =
    salaryPeriod === "hour"
      ? "/h"
      : salaryPeriod === "month"
      ? "/mois"
      : salaryPeriod === "year"
      ? "/an"
      : "";
  return `${salaryMin}€${periodLabel}`;
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export function OfferCard({ offer }: OfferCardProps) {
  const raw = offer.raw_offers;
  const salary = formatSalary(raw.salary_min, raw.salary_period);
  const contractLabel = raw.contract_type ? CONTRACT_LABELS[raw.contract_type] : null;

  return (
    <article className="bg-card border border-border/50 rounded-xl p-5 hover:-translate-y-px hover:shadow-lg transition-all duration-150 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-base text-foreground line-clamp-2 leading-snug">
            {raw.title}
          </h2>
          {raw.company_name && (
            <p className="text-sm text-muted-foreground mt-0.5">{raw.company_name}</p>
          )}
        </div>
        <div className="flex-shrink-0 mt-0.5">
          <TrustBadge score={offer.trust_score} />
        </div>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {raw.location_city && (
          <span className="text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
            📍 {raw.location_city}
          </span>
        )}
        {contractLabel && (
          <span className="text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
            ⏱ {contractLabel}
          </span>
        )}
        {salary && (
          <span className="text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
            💶 {salary}
          </span>
        )}
      </div>

      {/* Description */}
      {raw.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {raw.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 mt-auto pt-1">
        <span className="text-xs text-muted-foreground">
          {relativeTime(raw.posted_at)}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/offres/${offer.id}`}
            className="text-xs text-muted-foreground hover:text-foreground border border-border/50 px-3 py-1.5 rounded-lg hover:border-border transition-colors"
          >
            Détails
          </Link>
          <PostulerButton
            offreId={offer.id}
            externalUrl={raw.url}
            className="!text-[11px] !px-3 !py-1.5 !tracking-tight rounded-lg"
          />
        </div>
      </div>
    </article>
  );
}
