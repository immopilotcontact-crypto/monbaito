"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { Save, User, MapPin, GraduationCap, Sliders, Shield } from "lucide-react";
import type { ProfileRow } from "@/types/database";

const LEVELS = [
  { value: "lycee", label: "Lycée" },
  { value: "bts", label: "BTS / BUT" },
  { value: "licence", label: "Licence" },
  { value: "master", label: "Master" },
  { value: "ecole_inge", label: "École d'ingénieur" },
  { value: "ecole_commerce", label: "École de commerce" },
  { value: "autre", label: "Autre" },
];

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon size={14} className="text-accent" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export default function ProfilPage() {
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

  function set(k: keyof ProfileRow, v: unknown) {
    setProfile((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        level: profile.level,
        field: profile.field,
        city: profile.city,
        postal_code: profile.postal_code,
        mobility_km: profile.mobility_km,
        min_hourly_rate: profile.min_hourly_rate,
      })
      .eq("id", profile.id!);
    setSaving(false);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else toast.success("Profil mis à jour ✓");
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-card rounded-2xl animate-pulse border border-border/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Mon profil</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{profile.email}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
          profile.tier === "pro"
            ? "border-accent/30 bg-accent/10 text-accent"
            : "border-border/50 bg-card text-muted-foreground"
        }`}>
          {profile.tier === "pro" ? "Pro ✦" : "Free"}
        </span>
      </div>

      <div className="space-y-4">
        {/* Identité */}
        <Section icon={User} title="Identité">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom">
              <input className="form-input" value={profile.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} placeholder="Emma" />
            </Field>
            <Field label="Nom">
              <input className="form-input" value={profile.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} placeholder="Martin" />
            </Field>
          </div>
        </Section>

        {/* Études */}
        <Section icon={GraduationCap} title="Formation">
          <div className="space-y-4">
            <Field label="Niveau">
              <select className="form-input" value={profile.level ?? ""} onChange={(e) => set("level", e.target.value)}>
                <option value="">Choisir…</option>
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </Field>
            <Field label="Filière">
              <input className="form-input" value={profile.field ?? ""} onChange={(e) => set("field", e.target.value)} placeholder="Droit, Info, Gestion…" />
            </Field>
          </div>
        </Section>

        {/* Localisation */}
        <Section icon={MapPin} title="Localisation">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ville">
                <input className="form-input" value={profile.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="Rouen" />
              </Field>
              <Field label="Code postal">
                <input className="form-input" value={profile.postal_code ?? ""} onChange={(e) => set("postal_code", e.target.value)} placeholder="76000" />
              </Field>
            </div>
            <Field label={`Rayon de mobilité : ${profile.mobility_km ?? 30} km`}>
              <input
                type="range" min={5} max={100} step={5}
                value={profile.mobility_km ?? 30}
                onChange={(e) => set("mobility_km", Number(e.target.value))}
                className="w-full accent-accent mt-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5 km</span><span>100 km</span>
              </div>
            </Field>
          </div>
        </Section>

        {/* Préférences */}
        <Section icon={Sliders} title="Préférences salariales">
          <Field label={`Salaire minimum : ${Number(profile.min_hourly_rate ?? 11.88).toFixed(2)}€/h`}>
            <input
              type="range" min={11.88} max={25} step={0.5}
              value={profile.min_hourly_rate ?? 11.88}
              onChange={(e) => set("min_hourly_rate", Number(e.target.value))}
              className="w-full accent-accent mt-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>SMIC 11,88€</span><span>25€/h</span>
            </div>
          </Field>
        </Section>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          className="btn-cta w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {saving ? "Sauvegarde…" : "Sauvegarder le profil"}
        </button>

        {/* RGPD */}
        <Section icon={Shield} title="Données personnelles">
          <div className="space-y-3">
            <a
              href="/api/user/export"
              download="monbaito-mes-donnees.json"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ↓ Télécharger mes données (RGPD)
            </a>
            <button
              onClick={async () => {
                if (!confirm("Supprimer définitivement ton compte ? Cette action est irréversible.")) return;
                await fetch("/api/user/delete", { method: "DELETE" });
                window.location.href = "/";
              }}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              ✕ Supprimer mon compte
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
