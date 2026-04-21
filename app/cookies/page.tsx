import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gestion des Cookies",
  description: "Politique d'utilisation des traceurs et cookies de MonBaito.",
};

export default function CookiesPage() {
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
            Politique de Cookies
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p>
              <em>Dernière mise à jour : 1er mai 2026.</em>
            </p>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                L&apos;engagement MonBaito : Zéro tracking inutile
              </h2>
              <p>
                La majorité des sites web modernes utilisent des cookies tiers pour traquer votre comportement de navigation afin de vous cibler avec de la publicité (Google Analytics, Meta Pixel, etc.).
              </p>
              <p className="mt-2 font-bold text-foreground">
                Sur MonBaito, nous avons fait le choix radical de n&apos;en utiliser aucun.
              </p>
              <p className="mt-2">
                Par conséquent, vous n&apos;avez vu <strong>aucune bannière de consentement aux cookies</strong> en arrivant sur notre site, car la loi (directive ePrivacy / délibérations de la CNIL) nous dispense de recueillir votre consentement pour les traceurs dits "strictement nécessaires".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                Quels traceurs utilisons-nous ?
              </h2>
              <p>
                Nous utilisons exclusivement des traceurs (ou stockage local/session) qui sont essentiels, c&apos;est-à-dire techniquement indispensables au fonctionnement de la plateforme. Selon l&apos;article 82 de la loi Informatique et Libertés, ces derniers ne nécessitent pas de consentement préalable.
              </p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>
                  <strong className="text-foreground">Stockage de session (Supabase) :</strong> Si vous créez un compte ou vous connectez, notre infrastructure (Supabase) déposera un token d&apos;authentification local pour vous maintenir connecté pendant votre session. Ce token est chiffré, ne sert qu&apos;à la sécurité de votre compte, et n&apos;est jamais partagé.
                </li>
                <li>
                  <strong className="text-foreground">Lutte contre la fraude :</strong> Pour protéger notre formulaire d&apos;inscription (waitlist) et nos APIs contre les abus (robots, attaques DDoS), nous utilisons une technique de limitation de requêtes (Rate Limiting) basée sur une version hachée (anonymisée et irréversible) de l&apos;adresse IP (hash SHA-256). Il s&apos;agit d&apos;une mesure de sécurité stricte, non de tracking publicitaire.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                Comment configurer votre navigateur ?
              </h2>
              <p>
                Si vous souhaitez bloquer absolument tous les cookies, y compris ceux strictement nécessaires (ce qui cassera probablement la fonctionnalité de connexion à votre compte MonBaito), vous pouvez le faire via les paramètres de votre navigateur web (Chrome, Firefox, Safari, Brave, etc.).
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
