"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/validators";

interface HeroProps {
  onWaitlistSuccess?: (count: number) => void;
}

export function Hero({ onWaitlistSuccess }: HeroProps) {
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
          toast.error(data.message || "Trop de tentatives. Réessaie plus tard.");
          return;
        }
        if (data.success) {
          toast.success(data.message);
          setEmail("");
          onWaitlistSuccess?.(data.count);
        } else {
          toast.error(data.message || "Une erreur est survenue.");
        }
      } catch {
        toast.error("Erreur de connexion.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, onWaitlistSuccess]
  );

  return (
    <section
      className="relative flex flex-col items-center justify-center px-5 pt-14 pb-20 md:pt-20 md:pb-32 md:min-h-[820px] overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Background number decoration */}
      <div
        className="absolute top-8 left-6 select-none pointer-events-none"
        aria-hidden="true"
        style={{
          fontSize: "clamp(8rem, 20vw, 16rem)",
          fontFamily: "var(--font-sans)",
          fontWeight: 900,
          color: "hsl(0 0% 0% / 0.04)",
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }}
      >
        01
      </div>

      <div className="max-w-4xl w-full text-center relative z-10">
        <h1
          id="hero-title"
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-5 md:mb-6"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {/* Contenu à remplir */}
          Trouve ton baito en une vibe.
        </h1>

        <p
          className="text-base md:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 md:mb-16 tracking-tight"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {/* Contenu à remplir */}
          Le matching IA qui comprend ton rythme et sublime ton parcours sans friction.
        </p>

        {/* Terminal email form */}
        <div className="w-full max-w-2xl mx-auto bg-neutral-900 overflow-hidden shadow-2xl">
          <div className="flex items-center px-4 py-2.5 border-b border-white/10 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
            <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
            <span
              className="ml-4 text-[10px] tracking-widest uppercase text-neutral-500"
              style={{ fontFamily: "var(--font-label)" }}
            >
              monbaito — beta_access.sh
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center px-3 py-3 md:px-4 md:py-4 gap-2 md:gap-3">
            <span className="text-red-500 text-lg select-none" aria-hidden="true">❯</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              disabled={isSubmitting}
              aria-label="Adresse email pour rejoindre la beta"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-600 text-sm tracking-wide lowercase"
              style={{ fontFamily: "var(--font-label)" }}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-700 text-white font-black text-xs tracking-widest uppercase px-5 py-2 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {isSubmitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <>S&apos;INSCRIRE</>
              )}
            </button>
          </form>
        </div>

        <p
          className="mt-5 text-[10px] tracking-widest uppercase text-neutral-400"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Gratuit. Pas de carte bancaire. Zéro spam.
        </p>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-stone-200" />
    </section>
  );
}
