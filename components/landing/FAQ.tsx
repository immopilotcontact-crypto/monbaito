"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "C'est quoi exactement, concrètement ?",
    answer:
      "Une web app qui s'installe comme une vraie app sur ton téléphone (mais qui marche aussi sur ordinateur). Elle va chercher les offres d'emploi étudiantes à ta place, les trie, détecte les arnaques, et t'aide à postuler plus vite et mieux. Pas de magie : juste de la bonne IA bien utilisée.",
  },
  {
    question: "Pourquoi je devrais te faire confiance ?",
    answer:
      "Tu n'es pas obligé. Tu laisses ton email, tu attends qu'on lance la beta en mai, tu testes gratuitement, tu décides si ça te sert. Zéro engagement, zéro arnaque.",
  },
  {
    question: "Mes données, tu en fais quoi ?",
    answer:
      "Rien d'autre que de les utiliser pour te servir. Je ne les revends pas, je ne les partage pas, je ne les utilise pas pour entraîner des IA. Tu peux supprimer ton compte et toutes tes infos à tout moment, d'un clic. C'est dans le RGPD, je l'applique à la lettre.",
  },
  {
    question: "Tu es qui, toi ?",
    answer:
      "Je m'appelle Morii, j'ai 19 ans, je suis étudiant en BTS NDRC à Rouen. J'ai galéré 6 mois à chercher un job étudiant avec les plateformes actuelles. J'ai fini par me dire que si personne ne construisait l'outil qui manque, j'allais le faire moi-même.",
  },
  {
    question: "Quand ça sort pour de vrai ?",
    answer:
      "La beta privée démarre en mai 2026 avec les 100 premiers inscrits. La version publique suit si la beta se passe bien. En t'inscrivant aujourd'hui, tu es prioritaire sur les 100 places.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="section-spacing px-6" aria-labelledby="faq-title">
      <div className="max-w-screen-xl mx-auto">
        {/* Section header */}
        <div className="flex justify-between items-baseline mb-16 border-b border-stone-200 pb-4">
          <h2
            id="faq-title"
            className="text-xl md:text-2xl font-black uppercase tracking-tighter text-neutral-900"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {/* Contenu à remplir */}
            Ce que tu te demandes sûrement.
          </h2>
        </div>

        <div className="max-w-3xl">
          <Accordion defaultValue={[]} className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-stone-200"
              >
                <AccordionTrigger
                  className="text-left text-neutral-900 hover:text-red-700 transition-colors py-5 text-sm uppercase tracking-tight font-black hover:no-underline"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  className="text-neutral-500 text-sm leading-relaxed pb-5"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
