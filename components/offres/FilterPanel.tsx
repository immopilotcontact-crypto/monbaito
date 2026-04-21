"use client";

import { useState } from "react";
import { SECTEURS } from "@/lib/secteurs";

const CONTRACT_TYPES = [
  { value: "student", label: "Job étudiant" },
  { value: "alternance", label: "Alternance" },
  { value: "internship", label: "Stage" },
  { value: "seasonal", label: "Saisonnier" },
  { value: "other", label: "Autre" },
];

const DISTANCE_VALUES = [5, 10, 20, 30, 50];

interface FilterPanelProps {
  secteurs: string[];
  types: string[];
  trustMin: number;
  salaireMin: number;
  distance: number;
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
  distance: initialDistance,
  onChange,
  onReset,
}: FilterPanelProps) {
  const [secteurs, setSecteurs] = useState<string[]>(initialSecteurs);
  const [types, setTypes] = useState<string[]>(initialTypes);
  const [trustMin, setTrustMin] = useState(initialTrustMin);
  const [salaireMin, setSalaireMin] = useState(initialSalaireMin);
  // Convert distance km to range index (0-4)
  const initialDistanceIdx = Math.max(
    0,
    DISTANCE_VALUES.indexOf(
      DISTANCE_VALUES.reduce((prev, curr) =>
        Math.abs(curr - initialDistance) < Math.abs(prev - initialDistance) ? curr : prev
      )
    )
  );
  const [distanceIdx, setDistanceIdx] = useState(initialDistanceIdx);

  function emitChange(
    nextSecteurs = secteurs,
    nextTypes = types,
    nextTrustMin = trustMin,
    nextSalaireMin = salaireMin,
    nextDistanceIdx = distanceIdx
  ) {
    onChange({
      secteurs: nextSecteurs,
      types: nextTypes,
      trustMin: nextTrustMin,
      salaireMin: nextSalaireMin,
      distance: DISTANCE_VALUES[nextDistanceIdx],
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

  function handleDistanceChange(idx: number) {
    setDistanceIdx(idx);
    emitChange(undefined, undefined, undefined, undefined, idx);
  }

  function handleReset() {
    setSecteurs([]);
    setTypes([]);
    setTrustMin(0);
    setSalaireMin(0);
    setDistanceIdx(3); // default 30km
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

      {/* Rayon de recherche */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Rayon :{" "}
          <span className="text-accent">{DISTANCE_VALUES[distanceIdx]} km</span>
        </p>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={distanceIdx}
          onChange={(e) => handleDistanceChange(Number(e.target.value))}
          className="w-full accent-[hsl(354_80%_57%)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          {DISTANCE_VALUES.map((d) => (
            <span key={d}>{d}km</span>
          ))}
        </div>
      </div>
    </div>
  );
}
