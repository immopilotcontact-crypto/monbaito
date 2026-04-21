"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface RatingStats {
  total_ratings: number;
  avg_response_speed: number | null;
  avg_satisfaction: number | null;
  avg_trust: number | null;
  avg_overall: number | null;
}

interface MyRating {
  response_speed: number | null;
  satisfaction: number | null;
  trust: number | null;
}

const CRITERIA = [
  { key: "response_speed" as const, label: "Vitesse de réponse" },
  { key: "satisfaction"   as const, label: "Satisfaction" },
  { key: "trust"          as const, label: "Confiance" },
];

function Stars({
  value,
  onChange,
  readonly,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(null)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <Star
            size={16}
            className={
              n <= display
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-neutral-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Stars value={value ? Math.round(value) : null} readonly />
        <span className="text-xs font-bold text-foreground w-6 text-right">
          {value != null ? value.toFixed(1) : "—"}
        </span>
      </div>
    </div>
  );
}

export function RatingWidget({ offerId }: { offerId: string }) {
  const [stats, setStats]   = useState<RatingStats | null>(null);
  const [mine, setMine]     = useState<MyRating>({ response_speed: null, satisfaction: null, trust: null });
  const [saving, setSaving] = useState(false);
  const [open, setOpen]     = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?offer_id=${offerId}`)
      .then((r) => r.json())
      .then(({ stats, mine }) => {
        if (stats) setStats(stats);
        if (mine)  setMine(mine);
        setLoaded(true);
      });
  }, [offerId]);

  async function save() {
    if (!mine.response_speed || !mine.satisfaction || !mine.trust) {
      toast.error("Veuillez noter les 3 critères.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer_id: offerId, ...mine }),
    });
    if (res.ok) {
      toast.success("Note enregistrée — merci !");
      // Refresh stats
      const updated = await fetch(`/api/ratings?offer_id=${offerId}`).then((r) => r.json());
      if (updated.stats) setStats(updated.stats);
      setOpen(false);
    } else {
      const err = await res.json();
      if (err.error?.includes("Unauthorized")) {
        toast.error("Connectez-vous pour noter cette annonce.");
      } else {
        toast.error("Erreur lors de l'enregistrement.");
      }
    }
    setSaving(false);
  }

  if (!loaded) return null;

  const hasStats  = stats && Number(stats.total_ratings) > 0;
  const hasMyNote = mine.response_speed && mine.satisfaction && mine.trust;

  return (
    <div className="border-t border-border pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Avis étudiants
        </p>
        {hasStats && (
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
            {stats.total_ratings} avis
          </span>
        )}
      </div>

      {/* Average stats */}
      {hasStats ? (
        <div className="space-y-2">
          <StatRow label="Vitesse de réponse" value={stats.avg_response_speed} />
          <StatRow label="Satisfaction"        value={stats.avg_satisfaction} />
          <StatRow label="Confiance"           value={stats.avg_trust} />
          <div className="border-t border-border/50 pt-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-label)" }}>
              Moyenne
            </span>
            <div className="flex items-center gap-2">
              <Stars value={stats.avg_overall ? Math.round(stats.avg_overall) : null} readonly />
              <span className="text-sm font-black text-foreground">
                {stats.avg_overall?.toFixed(1) ?? "—"}<span className="text-xs text-muted-foreground font-normal">/5</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
          Aucun avis pour l&apos;instant. Soyez le premier à noter.
        </p>
      )}

      {/* Rate button / form */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-2 border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {hasMyNote ? "Modifier ma note" : "Noter cet employeur"}
        </button>
      ) : (
        <div className="space-y-3 bg-muted/40 p-4 border border-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent" style={{ fontFamily: "var(--font-label)" }}>
            Votre avis (optionnel)
          </p>
          {CRITERIA.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
                {label}
              </span>
              <Stars
                value={mine[key]}
                onChange={(v) => setMine((m) => ({ ...m, [key]: v }))}
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2 bg-accent text-accent-foreground text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {saving ? "Envoi…" : "Envoyer"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
