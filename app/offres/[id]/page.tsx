import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOffreById } from "@/lib/offres";
import { PostulerButton } from "@/components/offres/PostulerButton";
import { TrustBadge } from "@/components/offres/TrustBadge";
import { Footer } from "@/components/shared/Footer";
import { ArrowLeft, MapPin, Clock, Banknote, Building2, CalendarDays, CheckCircle, AlertTriangle, XCircle, Minus, BadgeCheck } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const offre = await getOffreById(id);
  if (!offre) return { title: "Offre introuvable" };
  return {
    title: `${offre.raw_offers.title}${offre.raw_offers.company_name ? ` — ${offre.raw_offers.company_name}` : ""}`,
    description: offre.raw_offers.description?.slice(0, 160) ?? undefined,
  };
}

const CONTRACT_LABELS: Record<string, string> = {
  student: "Job étudiant",
  alternance: "Alternance",
  internship: "Stage",
  seasonal: "Saisonnier",
  other: "Autre",
};

function formatSalary(
  min: number | null,
  max: number | null,
  period: "hour" | "month" | "year" | null
): string | null {
  if (min === null) return null;
  const p = period === "hour" ? "/h" : period === "month" ? "/mois" : period === "year" ? "/an" : "";
  if (max && max !== min) return `${min}€ – ${max}€${p}`;
  return `${min}€${p}`;
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? "s" : ""}`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export default async function OffrePage({ params }: Props) {
  const { id } = await params;
  const offre = await getOffreById(id);

  if (!offre) notFound();

  const raw = offre.raw_offers;
  const salary = formatSalary(raw.salary_min, raw.salary_max, raw.salary_period);
  const contract = raw.contract_type ? CONTRACT_LABELS[raw.contract_type] : null;
  const salaryRaw = raw.salary_raw;

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          href="/offres"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          style={{ fontFamily: "var(--font-label)" }}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux offres
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  {contract && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2 block"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      {contract}
                    </span>
                  )}
                  <h1
                    className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight text-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {raw.title}
                  </h1>
                  {raw.company_name && (
                    <p
                      className="text-base text-muted-foreground mt-1"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      {raw.company_name}
                    </p>
                  )}
                </div>
                <TrustBadge score={offre.trust_score} />
              </div>

              {/* Meta pills */}
              <div
                className="flex flex-wrap gap-2 mt-4"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {raw.location_city && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 text-muted-foreground">
                    <MapPin size={12} />
                    {raw.location_city}
                    {raw.location_postal && ` (${raw.location_postal})`}
                  </span>
                )}
                {salary && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 text-muted-foreground">
                    <Banknote size={12} />
                    {salary}
                  </span>
                )}
                {salaryRaw && !salary && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 text-muted-foreground">
                    <Banknote size={12} />
                    {salaryRaw}
                  </span>
                )}
                {raw.posted_at && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 text-muted-foreground">
                    <CalendarDays size={12} />
                    {relativeTime(raw.posted_at)}
                  </span>
                )}
                {raw.source && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 text-muted-foreground uppercase tracking-wide">
                    <Clock size={12} />
                    {raw.source}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {raw.description && (
              <div className="border-t border-border pt-6">
                <h2
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  Description du poste
                </h2>
                <div
                  className="text-sm text-foreground leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {raw.description}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — sticky CTA */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6 space-y-5 lg:sticky lg:top-28">
              {/* Trust score detail */}
              {offre.trust_score !== null && (
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    Trust Score
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-3xl font-black tracking-tighter ${
                        offre.trust_score >= 70
                          ? "text-green-600"
                          : offre.trust_score >= 40
                            ? "text-yellow-600"
                            : "text-destructive"
                      }`}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {offre.trust_score}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            offre.trust_score >= 70
                              ? "bg-green-500"
                              : offre.trust_score >= 40
                                ? "bg-yellow-500"
                                : "bg-destructive"
                          }`}
                          style={{ width: `${offre.trust_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trust reasons */}
                  {offre.trust_reasons?.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {offre.trust_reasons.slice(0, 4).map((r, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-1.5"
                          style={{ fontFamily: "var(--font-label)" }}
                        >
                          {r.severity === "positive" ? (
                            <CheckCircle size={12} className="text-green-600 shrink-0 mt-0.5" />
                          ) : r.severity === "warning" ? (
                            <AlertTriangle size={12} className="text-yellow-600 shrink-0 mt-0.5" />
                          ) : r.severity === "critical" ? (
                            <XCircle size={12} className="text-destructive shrink-0 mt-0.5" />
                          ) : (
                            <Minus size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          {r.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Company info */}
              {raw.company_name && (
                <div className="border-t border-border pt-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    Entreprise
                  </p>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-muted-foreground shrink-0" />
                    <span
                      className="text-sm text-foreground font-medium"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      {raw.company_name}
                    </span>
                  </div>
                  {offre.company_verified && (
                    <p
                      className="inline-flex items-center gap-1 text-xs text-green-600 mt-1"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      <BadgeCheck size={12} />
                      Entreprise vérifiée SIRENE
                    </p>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="border-t border-border pt-4">
                <PostulerButton
                  offreId={offre.id}
                  externalUrl={raw.url}
                  className="w-full"
                />
                <p
                  className="text-[10px] text-muted-foreground text-center mt-3"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  Connexion requise pour postuler
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
