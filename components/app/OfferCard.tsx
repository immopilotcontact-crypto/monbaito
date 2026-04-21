"use client";

import Link from "next/link";
import { MapPin, Clock, Euro, X } from "lucide-react";
import { TrustBadge } from "./TrustBadge";
import type { UserMatchWithOffer } from "@/types/database";

interface OfferCardProps {
  match: UserMatchWithOffer;
  onDismiss?: (matchId: string) => void;
}

const CONTRACT_LABELS: Record<string, string> = {
  student: "Job étudiant",
  alternance: "Alternance",
  internship: "Stage",
  seasonal: "Saisonnier",
  other: "Autre",
};

function timeAgo(date: string | null): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return `Il y a ${Math.floor(days / 7)} semaine${days >= 14 ? "s" : ""}`;
}

export function OfferCard({ match, onDismiss }: OfferCardProps) {
  const raw = match.enriched_offers.raw_offers;
  const enriched = match.enriched_offers;

  const salary = raw.salary_min
    ? `${raw.salary_min}€/${raw.salary_period === "hour" ? "h" : raw.salary_period === "month" ? "mois" : "an"}`
    : null;

  return (
    <article className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 transition-all">
      {onDismiss && (
        <button
          onClick={() => onDismiss(match.id)}
          aria-label="Pas intéressé"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}

      <div className="flex items-start justify-between gap-3 pr-8">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{raw.title}</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{raw.company_name}</p>
        </div>
        <div className="shrink-0">
          <TrustBadge score={enriched.trust_score} size="sm" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-[var(--muted-foreground)]">
        {raw.location_city && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {raw.location_city}
            {match.distance_km && ` · ${Math.round(match.distance_km)} km`}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1">
            <Euro size={12} />
            {salary}
          </span>
        )}
        {raw.contract_type && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {CONTRACT_LABELS[raw.contract_type] ?? raw.contract_type}
          </span>
        )}
        {raw.posted_at && (
          <span className="text-white/30">{timeAgo(raw.posted_at)}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        {match.match_score !== null && (
          <span className="text-xs text-white/30">
            Match{" "}
            <span
              className={`font-semibold ${
                match.match_score >= 80
                  ? "text-emerald-400"
                  : match.match_score >= 60
                  ? "text-amber-400"
                  : "text-white/60"
              }`}
            >
              {Math.round(match.match_score)}%
            </span>
          </span>
        )}
        <Link
          href={`/offre/${enriched.id}`}
          className="ml-auto text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Voir →
        </Link>
      </div>
    </article>
  );
}
