import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getVilleBySlug, getRelatedVilles, VILLES } from "@/lib/villes";
import { SECTEURS } from "@/lib/secteurs";
import { getOffres } from "@/lib/offres";
import { OfferList } from "@/components/offres/OfferList";
import { Footer } from "@/components/shared/Footer";

export const dynamicParams = false;

export async function generateStaticParams() {
  return VILLES.map((v) => ({ ville: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const { ville: slug } = await params;
  const ville = getVilleBySlug(slug);
  if (!ville) return {};
  return {
    title: `Job étudiant ${ville.label} — Offres vérifiées sans arnaque`,
    description: `Trouve ton job étudiant à ${ville.label} avec MonBaito. Offres vérifiées, Trust Score anti-arnaque, candidature en 1 clic. Gratuit.`,
    alternates: { canonical: `/job-etudiant/${slug}` },
  };
}

export default async function VillePage({
  params,
}: {
  params: Promise<{ ville: string }>;
}) {
  const { ville: slug } = await params;
  const ville = getVilleBySlug(slug);
  if (!ville) notFound();

  const { offres } = await getOffres({ ville: ville.label });

  // Filter in case DB filter didn't work
  const villeOffres = offres.filter((o) => {
    const city = o.raw_offers?.location_city?.toLowerCase() ?? "";
    return (
      city.includes(ville.label.toLowerCase()) ||
      city.includes(slug.toLowerCase())
    );
  });

  const related = getRelatedVilles(ville, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Jobs étudiants à ${ville.label}`,
    numberOfItems: villeOffres.length,
    itemListElement: villeOffres.slice(0, 10).map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: o.raw_offers.title,
      url: `https://monbaito.fr/offres/${o.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-8" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:text-foreground transition-colors">
            Accueil
          </Link>
          {" / "}
          <Link href="/offres" className="hover:text-foreground transition-colors">
            Offres
          </Link>
          {" / "}
          <span>Job étudiant {ville.label}</span>
        </nav>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Job étudiant à {ville.label}
        </h1>

        {/* Introduction */}
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          Tu cherches un job étudiant à {ville.label} ? MonBaito recense les offres disponibles
          dans le département {ville.departement} et aux alentours, les vérifie une par une grâce
          à son Trust Score, et t&apos;aide à postuler en 1 clic. Fini les arnaques, fini les offres
          bidon. Que tu cherches un job en restauration, de la garde d&apos;enfants, un soutien
          scolaire ou un job d&apos;été, toutes les offres sont analysées et notées pour te
          protéger.
        </p>

        {/* Offres */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Offres disponibles à {ville.label}
          </h2>
          <OfferList offres={villeOffres} />
        </section>

        {/* Secteurs locaux */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Jobs étudiants par secteur à {ville.label}
          </h2>
          <div className="flex flex-wrap gap-3">
            {SECTEURS.filter((s) => s.slug !== "autre").map((s) => (
              <Link
                key={s.slug}
                href={`/offres?ville=${encodeURIComponent(ville.label)}&secteur=${s.slug}`}
                className="px-4 py-2 text-sm text-muted-foreground bg-card border border-border/50 rounded-lg hover:border-accent hover:text-accent transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Villes proches */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Villes proches</h2>
            <div className="flex flex-wrap gap-3">
              {related.map((v) => (
                <Link
                  key={v.slug}
                  href={`/job-etudiant/${v.slug}`}
                  className="px-4 py-2 text-sm text-muted-foreground bg-card border border-border/50 rounded-lg hover:border-accent hover:text-accent transition-colors"
                >
                  Job étudiant {v.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
