import { Suspense } from "react";
import type { Metadata } from "next";
import { getOffres } from "@/lib/offres";
import { OffresPageClient } from "@/components/offres/OffresPageClient";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Alternance — Offres d'apprentissage et contrats pro",
  description:
    "Trouve ton contrat d'alternance parmi des centaines d'offres d'apprentissage et contrats de professionnalisation vérifiés par notre IA.",
  alternates: { canonical: "/alternance" },
};

export default async function AlternancePage({
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
  const secteurs = getStr("secteurs") ? getStr("secteurs").split(",").filter(Boolean) : [];
  const types = getStr("types") ? getStr("types").split(",").filter(Boolean) : [];
  const trust_min = Number(getStr("trust", "0")) || 0;
  const salaire_min = Number(getStr("salaire", "0")) || 0;
  const sort = getStr("tri", "");

  const { offres, total } = await getOffres({
    page,
    q,
    ville,
    type: "alternance",
    secteurs,
    types: types.length > 0 ? types : ["alternance"],
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
          initialType="alternance"
          initialSecteurs={secteurs}
          initialTypes={types.length > 0 ? types : ["alternance"]}
          initialTrustMin={trust_min}
          initialSalaireMin={salaire_min}
          initialSort={sort}
          title="Trouve ton alternance"
          subtitle="Apprentissage et contrats de professionnalisation vérifiés par notre IA."
        />
      </Suspense>
      <Footer />
    </>
  );
}
