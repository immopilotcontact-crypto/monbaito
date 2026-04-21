"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qu'est-ce que MonBaito, concrètement ?",
    answer:
      "MonBaito est une plateforme conçue pour les étudiants, par un étudiant. Notre IA analyse votre profil — niveau d'études, disponibilités, secteur souhaité — et sélectionne pour vous les offres les plus pertinentes parmi des dizaines de sources. Elle peut également postuler à votre place lorsque c'est possible, pour vous faire gagner un maximum de temps.",
  },
  {
    question: "Comment fonctionne la personnalisation ?",
    answer:
      "Lors de la configuration de votre profil, vous renseignez vos préférences : secteur, ville, type de contrat, disponibilités et critères personnels. Notre IA utilise ces informations pour vous proposer uniquement les offres qui correspondent vraiment à votre situation, et non une liste générique.",
  },
  {
    question: "C'est quoi les groupes d'entraide ?",
    answer:
      "MonBaito intègre un espace communautaire où les étudiants peuvent s'organiser en groupes publics ou privés : partager des bons plans, s'entraider sur les candidatures, donner des retours sur des employeurs. Ces groupes sont strictement modérés pour garantir un environnement sain et bienveillant.",
  },
  {
    question: "Que faites-vous de mes données ?",
    answer:
      "Vos données sont utilisées exclusivement pour vous fournir le service. Elles ne sont ni revendues, ni partagées avec des tiers, ni utilisées pour entraîner des modèles d'IA externes. Vous pouvez supprimer votre compte et l'intégralité de vos informations à tout moment, depuis votre espace personnel. Nous appliquons le RGPD à la lettre.",
  },
  {
    question: "Qui est derrière MonBaito ?",
    answer:
      "MonBaito est né de l'expérience directe d'un étudiant en BTS à Rouen, qui a passé des mois à chercher un job étudiant sans trouver d'outil vraiment adapté. Le projet est porté par une équipe qui croit qu'il est possible de construire quelque chose de mieux, ensemble, avec les premiers utilisateurs.",
  },
  {
    question: "Quand la beta est-elle disponible ?",
    answer:
      "La beta privée ouvre en mai 2026 pour les 100 premiers inscrits. L'accès est entièrement gratuit. En vous inscrivant dès maintenant, vous êtes prioritaire sur les places disponibles et vous contribuez directement à façonner le produit.",
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
            Questions fréquentes.
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
