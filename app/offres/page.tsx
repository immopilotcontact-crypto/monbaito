import { Suspense } from "react";
import type { Metadata } from "next";
import { getOffres } from "@/lib/offres";
import { OffresPageClient } from "@/components/offres/OffresPageClient";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Offres d'emploi étudiantes — Vérifiées par notre IA",
  description:
    "Trouve ton job étudiant parmi des centaines d'offres vérifiées par notre IA. Candidature en 1 clic. Restauration, vente, babysitting, livraison et plus.",
  alternates: { canonical: "/offres" },
};

export default async function OffresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  function getStr(key: string, fallback = "") {
    const v = params[key];
    return typeof v === "string" ? v : fallback;
  }

  const page = Math.max(1, Number(getStr("page", "1")) || 1);
  const q = getStr("q");
  const ville = getStr("ville");
  const type = getStr("type");
  const secteurs = getStr("secteurs") ? getStr("secteurs").split(",").filter(Boolean) : [];
  const types = getStr("types") ? getStr("types").split(",").filter(Boolean) : [];
  const trust_min = Number(getStr("trust", "0")) || 0;
  const salaire_min = Number(getStr("salaire", "0")) || 0;
  const sort = getStr("tri", "");

  const { offres, total } = await getOffres({
    page,
    q,
    ville,
    type,
    secteurs,
    types,
    trust_min,
    salaire_min,
    sort,
  });

  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <OffresPageClient
          initialOffres={offres}
          initialTotal={total}
          initialPage={page}
          initialQ={q}
          initialVille={ville}
          initialType={type}
          initialSecteurs={secteurs}
          initialTypes={types}
          initialTrustMin={trust_min}
          initialSalaireMin={salaire_min}
          initialDistance={Number(getStr("distance", "30")) || 30}
          initialSort={sort}
        />
      </Suspense>
      <Footer />
    </>
  );
}
