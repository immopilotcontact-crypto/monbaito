"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PRO_FEATURES = [
  "Candidatures illimitées",
  "Fiche entreprise complète avec tous les feedbacks",
  "Alertes email sur nouvelles offres (match > 80%)",
  "Préparation d'entretien par IA",
  "Export CV optimisé pour chaque offre",
];

export default function BillingPage() {
  const supabase = createClient();
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<"monthly" | "yearly" | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("profiles").select("tier").eq("id", session.user.id).single();
      if (data) setTier(data.tier as "free" | "pro");
      setLoading(false);
    })();
  }, [supabase]);

  async function startCheckout(plan: "monthly" | "yearly") {
    setCheckoutLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else setCheckoutLoading(null);
  }

  if (loading) return <div className="max-w-xl mx-auto px-4 py-8"><div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} />
        Paramètres
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">Abonnement</h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-8">
        Actuellement sur le plan <span className="text-white font-medium capitalize">{tier}</span>
      </p>

      {tier === "pro" ? (
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-2xl p-6 text-center">
          <CheckCircle2 size={32} className="text-[var(--accent)] mx-auto mb-3" />
          <h2 className="font-bold text-white text-lg">Tu es sur MonBaito Pro</h2>
          <p className="text-[var(--muted-foreground)] text-sm mt-2">
            Toutes les fonctionnalités sont débloquées.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Features */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-2">
            <h2 className="font-semibold text-white mb-4">Ce que tu obtiens avec Pro</h2>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--muted-foreground)]">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-2 gap-3">
            <PlanCard
              label="Mensuel"
              price="4,99 €"
              period="/mois"
              loading={checkoutLoading === "monthly"}
              onClick={() => startCheckout("monthly")}
            />
            <PlanCard
              label="Annuel"
              price="39 €"
              period="/an"
              badge="−35%"
              loading={checkoutLoading === "yearly"}
              onClick={() => startCheckout("yearly")}
            />
          </div>

          <p className="text-center text-xs text-white/30">
            Paiement sécurisé via Stripe · Résiliation à tout moment
          </p>
        </div>
      )}
    </div>
  );
}

function PlanCard({ label, price, period, badge, loading, onClick }: {
  label: string; price: string; period: string;
  badge?: string; loading: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="relative flex flex-col items-center gap-2 p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[var(--accent)]/50 rounded-2xl transition-all disabled:opacity-50"
    >
      {badge && (
        <span className="absolute -top-2 right-3 bg-[var(--accent)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-2xl font-bold text-white">{price}</span>
      <span className="text-xs text-white/30">{period}</span>
      <span className="mt-1 text-sm font-medium text-[var(--accent)]">
        {loading ? "Chargement…" : "Choisir →"}
      </span>
    </button>
  );
}
