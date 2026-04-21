"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { Loader2, Save, Upload, Check, Download, Trash2 } from "lucide-react";
import type { ProfileRow } from "@/types/database";

type Tab = "profil" | "infos";

const LEVELS = [
  { value: "lycee", label: "Lycée" },
  { value: "bts", label: "BTS / BUT" },
  { value: "licence", label: "Licence" },
  { value: "master", label: "Master" },
  { value: "ecole_inge", label: "École d'ingénieur" },
  { value: "ecole_commerce", label: "École de commerce" },
  { value: "autre", label: "Autre" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ProfilPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("profil");
  const [profile, setProfile] = useState<Partial<ProfileRow>>({});
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingInfos, setSavingInfos] = useState(false);
  const [parsingCV, setParsingCV] = useState(false);

  // Infos tab state
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserEmail(session.user.email ?? "");
      setNewEmail(session.user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setNewPhone(data.phone ?? "");
      } else {
        // Profil pas encore créé — on upsert un squelette
        await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email!,
        });
      }
      setLoading(false);
    })();
  }, [supabase]);

  function set(k: keyof ProfileRow, v: unknown) {
    setProfile((p) => ({ ...p, [k]: v }));
  }

  // ── Sauvegarder le profil ─────────────────────────────────────────────────
  async function saveProfil() {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email!,
      first_name: profile.first_name ?? null,
      last_name: profile.last_name ?? null,
      level: profile.level ?? null,
      field: profile.field ?? null,
      cv_text: profile.cv_text ?? null,
      cover_letter_template: profile.cover_letter_template ?? null,
    });

    setSaving(false);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else toast.success("Profil sauvegardé ✓");
  }

  // ── Upload CV ─────────────────────────────────────────────────────────────
  async function handleCVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Format PDF requis");
      return;
    }
    setParsingCV(true);
    const formData = new FormData();
    formData.append("cv", file);
    try {
      const res = await fetch("/api/user/parse-cv", { method: "POST", body: formData });
      const json = await res.json();
      if (json.text) {
        set("cv_text", json.text);
        toast.success("CV importé avec succès");
      }
    } catch {
      toast.error("Erreur lors de la lecture du CV");
    }
    setParsingCV(false);
  }

  // ── Sauvegarder les infos ─────────────────────────────────────────────────
  async function saveInfos() {
    setSavingInfos(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const updates: Record<string, string> = {};
    if (newEmail && newEmail !== userEmail) updates.email = newEmail;
    if (newPassword.length >= 6) updates.password = newPassword;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        toast.error("Erreur : " + error.message);
        setSavingInfos(false);
        return;
      }
      if (updates.email) setUserEmail(newEmail);
    }

    // Phone in profiles table
    await supabase
      .from("profiles")
      .update({ phone: newPhone || null })
      .eq("id", session.user.id);

    setNewPassword("");
    setSavingInfos(false);
    toast.success("Informations mises à jour ✓");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-black uppercase tracking-tighter text-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Mon profil
        </h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "var(--font-label)" }}>
          {userEmail}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        {(["profil", "infos"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "var(--font-label)" }}
          >
            {t === "profil" ? "Profil" : "Mes informations"}
          </button>
        ))}
      </div>

      {/* ── Onglet Profil ─────────────────────────────────────────────────── */}
      {tab === "profil" && (
        <div className="space-y-6">
          {/* Identité */}
          <div className="bg-card border border-border p-6 space-y-5">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest text-accent"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Identité
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom">
                <input
                  className="form-input"
                  value={profile.first_name ?? ""}
                  onChange={(e) => set("first_name", e.target.value)}
                  placeholder="Marie"
                />
              </Field>
              <Field label="Nom">
                <input
                  className="form-input"
                  value={profile.last_name ?? ""}
                  onChange={(e) => set("last_name", e.target.value)}
                  placeholder="Dupont"
                />
              </Field>
            </div>
            <Field label="Niveau d'études">
              <select
                className="form-input"
                value={profile.level ?? ""}
                onChange={(e) => set("level", e.target.value)}
              >
                <option value="">Choisir…</option>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Filière / Domaine">
              <input
                className="form-input"
                value={profile.field ?? ""}
                onChange={(e) => set("field", e.target.value)}
                placeholder="Informatique, Commerce, Droit…"
              />
            </Field>
          </div>

          {/* CV */}
          <div className="bg-card border border-border p-6 space-y-4">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest text-accent"
              style={{ fontFamily: "var(--font-label)" }}
            >
              CV
            </h2>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
              Importe ton CV pour améliorer le matching et générer des lettres de motivation personnalisées.
            </p>

            <label
              className={`flex items-center gap-3 border-2 border-dashed p-4 cursor-pointer transition-colors ${
                profile.cv_text
                  ? "border-accent/40 bg-accent/5"
                  : "border-border hover:border-border/60"
              }`}
            >
              {parsingCV ? (
                <Loader2 size={18} className="animate-spin text-muted-foreground shrink-0" />
              ) : profile.cv_text ? (
                <Check size={18} className="text-accent shrink-0" />
              ) : (
                <Upload size={18} className="text-muted-foreground shrink-0" />
              )}
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
                {parsingCV
                  ? "Analyse en cours…"
                  : profile.cv_text
                    ? "CV importé — clique pour remplacer"
                    : "Importer un CV (PDF)"}
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleCVUpload}
                disabled={parsingCV}
              />
            </label>

            {profile.cv_text && (
              <div className="bg-muted p-3 max-h-32 overflow-y-auto">
                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed line-clamp-6">
                  {profile.cv_text}
                </p>
              </div>
            )}
          </div>

          {/* Lettre de motivation */}
          <div className="bg-card border border-border p-6 space-y-4">
            <div>
              <h2
                className="text-[10px] font-bold uppercase tracking-widest text-accent"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Lettre de motivation
              </h2>
              <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "var(--font-label)" }}>
                Écris une lettre de base réutilisable. Elle sera adaptée automatiquement à chaque offre lors de tes candidatures.
              </p>
            </div>
            <textarea
              className="form-input min-h-[200px] resize-y text-sm leading-relaxed"
              value={profile.cover_letter_template ?? ""}
              onChange={(e) => set("cover_letter_template", e.target.value)}
              placeholder={`Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de [intitulé]...\n\nCordialement,\n${profile.first_name ?? "Prénom"} ${profile.last_name ?? "Nom"}`}
              style={{ fontFamily: "var(--font-label)" }}
            />
            <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
              {profile.cover_letter_template?.length ?? 0} / 3000 caractères
            </p>
          </div>

          <button
            onClick={saveProfil}
            disabled={saving}
            className="w-full py-3.5 bg-accent text-accent-foreground font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin" /> Sauvegarde…</>
            ) : (
              <><Save size={15} /> Sauvegarder le profil</>
            )}
          </button>
        </div>
      )}

      {/* ── Onglet Infos ──────────────────────────────────────────────────── */}
      {tab === "infos" && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 space-y-5">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest text-accent"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Coordonnées
            </h2>

            <Field label="Adresse email" hint="Un lien de confirmation sera envoyé à la nouvelle adresse.">
              <input
                className="form-input"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="toi@exemple.fr"
                autoComplete="email"
              />
            </Field>

            <Field label="Numéro de téléphone">
              <input
                className="form-input"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                autoComplete="tel"
              />
            </Field>
          </div>

          <div className="bg-card border border-border p-6 space-y-5">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest text-accent"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Changer le mot de passe
            </h2>
            <Field label="Nouveau mot de passe" hint="6 caractères minimum. Laisse vide pour ne pas changer.">
              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
          </div>

          <button
            onClick={saveInfos}
            disabled={savingInfos}
            className="w-full py-3.5 bg-accent text-accent-foreground font-black text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {savingInfos ? (
              <><Loader2 size={15} className="animate-spin" /> Sauvegarde…</>
            ) : (
              <><Save size={15} /> Mettre à jour</>
            )}
          </button>

          {/* RGPD */}
          <div className="border-t border-border pt-6 space-y-3">
            <p
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Données personnelles
            </p>
            <a
              href="/api/user/export"
              download="monbaito-mes-donnees.json"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-label)" }}
            >
              <Download size={13} />
              Télécharger mes données (RGPD)
            </a>
            <button
              onClick={async () => {
                if (!confirm("Supprimer définitivement ton compte ? Cette action est irréversible.")) return;
                await fetch("/api/user/delete", { method: "DELETE" });
                window.location.href = "/";
              }}
              className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              style={{ fontFamily: "var(--font-label)" }}
            >
              <Trash2 size={13} />
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
