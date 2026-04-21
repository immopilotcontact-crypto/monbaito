import { createClient } from "@/lib/supabase-server";
import { TrustBadge } from "@/components/app/TrustBadge";
import { ArrowLeft, Building2, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function EntreprisePage({ params }: { params: Promise<{ siren: string }> }) {
  const { siren } = await params;
  const supabase = await createClient();

  // Stats agrégées
  const { data: stats } = await supabase
    .from("company_feedback_stats")
    .select("*")
    .eq("company_siren", siren)
    .single();

  // Offres actives
  const { data: offers } = await supabase
    .from("raw_offers")
    .select("id, title, location_city, salary_raw, contract_type, enriched_offers(id, trust_score)")
    .eq("company_siren", siren)
    .order("scraped_at", { ascending: false })
    .limit(20);

  const companyName = stats?.company_name ?? offers?.[0]?.title ?? "Entreprise";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={14} />
        Retour
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Building2 size={20} className="text-foreground/40" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
          <p className="text-[var(--muted-foreground)] text-sm">SIREN : {siren}</p>
        </div>
      </div>

      {/* Stats */}
      {stats && Number(stats.total_applications) > 0 && (
        <section className="bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-foreground mb-4">Retours étudiants MonBaito</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatBox label="Candidatures" value={String(stats.total_applications)} />
            <StatBox label="Taux de réponse" value={stats.response_rate_pct ? `${stats.response_rate_pct}%` : "—"} />
            <StatBox label="Délai moyen" value={stats.avg_response_days ? `${stats.avg_response_days}j` : "—"} />
            <StatBox label="Note manager" value={stats.avg_manager_quality ? `${Number(stats.avg_manager_quality).toFixed(1)}/5` : "—"} />
          </div>
          {stats.avg_actual_hourly_rate && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Salaire réel moyen constaté :{" "}
              <span className="text-foreground font-medium">{Number(stats.avg_actual_hourly_rate).toFixed(2)}€/h</span>
            </p>
          )}
          {Number(stats.scam_reports) > 0 && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={13} className="shrink-0" />
              {stats.scam_reports} signalement{Number(stats.scam_reports) > 1 ? "s" : ""} d&apos;arnaque
            </p>
          )}
        </section>
      )}

      {/* Offres actives */}
      <section>
        <h2 className="font-semibold text-foreground mb-4">
          Offres actives ({offers?.length ?? 0})
        </h2>
        {!offers?.length ? (
          <p className="text-[var(--muted-foreground)] text-sm">Aucune offre active.</p>
        ) : (
          <div className="space-y-3">
            {offers.map((o) => {
              const enriched = (o.enriched_offers as any)?.[0] ?? (o.enriched_offers as any);
              return (
                <Link
                  key={o.id}
                  href={`/offre/${enriched?.id ?? o.id}`}
                  className="flex items-center justify-between gap-3 bg-card hover:bg-muted border border-border rounded-xl p-4 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{o.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {o.location_city} · {o.salary_raw ?? "Salaire non précisé"} · {o.contract_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <TrustBadge score={enriched?.trust_score ?? null} size="sm" />
                    <ExternalLink size={12} className="text-foreground/20 group-hover:text-foreground/60" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-card rounded-xl p-3">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</p>
    </div>
  );
}
