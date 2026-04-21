import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions Générales de Vente (CGV) de MonBaito.",
};

export default function CGV() {
  return (
    <>
      <main id="main-content" className="section-spacing">
        <div className="section-container max-w-3xl">
          <Link
            href="/"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors mb-8 inline-block"
          >
            ← Retour à l&apos;accueil
          </Link>

          <h1 className="heading-1 text-3xl md:text-4xl mb-8">
            Conditions Générales de Vente (CGV)
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground text-center py-12 bg-card rounded-xl border border-border/50">
            <h2 className="text-xl font-medium text-foreground mb-3">
              Le service est actuellement 100% gratuit
            </h2>
            <p>
              MonBaito est actuellement en Phase Beta fermée. L&apos;intégralité des services fournis (inscription, accès à la plateforme, détection des arnaques, aide à la candidature) est proposée à titre gratuit aux beta testeurs.
            </p>
            <p>
              Par conséquent, aucune transaction financière n&apos;a lieu sur la plateforme, et les Conditions Générales de Vente ne sont pas encore applicables.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Les CGV officielles seront publiées sur cette page au moment du déploiement officiel de la Phase 3 (Offre "MonBaito Pro").
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
