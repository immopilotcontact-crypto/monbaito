"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
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

// ── Étape 1 ────────────────────────────────────────────────────────────────
function Step1Form({ data, onChange }: { data: Step1; onChange: (d: Partial<Step1>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prénom" required>
          <input className="form-input" value={data.firstName} onChange={(e) => onChange({ firstName: e.target.value })} placeholder="Marie" />
        </Field>
        <Field label="Nom">
          <input className="form-input" value={data.lastName} onChange={(e) => onChange({ lastName: e.target.value })} placeholder="Dupont" />
        </Field>
      </div>
      <Field label="Niveau d'études" required>
        <select className="form-input" value={data.level} onChange={(e) => onChange({ level: e.target.value })}>
          <option value="">Choisir…</option>
          {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </Field>
      <Field label="Filière / Domaine">
        <input className="form-input" value={data.field} onChange={(e) => onChange({ field: e.target.value })} placeholder="ex. Informatique, Commerce…" />
      </Field>
    </div>
  );
}

// ── Étape 2 ────────────────────────────────────────────────────────────────
function Step2Form({ data, onChange }: { data: Step2; onChange: (d: Partial<Step2>) => void }) {
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [query, setQuery] = useState(data.city);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(q: string) {
    setQuery(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 2) { setSuggestions([]); return; }
    debounce.current = setTimeout(async () => {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&type=municipality&limit=5&autocomplete=1`);
      const data = await res.json();
      setSuggestions((data.features ?? []).map((f: any) => ({
        label: `${f.properties.city} (${f.properties.postcode})`,
        city: f.properties.city,
        postalCode: f.properties.postcode,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      })));
    }, 300);
  }

  function selectCity(c: CityResult) {
    setQuery(c.label);
    setSuggestions([]);
    onChange({ city: c.city, postalCode: c.postalCode, lat: c.lat, lng: c.lng });
  }

  return (
    <div className="space-y-5">
      <Field label="Ville actuelle" required>
        <div className="relative">
          <input className="form-input" value={query} onChange={(e) => handleQueryChange(e.target.value)} placeholder="Paris, Lyon…" autoComplete="off" />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl">
              {suggestions.map((s) => (
                <li key={s.label}>
                  <button type="button" onClick={() => selectCity(s)} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors">
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>
      <Field label={`Rayon de mobilité : ${data.mobilityKm} km`}>
        <input type="range" min={5} max={100} step={5} value={data.mobilityKm} onChange={(e) => onChange({ mobilityKm: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>5 km</span><span>50 km</span><span>100 km</span>
        </div>
      </Field>
    </div>
  );
}

// ── Étape 3 ────────────────────────────────────────────────────────────────
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
    <div className="space-y-5">
      <Field label="Type de contrat recherché" required>
        <div className="grid grid-cols-2 gap-2">
          {CONTRACT_TYPES.map((c) => (
            <CheckButton key={c.value} checked={data.contractTypes.includes(c.value)} onClick={() => toggleContract(c.value)}>
              {c.label}
            </CheckButton>
          ))}
        </div>
      </Field>
      <Field label={`Salaire horaire minimum : ${data.minHourlyRate.toFixed(2)}€/h`}>
        <input type="range" min={11.88} max={25} step={0.5} value={data.minHourlyRate} onChange={(e) => onChange({ minHourlyRate: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>SMIC (11,88€)</span><span>25€/h</span>
        </div>
      </Field>
      <Field label="Disponibilités">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-white/30 font-normal pb-2 pr-2 w-12"></th>
                {DAYS.map((d) => <th key={d} className="text-white/50 font-medium pb-2 px-1 capitalize">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot}>
                  <td className="text-white/30 pr-2 py-1 capitalize">{slot}</td>
                  {DAYS.map((day) => {
                    const key = `${day}_${slot}`;
                    const active = data.availability[key];
                    return (
                      <td key={key} className="px-1 py-1">
                        <button type="button" onClick={() => toggleSlot(day, slot)}
                          className={`w-8 h-8 rounded-lg transition-colors ${active ? "bg-[var(--accent)]/80" : "bg-white/5 hover:bg-white/10"}`}
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

// ── Étape 4 ────────────────────────────────────────────────────────────────
function Step4Form({ data, onChange }: { data: Step4; onChange: (d: Partial<Step4>) => void }) {
  const [parsingCV, setParsingCV] = useState(false);

  function toggleFlag(v: string) {
    const cur = data.redFlags;
    onChange({ redFlags: cur.includes(v) ? cur.filter((f) => f !== v) : [...cur, v] });
  }

  async function handleCVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") { toast.error("Format PDF requis"); return; }
    setParsingCV(true);
    const formData = new FormData();
    formData.append("cv", file);
    try {
      const res = await fetch("/api/user/parse-cv", { method: "POST", body: formData });
      const json = await res.json();
      if (json.text) { onChange({ cvText: json.text }); toast.success("CV analysé avec succès"); }
    } catch { toast.error("Erreur lors de la lecture du CV"); }
    setParsingCV(false);
  }

  return (
    <div className="space-y-5">
      <Field label="Red flags personnels">
        <div className="space-y-2">
          {RED_FLAGS_OPTIONS.map((f) => (
            <CheckButton key={f.value} checked={data.redFlags.includes(f.value)} onClick={() => toggleFlag(f.value)}>
              {f.label}
            </CheckButton>
          ))}
        </div>
      </Field>
      <Field label="Autres red flags (optionnel)">
        <input className="form-input" value={data.customRedFlag} maxLength={200} onChange={(e) => onChange({ customRedFlag: e.target.value })} placeholder="ex. pas de travail le dimanche…" />
      </Field>
      <Field label="CV (optionnel — améliore le matching)">
        <label className={`flex flex-col items-center gap-2 border-2 border-dashed border-white/10 rounded-xl p-6 cursor-pointer hover:border-white/20 transition-colors ${data.cvText ? "border-[var(--accent)]/50 bg-[var(--accent)]/5" : ""}`}>
          <span className="text-3xl">{data.cvText ? "✅" : "📄"}</span>
          <span className="text-sm text-white/60">
            {parsingCV ? "Analyse en cours…" : data.cvText ? "CV importé" : "Glisse ton CV ici ou clique pour importer (PDF)"}
          </span>
          <input type="file" accept=".pdf" className="hidden" onChange={handleCVUpload} disabled={parsingCV} />
        </label>
      </Field>
    </div>
  );
}

// ── Composants UI ──────────────────────────────────────────────────────────
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">
        {label}{required && <span className="text-[var(--accent)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckButton({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
        checked ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white" : "border-white/10 text-[var(--muted-foreground)] hover:border-white/20"
      }`}
    >
      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "border-[var(--accent)] bg-[var(--accent)]" : "border-white/30"}`}>
        {checked && <span className="text-[10px] text-white">✓</span>}
      </span>
      {children}
    </button>
  );
}

// ── Wizard principal ───────────────────────────────────────────────────────
const STEP_LABELS = ["Identité", "Localisation", "Préférences", "Red flags"];

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
    if (step === 1 && (!s1.firstName.trim() || !s1.level)) { toast.error("Prénom et niveau requis"); return false; }
    if (step === 2 && !s2.city) { toast.error("Ville requise"); return false; }
    if (step === 3 && s3.contractTypes.length === 0) { toast.error("Choisis au moins un type de contrat"); return false; }
    return true;
  }

  function next() { if (validateStep()) setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4); }
  function prev() { setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4); }

  async function submit() {
    if (!validateStep()) return;
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/auth/login"); return; }

    const allFlags = [...s4.redFlags, ...(s4.customRedFlag ? [s4.customRedFlag] : [])];
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

    if (error) { toast.error("Erreur lors de la création du profil"); setSubmitting(false); return; }

    // Génère l'embedding CV si disponible
    if (s4.cvText) {
      await fetch("/api/user/embed-cv", { method: "POST" }).catch(() => {});
    }

    toast.success("Profil créé !");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[var(--muted-foreground)] text-sm mb-4">Étape {step} sur 4</p>
          <div className="flex gap-1.5 mb-6">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1 rounded-full transition-colors ${i + 1 <= step ? "bg-[var(--accent)]" : "bg-white/10"}`} />
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white">{STEP_LABELS[step - 1]}</h1>
        </div>

        {/* Step content */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          {step === 1 && <Step1Form data={s1} onChange={(d) => setS1((p) => ({ ...p, ...d }))} />}
          {step === 2 && <Step2Form data={s2} onChange={(d) => setS2((p) => ({ ...p, ...d }))} />}
          {step === 3 && <Step3Form data={s3} onChange={(d) => setS3((p) => ({ ...p, ...d }))} />}
          {step === 4 && <Step4Form data={s4} onChange={(d) => setS4((p) => ({ ...p, ...d }))} />}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={prev} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Retour
            </button>
          )}
          {step < 4 ? (
            <button onClick={next} className="flex-1 btn-cta justify-center">
              Continuer →
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="flex-1 btn-cta justify-center disabled:opacity-50">
              {submitting ? "Création en cours…" : "Créer mon profil ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
