"use client";

import { useState, useEffect } from "react";
import { SECTEURS } from "@/lib/secteurs";

const CONTRACT_TYPES = [
  { value: "student", label: "Job étudiant" },
  { value: "alternance", label: "Alternance" },
  { value: "internship", label: "Stage" },
  { value: "seasonal", label: "Saisonnier" },
  { value: "other", label: "Autre" },
];

interface FilterPanelProps {
  secteurs: string[];
  types: string[];
  trustMin: number;
  salaireMin: number;
  onChange: (filters: {
    secteurs: string[];
    types: string[];
    trustMin: number;
    salaireMin: number;
    distance: number;
  }) => void;
  onReset: () => void;
}

export function FilterPanel({
  secteurs: initialSecteurs,
  types: initialTypes,
  trustMin: initialTrustMin,
  salaireMin: initialSalaireMin,
  onChange,
  onReset,
}: FilterPanelProps) {
  const [secteurs, setSecteurs] = useState<string[]>(initialSecteurs);
  const [types, setTypes] = useState<string[]>(initialTypes);
  const [trustMin, setTrustMin] = useState(initialTrustMin);
  const [salaireMin, setSalaireMin] = useState(initialSalaireMin);

  // Sync avec les changements de props (ex: chip secteur cliqué hors du panel)
  useEffect(() => { setSecteurs(initialSecteurs); }, [initialSecteurs]);
  useEffect(() => { setTypes(initialTypes); }, [initialTypes]);
  useEffect(() => { setTrustMin(initialTrustMin); }, [initialTrustMin]);
  useEffect(() => { setSalaireMin(initialSalaireMin); }, [initialSalaireMin]);

  function emitChange(
    nextSecteurs = secteurs,
    nextTypes = types,
    nextTrustMin = trustMin,
    nextSalaireMin = salaireMin
  ) {
    onChange({
      secteurs: nextSecteurs,
      types: nextTypes,
      trustMin: nextTrustMin,
      salaireMin: nextSalaireMin,
      distance: 30,
    });
  }

  function toggleSecteur(slug: string) {
    const next = secteurs.includes(slug)
      ? secteurs.filter((s) => s !== slug)
      : [...secteurs, slug];
    setSecteurs(next);
    emitChange(next);
  }

  function toggleType(value: string) {
    const next = types.includes(value)
      ? types.filter((t) => t !== value)
      : [...types, value];
    setTypes(next);
    emitChange(undefined, next);
  }

  function handleTrustChange(val: number) {
    setTrustMin(val);
    emitChange(undefined, undefined, val);
  }

  function handleSalaireChange(val: number) {
    setSalaireMin(val);
    emitChange(undefined, undefined, undefined, val);
  }

  function handleReset() {
    setSecteurs([]);
    setTypes([]);
    setTrustMin(0);
    setSalaireMin(0);
    onReset();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">Filtres</span>
        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      {/* Secteur */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Secteur</p>
        <div className="space-y-2">
          {SECTEURS.map((s) => (
            <label key={s.slug} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={secteurs.includes(s.slug)}
                onChange={() => toggleSecteur(s.slug)}
                className="accent-[hsl(354_80%_57%)] w-3.5 h-3.5 flex-shrink-0"
              />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type de contrat */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Type de contrat</p>
        <div className="space-y-2">
          {CONTRACT_TYPES.map((ct) => (
            <label key={ct.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={types.includes(ct.value)}
                onChange={() => toggleType(ct.value)}
                className="accent-[hsl(354_80%_57%)] w-3.5 h-3.5 flex-shrink-0"
              />
              <span className="text-sm text-muted-foreground">{ct.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Trust Score minimum */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Trust Score minimum :{" "}
          <span className="text-accent">{trustMin}</span>
        </p>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={trustMin}
          onChange={(e) => handleTrustChange(Number(e.target.value))}
          className="w-full accent-[hsl(354_80%_57%)]"
        />
        <p className="text-xs text-muted-foreground mt-2">
          0-44 Risque · 45-74 À vérifier · 75+ Fiable
        </p>
      </div>

      {/* Salaire horaire minimum */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Minimum :{" "}
          <span className="text-accent">{salaireMin}€/h</span>
        </p>
        <input
          type="range"
          min={0}
          max={25}
          step={0.5}
          value={salaireMin}
          onChange={(e) => handleSalaireChange(Number(e.target.value))}
          className="w-full accent-[hsl(354_80%_57%)]"
        />
        <p className="text-xs text-muted-foreground mt-2">SMIC 2026 = 11,88€/h</p>
      </div>

    </div>
  );
}
