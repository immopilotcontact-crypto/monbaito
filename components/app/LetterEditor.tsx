"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, CheckCircle2, Loader2, Sparkles, CheckCircle, Target } from "lucide-react";
import { toast } from "sonner";

interface LetterEditorProps {
  offerId: string;
  offerUrl: string | null;
  companyName: string | null;
  offerTitle: string;
  matchId?: string;
}

export function LetterEditor({ offerId, offerUrl, companyName, offerTitle, matchId }: LetterEditorProps) {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAppliedPopup, setShowAppliedPopup] = useState(false);
  const [applied, setApplied] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/application/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Erreur de génération"); return; }
      setLetter(json.letter);
      setGenerated(true);
    } catch {
      toast.error("Erreur lors de la génération de la lettre");
    } finally {
      setLoading(false);
    }
  }

  async function copyAndOpen() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (offerUrl) window.open(offerUrl, "_blank", "noopener,noreferrer");

    // Popup de confirmation après 30 secondes
    setTimeout(() => setShowAppliedPopup(true), 30000);
  }

  async function markApplied() {
    setApplied(true);
    setShowAppliedPopup(false);
    await fetch("/api/application/mark-applied", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, matchId, letterText: letter }),
    });
    toast.success("Candidature enregistrée !");
  }

  return (
    <div className="mt-6">
      {!generated ? (
        <button
          onClick={generate}
          disabled={loading}
          className="btn-cta w-full justify-center text-base py-4"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Génération de ta lettre par Claude…
            </>
          ) : (
            <><Sparkles size={16} className="mr-2" />Postuler avec MonBaito — Générer ma lettre</>

          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-2">
              Ta lettre de motivation — éditable
            </label>
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm leading-relaxed focus:outline-none focus:border-[var(--accent)] resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyAndOpen}
              className="btn-cta flex-1 justify-center gap-2"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? "Copié !" : "Copier & ouvrir l'offre"}
              {offerUrl && <ExternalLink size={14} className="opacity-60" />}
            </button>
            <button
              onClick={generate}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="Régénérer"
            >
              ↺
            </button>
          </div>
          {applied && (
            <p className="text-center text-sm text-emerald-400 font-medium">
              <CheckCircle size={14} className="inline mr-1" />Candidature enregistrée pour {companyName}
            </p>
          )}
        </div>
      )}

      {/* Popup J+0 */}
      {showAppliedPopup && !applied && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-white text-lg mb-2 flex items-center gap-2"><Target size={18} />Tu as postulé ?</h3>
            <p className="text-[var(--muted-foreground)] text-sm mb-5">
              Pour {offerTitle} chez {companyName ?? "cette entreprise"}
            </p>
            <div className="flex gap-3">
              <button onClick={markApplied} className="btn-cta flex-1 justify-center">
                Oui, j&apos;ai postulé
              </button>
              <button onClick={() => setShowAppliedPopup(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white">
                Pas encore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
