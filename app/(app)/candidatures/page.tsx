"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Building2, Clock, CheckCircle2, XCircle, MessageSquare, HelpCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ApplicationRow } from "@/types/database";

type AppWithOffer = ApplicationRow & {
  enriched_offers: { id: string; raw_offers: { title: string; company_name: string | null; url: string | null } };
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  sent:      { label: "Envoyée",         color: "text-blue-600",    icon: Clock },
  replied:   { label: "Réponse reçue",   color: "text-emerald-600", icon: MessageSquare },
  interview: { label: "Entretien",       color: "text-purple-600",  icon: CheckCircle2 },
  hired:     { label: "Embauché !",      color: "text-emerald-600", icon: CheckCircle2 },
  rejected:  { label: "Refusée",         color: "text-red-600",     icon: XCircle },
  ghosted:   { label: "Pas de réponse",  color: "text-muted-foreground", icon: HelpCircle },
};

const STATUS_OPTIONS = ["sent", "replied", "interview", "hired", "rejected", "ghosted"];

export default function CandidaturesPage() {
  const supabase = createClient();
  const [apps, setApps] = useState<AppWithOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("applications")
        .select("*, enriched_offers(id, raw_offers(title, company_name, url))")
        .eq("user_id", session.user.id)
        .order("applied_at", { ascending: false });
      setApps((data as unknown as AppWithOffer[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  async function updateStatus(id: string, status: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: status as ApplicationRow["status"] } : a)));
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) toast.error("Erreur lors de la mise à jour");
  }

  function formatDate(d: string) {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(d));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-black uppercase tracking-tighter text-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Mes candidatures
        </h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "var(--font-label)" }}>
          {apps.length} candidature{apps.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4" style={{ fontFamily: "var(--font-label)" }}>
            Aucune candidature pour l&apos;instant.
          </p>
          <Link href="/dashboard" className="btn-cta inline-flex">Voir les offres</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const raw = app.enriched_offers.raw_offers;
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.sent;
            const Icon = cfg.icon;
            return (
              <div key={app.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-muted-foreground shrink-0" />
                      <span
                        className="text-sm text-muted-foreground truncate"
                        style={{ fontFamily: "var(--font-label)" }}
                      >
                        {raw.company_name ?? "Entreprise"}
                      </span>
                    </div>
                    <h3
                      className="font-bold text-foreground mt-0.5 truncate uppercase tracking-tight"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {raw.title}
                    </h3>
                    <p
                      className="text-xs text-muted-foreground/60 mt-1"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      Postulé le {formatDate(app.applied_at)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <Icon size={14} className={cfg.color} />
                    <span
                      className={`text-xs font-medium ${cfg.color}`}
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(app.id, s)}
                      className={`px-2.5 py-1 text-xs font-medium transition-colors border ${
                        app.status === s
                          ? "bg-accent/10 border-accent/30 text-accent"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
