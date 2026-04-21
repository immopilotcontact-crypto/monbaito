import { Suspense } from "react";
import type { Metadata } from "next";
import { getOffres } from "@/lib/offres";
import { OffresPageClient } from "@/components/offres/OffresPageClient";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Offres d'emploi étudiantes — Vérifiées sans arnaque",
  description:
    "Trouve ton job étudiant parmi des centaines d'offres vérifiées par notre IA. Trust Score anti-arnaque, candidature en 1 clic. Restauration, vente, babysitting, livraison et plus.",
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
  const { offres, total } = await getOffres({ page });

  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <OffresPageClient
          initialOffres={offres}
          initialTotal={total}
          initialPage={page}
          initialQ={getStr("q")}
          initialVille={getStr("ville")}
          initialType={getStr("type")}
          initialSecteurs={getStr("secteur") ? [getStr("secteur")] : []}
          initialTypes={[]}
          initialTrustMin={Number(getStr("trust", "0")) || 0}
          initialSalaireMin={Number(getStr("salaire", "0")) || 0}
          initialDistance={Number(getStr("distance", "30")) || 30}
          initialSort={getStr("tri", "")}
        />
      </Suspense>
      <Footer />
    </>
  );
}
