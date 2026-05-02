import type { Metadata } from "next";
import { HomeLanding } from "@/components/landing/HomeLanding";

export const metadata: Metadata = {
  title: "MonBaito — L'IA qui trouve ton job étudiant",
  description:
    "MonBaito est l'agent IA qui scanne les offres d'emploi étudiantes et t'aide à postuler plus vite et mieux. Jobs étudiants, alternances, stages vérifiés. Gratuit.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MonBaito — L'IA qui trouve ton job étudiant",
    description:
      "Fini les heures perdues. MonBaito scanne les offres, vérifie les entreprises, et t'aide à postuler en un clic.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  return <HomeLanding />;
}
