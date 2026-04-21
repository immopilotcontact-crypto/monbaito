"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import Link from "next/link";
import { CreditCard, Check } from "lucide-react";
import type { ProfileRow } from "@/types/database";

const CONTRACT_TYPES = [
  { value: "student_job", label: "Job étudiant" },
  { value: "alternance", label: "Alternance" },
  { value: "internship", label: "Stage" },
  { value: "seasonal", label: "Saisonnier" },
];

const RED_FLAGS_OPTIONS = [
  { value: "porte_a_porte", label: "Pas de porte-à-porte" },
  { value: "mlm", label: "Pas de vente en réseau (MLM)" },
  { value: "commission_only", label: "Pas de commission uniquement" },
  { value: "stage_non_remunere", label: "Pas de stage non rémunéré" },
  { value: "frais_candidat", label: "Pas de frais à avancer" },
  { value: "teletravail_force", label: "Pas de télétravail imposé" },
];

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Partial<ProfileRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    })();
  }, [supabase]);

  function toggleContract(v: string) {
    const cur = profile.looking_for ?? { student_job: false, alternance: false, internship: false, seasonal: false };
    setProfile((p) => ({ ...p, looking_for: { ...cur, [v]: !cur[v as keyof typeof cur] } }));
  }

  function toggleFlag(v: string) {
    const cur = profile.red_flags ?? [];
    setProfile((p) => ({ ...p, red_flags: cur.includes(v) ? cur.filter((f) => f !== v) : [...cur, v] }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ looking_for: profile.looking_for, red_flags: profile.red_flags })
      .eq("id", profile.id!);
    setSaving(false);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else toast.success("Préférences mises à jour");
  }

  if (loading) return <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
    {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />)}
  </div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Paramètres</h1>

      {/* Abonnement */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Abonnement</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              {profile.tier === "pro" ? "MonBaito Pro — actif" : "MonBaito Free — 5 candidatures/semaine"}
            </p>
          </div>
          <Link href="/settings/billing" className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <CreditCard size={14} />
            {profile.tier === "pro" ? "Gérer" : "Passer Pro"}
          </Link>
        </div>
      </section>

      {/* Contrats recherchés */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-white mb-4">Types de contrat recherchés</h2>
        <div className="grid grid-cols-2 gap-2">
          {CONTRACT_TYPES.map((c) => {
            const active = profile.looking_for?.[c.value as keyof typeof profile.looking_for] ?? false;
            return (
              <button key={c.value} onClick={() => toggleContract(c.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                  active ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white" : "border-white/10 text-[var(--muted-foreground)]"
                }`}>
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${active ? "border-[var(--accent)] bg-[var(--accent)]" : "border-white/30"}`}>
                  {active && <Check size={10} className="text-white" />}
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Red flags */}
      <section className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-white mb-4">Red flags (filtres d&apos;exclusion)</h2>
        <div className="space-y-2">
          {RED_FLAGS_OPTIONS.map((f) => {
            const active = profile.red_flags?.includes(f.value) ?? false;
            return (
              <button key={f.value} onClick={() => toggleFlag(f.value)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                  active ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white" : "border-white/10 text-[var(--muted-foreground)]"
                }`}>
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${active ? "border-[var(--accent)] bg-[var(--accent)]" : "border-white/30"}`}>
                  {active && <Check size={10} className="text-white" />}
                </span>
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="btn-cta w-full justify-center">
        {saving ? "Sauvegarde…" : "Sauvegarder les préférences"}
      </button>
    </div>
  );
}
