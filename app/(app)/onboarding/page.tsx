"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { Loader2, Check, FileText } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Step1 { firstName: string; lastName: string; level: string; field: string }
interface Step2 { city: string; postalCode: string; lat: number | null; lng: number | null; mobilityKm: number }
interface Step3 { contractTypes: string[]; minHourlyRate: number; availability: Record<string, boolean> }
interface Step4 { redFlags: string[]; customRedFlag: string; cvText: string }
interface CityResult { label: string; city: string; postalCode: string; lat: number; lng: number }

const LEVELS = [
  { value: "lycee", label: "Lycée" },
  { value: "bts", label: "BTS / BUT" },
  { value: "licence", label: "Licence" },
  { value: "master", label: "Master" },
  { value: "ecole_inge", label: "École d'ingénieur" },
  { value: "ecole_commerce", label: "École de commerce" },
  { value: "autre", label: "Autre" },
];

const CONTRACT_TYPES = [
  { value: "student_job", label: "Job étudiant" },
  { value: "alternance", label: "Alternance" },
  { value: "internship", label: "Stage" },
  { value: "seasonal", label: "Saisonnier" },
];

const DAYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
const SLOTS = ["matin", "aprem", "soir"];

const RED_FLAGS_OPTIONS = [
  { value: "porte_a_porte", label: "Pas de porte-à-porte" },
  { value: "mlm", label: "Pas de vente en réseau (MLM)" },
  { value: "commission_only", label: "Pas de commission uniquement" },
  { value: "stage_non_remunere", label: "Pas de stage non rémunéré" },
  { value: "frais_candidat", label: "Pas de frais à avancer" },
  { value: "teletravail_force", label: "Pas de télétravail imposé" },
];

const STEP_LABELS = ["Identité", "Localisation", "Préférences", "Red flags"];

// ── Composants UI ────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
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
        {required && <span className="text-accent ml-1">*</span>}
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

function ToggleChip({
  checked,
  onClick,
  children,
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 text-sm border transition-all text-left w-full ${
        checked
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
      }`}
      style={{ fontFamily: "var(--font-label)" }}
    >
      <span
        className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
          checked ? "border-accent bg-accent" : "border-border"
        }`}
      >
        {checked && <Check size={10} strokeWidth={3} className="text-accent-foreground" />}
      </span>
      {children}
    </button>
  );
}

// ── Étape 1 — Identité ───────────────────────────────────────────────────────
function Step1Form({ data, onChange }: { data: Step1; onChange: (d: Partial<Step1>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prénom" required>
          <input
            className="form-input"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="Marie"
            autoFocus
          />
        </Field>
        <Field label="Nom">
          <input
            className="form-input"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Dupont"
          />
        </Field>
      </div>
      <Field label="Niveau d'études" required>
        <select
          className="form-input"
          value={data.level}
          onChange={(e) => onChange({ level: e.target.value })}
        >
          <option value="">Choisir…</option>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Filière / Domaine" hint="Ex. Informatique, Commerce, Droit…">
        <input
          className="form-input"
          value={data.field}
          onChange={(e) => onChange({ field: e.target.value })}
          placeholder="Informatique"
        />
      </Field>
    </div>
  );
}

// ── Étape 2 — Localisation ───────────────────────────────────────────────────
function Step2Form({ data, onChange }: { data: Step2; onChange: (d: Partial<Step2>) => void }) {
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [query, setQuery] = useState(data.city);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(q: string) {
    setQuery(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 2) { setSuggestions([]); return; }
    debounce.current = setTimeout(async () => {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&type=municipality&limit=5&autocomplete=1`
      );
      const json = await res.json();
      setSuggestions(
        (json.features ?? []).map((f: any) => ({
          label: `${f.properties.city} (${f.properties.postcode})`,
          city: f.properties.city,
          postalCode: f.properties.postcode,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }))
      );
    }, 300);
  }

  function selectCity(c: CityResult) {
    setQuery(c.label);
    setSuggestions([]);
    onChange({ city: c.city, postalCode: c.postalCode, lat: c.lat, lng: c.lng });
  }

  return (
    <div className="space-y-6">
      <Field label="Ville actuelle" required>
        <div className="relative">
          <input
            className="form-input"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Paris, Lyon, Rouen…"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-card border border-border shadow-xl overflow-hidden">
              {suggestions.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => selectCity(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>

      <Field label={`Rayon de mobilité — ${data.mobilityKm} km`}>
        <input
          type="range"
          min={5}
          max={100}
          step={5}
          value={data.mobilityKm}
          onChange={(e) => onChange({ mobilityKm: Number(e.target.value) })}
          className="w-full accent-accent"
        />
        <div
          className="flex justify-between text-[10px] text-muted-foreground mt-1"
          style={{ fontFamily: "var(--font-label)" }}
        >
          <span>5 km</span>
          <span>50 km</span>
          <span>100 km</span>
        </div>
      </Field>
    </div>
  );
}

// ── Étape 3 — Préférences ────────────────────────────────────────────────────
function Step3Form({ data, onChange }: { data: Step3; onChange: (d: Partial<Step3>) => void }) {
  function toggleContract(v: string) {
    const cur = data.contractTypes;
    onChange({ contractTypes: cur.includes(v) ? cur.filter((c) => c !== v) : [...cur, v] });
  }

  function toggleSlot(day: string, slot: string) {
    const key = `${day}_${slot}`;
    onChange({ availability: { ...data.availability, [key]: !data.availability[key] } });
  }

  return (
    <div className="space-y-6">
      <Field label="Type de contrat recherché" required>
        <div className="grid grid-cols-2 gap-2">
          {CONTRACT_TYPES.map((c) => (
            <ToggleChip
              key={c.value}
              checked={data.contractTypes.includes(c.value)}
              onClick={() => toggleContract(c.value)}
            >
              {c.label}
            </ToggleChip>
          ))}
        </div>
      </Field>

      <Field label={`Taux horaire minimum — ${data.minHourlyRate.toFixed(2)} €/h`}>
        <input
          type="range"
          min={11.88}
          max={25}
          step={0.5}
          value={data.minHourlyRate}
          onChange={(e) => onChange({ minHourlyRate: Number(e.target.value) })}
          className="w-full accent-accent"
        />
        <div
          className="flex justify-between text-[10px] text-muted-foreground mt-1"
          style={{ fontFamily: "var(--font-label)" }}
        >
          <span>SMIC (11,88 €)</span>
          <span>25 €/h</span>
        </div>
      </Field>

      <Field label="Disponibilités" hint="Clique sur les créneaux où tu es disponible">
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="w-14" />
                {DAYS.map((d) => (
                  <th
                    key={d}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pb-2 px-1"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot}>
                  <td
                    className="text-[10px] uppercase tracking-widest text-muted-foreground pr-2 py-1"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    {slot}
                  </td>
                  {DAYS.map((day) => {
                    const key = `${day}_${slot}`;
                    const active = data.availability[key];
                    return (
                      <td key={key} className="px-1 py-1">
                        <button
                          type="button"
                          onClick={() => toggleSlot(day, slot)}
                          className={`w-8 h-8 transition-colors ${
                            active ? "bg-accent" : "bg-muted hover:bg-muted/80"
                          }`}
                          aria-label={`${day} ${slot}`}
                          aria-pressed={active}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Field>
    </div>
  );
}

// ── Étape 4 — Red flags ──────────────────────────────────────────────────────
function Step4Form({ data, onChange }: { data: Step4; onChange: (d: Partial<Step4>) => void }) {
  const [parsingCV, setParsingCV] = useState(false);

  function toggleFlag(v: string) {
    const cur = data.redFlags;
    onChange({ redFlags: cur.includes(v) ? cur.filter((f) => f !== v) : [...cur, v] });
  }

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
        onChange({ cvText: json.text });
        toast.success("CV analysé avec succès");
      }
    } catch {
      toast.error("Erreur lors de la lecture du CV");
    }
    setParsingCV(false);
  }

  return (
    <div className="space-y-5">
      <Field label="Red flags personnels" hint="Sélectionne tout ce que tu veux éviter — l'IA filtrera ces offres automatiquement">
        <div className="space-y-2 mt-1">
          {RED_FLAGS_OPTIONS.map((f) => (
            <ToggleChip
              key={f.value}
              checked={data.redFlags.includes(f.value)}
              onClick={() => toggleFlag(f.value)}
            >
              {f.label}
            </ToggleChip>
          ))}
        </div>
      </Field>

      <Field label="Red flag personnalisé (optionnel)">
        <input
          className="form-input"
          value={data.customRedFlag}
          maxLength={200}
          onChange={(e) => onChange({ customRedFlag: e.target.value })}
          placeholder="ex. pas de travail le dimanche…"
        />
      </Field>

      <Field label="CV (optionnel)" hint="Améliore le matching — PDF uniquement">
        <label
          className={`flex flex-col items-center gap-2 border-2 border-dashed p-6 cursor-pointer transition-colors mt-1 ${
            data.cvText
              ? "border-accent/50 bg-accent/5"
              : "border-border hover:border-border/60"
          }`}
        >
          {data.cvText ? <Check size={24} className="text-accent" /> : <FileText size={24} className="text-muted-foreground" />}
          <span
            className="text-sm text-muted-foreground text-center"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {parsingCV
              ? "Analyse en cours…"
              : data.cvText
                ? "CV importé avec succès"
                : "Glisse ton CV ici ou clique (PDF)"}
          </span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleCVUpload}
            disabled={parsingCV}
          />
        </label>
      </Field>
    </div>
  );
}

// ── Wizard principal ─────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [s1, setS1] = useState<Step1>({ firstName: "", lastName: "", level: "", field: "" });
  const [s2, setS2] = useState<Step2>({ city: "", postalCode: "", lat: null, lng: null, mobilityKm: 30 });
  const [s3, setS3] = useState<Step3>({ contractTypes: ["student_job"], minHourlyRate: 11.88, availability: {} });
  const [s4, setS4] = useState<Step4>({ redFlags: [], customRedFlag: "", cvText: "" });

  function validateStep(): boolean {
    if (step === 1 && (!s1.firstName.trim() || !s1.level)) {
      toast.error("Prénom et niveau d'études requis");
      return false;
    }
    if (step === 2 && !s2.city) {
      toast.error("Ville requise");
      return false;
    }
    if (step === 3 && s3.contractTypes.length === 0) {
      toast.error("Choisis au moins un type de contrat");
      return false;
    }
    return true;
  }

  function next() {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    if (!validateStep()) return;
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const allFlags = [
      ...s4.redFlags,
      ...(s4.customRedFlag.trim() ? [s4.customRedFlag.trim()] : []),
    ];

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email!,
      first_name: s1.firstName.trim(),
      last_name: s1.lastName.trim() || null,
      level: s1.level as any,
      field: s1.field.trim() || null,
      city: s2.city,
      postal_code: s2.postalCode,
      mobility_km: s2.mobilityKm,
      looking_for: {
        student_job: s3.contractTypes.includes("student_job"),
        alternance: s3.contractTypes.includes("alternance"),
        internship: s3.contractTypes.includes("internship"),
        seasonal: s3.contractTypes.includes("seasonal"),
      },
      availability: s3.availability,
      min_hourly_rate: s3.minHourlyRate,
      red_flags: allFlags,
      cv_text: s4.cvText || null,
    });

    if (error) {
      toast.error("Erreur lors de la création du profil");
      setSubmitting(false);
      return;
    }

    if (s4.cvText) {
      await fetch("/api/user/embed-cv", { method: "POST" }).catch(() => {});
    }

    toast.success("Profil créé — bienvenue !");
    router.push("/dashboard");
  }

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src="/logo.png" alt="MonBaito" width={140} height={36} className="h-9 w-auto object-contain" />
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Étape {step} sur {STEP_LABELS.length}
            </span>
            <div className="flex gap-3">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
                    i + 1 === step
                      ? "text-accent"
                      : i + 1 < step
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                  }`}
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-muted overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progressPct === 0 ? 5 : progressPct}%` }}
            />
          </div>
        </div>

        {/* Step title */}
        <h1
          className="text-3xl font-black uppercase tracking-tighter text-foreground mb-6"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {STEP_LABELS[step - 1]}
        </h1>

        {/* Step content */}
        <div className="bg-card border border-border p-6 mb-6">
          {step === 1 && <Step1Form data={s1} onChange={(d) => setS1((p) => ({ ...p, ...d }))} />}
          {step === 2 && <Step2Form data={s2} onChange={(d) => setS2((p) => ({ ...p, ...d }))} />}
          {step === 3 && <Step3Form data={s3} onChange={(d) => setS3((p) => ({ ...p, ...d }))} />}
          {step === 4 && <Step4Form data={s4} onChange={(d) => setS4((p) => ({ ...p, ...d }))} />}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={prev}
              className="flex-1 py-3 border border-border text-foreground text-sm font-bold uppercase tracking-widest hover:bg-muted transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Retour
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={next}
              className="flex-1 py-3 bg-accent text-accent-foreground text-sm font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Continuer →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="flex-1 py-3 bg-accent text-accent-foreground text-sm font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Création…</>
              ) : (
                <><Check size={15} /> Créer mon profil</>
              )}
            </button>
          )}
        </div>

        {/* Step 4 — skip option */}
        {step === 4 && (
          <p
            className="text-center text-xs text-muted-foreground mt-4"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Tu pourras compléter ces infos plus tard dans ton profil.
          </p>
        )}
      </div>
    </div>
  );
}
