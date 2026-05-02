"use client";

import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Tu configures ton profil en 2 minutes.",
    description:
      "Niveau d'études, ville, disponibilités, secteur souhaité, type de contrat. Plus ton profil est précis, plus les suggestions de l'IA sont pertinentes.",
  },
  {
    number: "02",
    title: "L'IA scanne 20+ sources chaque jour.",
    description:
      "Indeed, HelloWork, Jobteaser, France Travail, pages carrières des grandes enseignes, groupes locaux. La base s'enrichit en continu du retour de chaque étudiant.",
  },
  {
    number: "03",
    title: "Seules les offres qui te correspondent remontent.",
    description:
      "Notre algorithme de matching analyse chaque annonce et la compare à ton profil. Tu ne vois que ce qui t'est vraiment adapté — ni trop large, ni hors sujet.",
  },
  {
    number: "04",
    title: "Tu postules en un clic, ou on le fait pour toi.",
    description:
      "L'IA rédige une lettre de motivation personnalisée à partir de ton CV et de l'offre. Tu relis, ajustes si tu le souhaites, et envoies — ou laisse MonBaito postuler à ta place lorsque c'est possible.",
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
