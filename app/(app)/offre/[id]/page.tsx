import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { TrustBadge } from "@/components/app/TrustBadge";
import { LetterEditor } from "@/components/app/LetterEditor";
import { ArrowLeft, ExternalLink, MapPin, Euro, Clock, Building2, CheckCircle, AlertTriangle, XCircle, Minus } from "lucide-react";
import Link from "next/link";
import type { TrustReason } from "@/types/database";

const SEVERITY_STYLES: Record<string, string> = {
  positive: "text-emerald-400 bg-emerald-400/10",
  neutral: "text-white/50 bg-white/5",
  warning: "text-amber-400 bg-amber-400/10",
  critical: "text-red-400 bg-red-400/10",
};

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "positive") return <CheckCircle size={14} className="shrink-0" />;
  if (severity === "warning") return <AlertTriangle size={14} className="shrink-0" />;
  if (severity === "critical") return <XCircle size={14} className="shrink-0" />;
  return <Minus size={14} className="shrink-0" />;
}

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  const { data: offer } = await supabase
    .from("enriched_offers")
    .select("*, raw_offers(*)")
    .eq("id", id)
    .single();

  if (!offer) notFound();

  const raw = (offer as any).raw_offers;

  // Feedback stats entreprise
  let companyStats = null;
  if (raw?.company_siren) {
    const { data } = await supabase
      .from("company_feedback_stats")
      .select("*")
      .eq("company_siren", raw.company_siren)
      .single();
    companyStats = data;
  }

  // Match de l'user connecté (si dispo)
  let matchId: string | undefined;
  if (session) {
    const { data: match } = await supabase
      .from("user_matches")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("offer_id", id)
      .single();
    matchId = match?.id;
  }

  const salary = raw?.salary_min
    ? `${raw.salary_min}€/${raw.salary_period === "hour" ? "h" : raw.salary_period === "month" ? "mois" : "an"}`
    : null;

  const trustReasons: TrustReason[] = (offer.trust_reasons as TrustReason[]) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Retour */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} />
        Retour aux offres
      </Link>

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{raw?.title}</h1>
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[var(--muted-foreground)]" />
              <span className="text-[var(--muted-foreground)]">{raw?.company_name ?? "Entreprise"}</span>
              {raw?.company_siren && (
                <Link href={`/entreprise/${raw.company_siren}`} className="text-xs text-[var(--accent)] hover:underline">
                  Voir la fiche
                </Link>
              )}
            </div>
          </div>
          {raw?.url && (
            <a href={raw.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-sm text-[var(--muted-foreground)]">
          {raw?.location_city && <span className="flex items-center gap-1"><MapPin size={13} />{raw.location_city}</span>}
          {salary && <span className="flex items-center gap-1"><Euro size={13} />{salary}</span>}
          {raw?.contract_type && <span className="flex items-center gap-1"><Clock size={13} />{raw.contract_type}</span>}
        </div>
      </div>

      {/* Trust Score */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Trust Score</h2>
          <TrustBadge score={offer.trust_score} size="lg" />
        </div>
        {trustReasons.length > 0 ? (
          <ul className="space-y-2.5">
            {trustReasons.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${SEVERITY_STYLES[r.severity]}`}>
                  <SeverityIcon severity={r.severity} />
                </span>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{r.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/30">Score en cours de calcul…</p>
        )}
      </section>

      {/* Feedback entreprise (si dispo) */}
      {companyStats && Number(companyStats.total_applications) > 0 && (
        <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">Ce que disent les étudiants</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Candidatures" value={String(companyStats.total_applications)} />
            <Stat label="Taux de réponse" value={companyStats.response_rate_pct ? `${companyStats.response_rate_pct}%` : "—"} />
            <Stat label="Délai moyen" value={companyStats.avg_response_days ? `${companyStats.avg_response_days}j` : "—"} />
            <Stat label="Note manager" value={companyStats.avg_manager_quality ? `${companyStats.avg_manager_quality}/5` : "—"} />
          </div>
          {Number(companyStats.scam_reports) > 0 && (
            <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={13} className="shrink-0" />
              {companyStats.scam_reports} signalement{Number(companyStats.scam_reports) > 1 ? "s" : ""} d&apos;arnaque pour cette entreprise
            </p>
          )}
        </section>
      )}

      {/* Description */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-white mb-3">Description du poste</h2>
        {raw?.description ? (
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">
            {raw.description.slice(0, 3000)}
            {raw.description.length > 3000 && "…"}
          </p>
        ) : (
          <p className="text-sm text-white/30">Pas de description disponible.</p>
        )}
      </section>

      {/* Lettre de motivation */}
      {session ? (
        <LetterEditor
          offerId={id}
          offerUrl={raw?.url ?? null}
          companyName={raw?.company_name ?? null}
          offerTitle={raw?.title ?? "ce poste"}
          matchId={matchId}
        />
      ) : (
        <Link href="/auth/login" className="btn-cta w-full justify-center text-base py-4">
          Connexion pour postuler
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</p>
    </div>
  );
}
