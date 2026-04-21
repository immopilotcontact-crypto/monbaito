"use client";

import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Tu crées ton profil en 2 minutes.",
    description:
      "Ton niveau d'études, ta ville, tes dispos, et surtout tes red flags personnels : 'pas de porte-à-porte', 'pas plus de 30 min de transport', 'salaire au SMIC minimum'. MonBaito retient.",
  },
  {
    number: "02",
    title: "L'IA scanne 20+ sources toutes les 3 heures.",
    description:
      "Indeed, HelloWork, Jobteaser, France Travail, pages carrières des grandes enseignes, groupes locaux. Rien ne lui échappe, et la base s'enrichit du feedback de chaque étudiant.",
  },
  {
    number: "03",
    title: "Chaque offre reçoit un Trust Score.",
    description:
      "Vérification SIRENE de l'entreprise, cohérence du salaire avec le marché, détection des patterns d'arnaque par IA, avis d'anciens candidats. Tu vois en un coup d'œil si c'est safe, et pourquoi.",
  },
  {
    number: "04",
    title: "Tu postules en un clic, avec une lettre sur mesure.",
    description:
      "L'IA rédige une lettre de motivation adaptée à cette offre précise, à partir de ton CV. Tu relis, tu ajustes si tu veux, tu envoies. Plus de copier-coller.",
  },
];

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {steps.map((step, index) => (
        <motion.div
          key={step.number}
          className="flex gap-6 md:gap-10 items-start"
          initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: shouldReduceMotion ? 0 : index * 0.1,
          }}
        >
          <span
            className="text-5xl md:text-6xl font-serif font-medium text-accent shrink-0 leading-none tracking-tight select-none"
            style={{ fontFamily: "var(--font-serif)" }}
            aria-hidden="true"
          >
            {step.number}
          </span>
          <div className="flex flex-col gap-2 pt-1">
            <h3 className="text-lg md:text-xl font-medium text-foreground">
              {step.title}
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
