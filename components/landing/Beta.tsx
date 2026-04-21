"use client";

import { useState, useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { EmailForm } from "@/components/shared/EmailForm";

const betaBlocks = [
  {
    number: "01",
    title: "Pourquoi seulement 100 ?",
    description:
      "Parce que je veux m'occuper personnellement de chacun. Tu auras mon contact direct, ton feedback façonnera vraiment le produit.",
  },
  {
    number: "02",
    title: "Qui peut rejoindre ?",
    description:
      "Tous les étudiants en France : lycée, BTS, licence, master, école d'ingé, école de commerce. Peu importe l'âge ou la filière.",
  },
  {
    number: "03",
    title: "C'est combien ?",
    description:
      "La beta est entièrement gratuite. Quand MonBaito sortira officiellement, les beta testeurs auront 3 mois de Pro offerts en remerciement.",
  },
];

function AnimatedCounter({
  target,
  isInView,
}: {
  target: number;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView || target === 0) return;
    if (shouldReduceMotion) {
      setCount(target);
      return;
    }
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, isInView, shouldReduceMotion]);

  return (
    <span
      className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-red-700 tabular-nums"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {count}
    </span>
  );
}

interface BetaProps {
  externalCount?: number;
}

export function Beta({ externalCount }: BetaProps) {
  const [count, setCount] = useState(externalCount || 0);
  const counterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(counterRef, { once: true });

  useEffect(() => {
    if (externalCount !== undefined) {
      setCount(externalCount);
      return;
    }
    async function fetchCount() {
      try {
        const res = await fetch("/api/waitlist");
        const data = await res.json();
        setCount(data.count || 0);
      } catch {
        // silent
      }
    }
    fetchCount();
  }, [externalCount]);

  return (
    <section id="beta" className="section-spacing px-5 md:px-6" aria-labelledby="beta-title">
      <div className="max-w-screen-xl mx-auto">
        {/* Section header */}
        <div className="flex justify-between items-baseline mb-8 md:mb-16 border-b border-stone-200 pb-4">
          <h2
            id="beta-title"
            className="text-xl md:text-2xl font-black uppercase tracking-tighter text-neutral-900"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {/* Contenu à remplir */}
            On cherche 100 étudiants.
          </h2>
          <span
            className="font-label text-[10px] text-neutral-400 tracking-widest uppercase hidden sm:block"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Beta Access
          </span>
        </div>

        {/* Counter */}
        <div ref={counterRef} className="mb-8 md:mb-16 flex items-end gap-4 flex-wrap">
          <AnimatedCounter target={count} isInView={isInView} />
          <p
            className="text-neutral-500 text-lg mb-2"
            style={{ fontFamily: "var(--font-label)" }}
          >
            étudiants nous ont déjà rejoints
          </p>
        </div>

        {/* Q&A blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
          {betaBlocks.map((block) => (
            <div key={block.number} className="border-t border-stone-200 pt-6">
              <span
                className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-2"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {block.number}
              </span>
              <h3
                className="text-base font-black uppercase tracking-tight text-neutral-900 mb-3"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {block.title}
              </h3>
              <p
                className="text-sm text-neutral-500 leading-relaxed"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {block.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA form */}
        <div className="flex justify-start">
          <EmailForm
            onSuccess={(newCount) => setCount(newCount)}
            className="max-w-lg w-full"
          />
        </div>
        <p
          className="text-[10px] tracking-widest uppercase text-neutral-400 mt-4"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Gratuit. Pas de carte bancaire. Zéro spam, zéro revente de tes données.
        </p>
      </div>
    </section>
  );
}
