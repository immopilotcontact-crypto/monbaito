import Link from "next/link";
import { MapPin, Clock, Banknote } from "lucide-react";
import type { EnrichedOfferWithRaw } from "@/types/database";
import { TrustBadge } from "./TrustBadge";
import { PostulerButton } from "./PostulerButton";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
];

function CompanyAvatar({ name }: { name: string | null }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    : "?";
  const hash = name ? [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0;
  const colorClass = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${colorClass}`}>
      {initials}
    </div>
  );
}

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
      <div className="flex items-start gap-3">
        <CompanyAvatar name={raw.company_name} />
        <div className="min-w-0 flex-1">
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
          <span className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
            <MapPin size={11} />
            {raw.location_city}
          </span>
        )}
        {contractLabel && (
          <span className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
            <Clock size={11} />
            {contractLabel}
          </span>
        )}
        {salary && (
          <span className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
            <Banknote size={11} />
            {salary}
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
