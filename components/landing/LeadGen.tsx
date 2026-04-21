"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/validators";

interface LeadGenProps {
  onSuccess?: (count: number) => void;
}

export function LeadGen({ onSuccess }: LeadGenProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      const trimmed = email.trim().toLowerCase();
      if (!isValidEmail(trimmed)) {
        toast.error("Adresse email invalide.");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        const data = await res.json();
        if (res.status === 429) {
          toast.error(data.message || "Trop de tentatives.");
          return;
        }
        if (data.success) {
          toast.success(data.message);
          setEmail("");
          onSuccess?.(data.count);
        } else {
          toast.error(data.message || "Une erreur est survenue.");
        }
      } catch {
        toast.error("Erreur de connexion.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, onSuccess]
  );

  return (
    <section className="bg-stone-100 py-20 px-6 border-y border-stone-200/60">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-end justify-between gap-10">
        <div className="max-w-sm">
          <span
            className="text-[10px] tracking-widest uppercase text-red-700 font-bold block mb-3"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Beta Access
          </span>
          <h2
            className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none text-neutral-900"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {/* Contenu à remplir */}
            Rejoins la bêta privée
          </h2>
        </div>

        <div className="w-full max-w-lg">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-0 border-b border-neutral-900"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="TON@EMAIL.COM"
              disabled={isSubmitting}
              aria-label="Adresse email pour la beta"
              className="bg-transparent border-none outline-none flex-1 px-0 py-4 text-sm tracking-widest uppercase text-neutral-700 placeholder:text-neutral-400"
              style={{ fontFamily: "var(--font-label)" }}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-neutral-900 text-white font-black text-[10px] tracking-widest uppercase px-8 py-4 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {isSubmitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <>S&apos;INSCRIRE</>
              )}
            </button>
          </form>
          <p
            className="mt-3 text-[10px] tracking-widest uppercase text-neutral-400"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Validation immédiate. Aucune newsletter. Juste le produit.
          </p>
        </div>
      </div>
    </section>
  );
}
