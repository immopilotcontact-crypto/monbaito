import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions Generales d'Utilisation (CGU) de MonBaito.",
};

export default function CGU() {
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
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p>
              <em>Dernière mise à jour : mars 2026.</em>
            </p>
            
            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                1. Présentation du service
              </h2>
              <p>
                MonBaito est une application web (Progressive Web App) destinée à aider les étudiants en France à trouver des emplois et des stages, éditée par <strong className="text-foreground">SAAS AGOU & CO</strong>, auto-entrepreneur immatriculé sous le numéro SIREN 101 600 773, dont le siège social est situé au 8 Place Pablo Picasso, 76380 Canteleu, France.
              </p>
              <p className="mt-2">
                Le service MonBaito comprend notamment : l&apos;agrégation d&apos;offres d&apos;emploi, la détection d&apos;arnaques par un agent IA, un système de scoring ("Trust Score"), et une assistance à la rédaction de candidatures. Ces fonctionnalités sont accessibles via l&apos;adresse www.monbaito.fr.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                2. Acceptation des conditions
              </h2>
              <p>
                L&apos;accès et l&apos;utilisation du service MonBaito impliquent l&apos;acceptation pleine et entière des présentes Conditions Générales d&apos;Utilisation (CGU). En créant un compte, en s&apos;inscrivant à la beta ou en utilisant le service, l&apos;utilisateur reconnaît avoir lu, compris et accepté les présentes conditions.
              </p>
              <p className="mt-2">
                Si vous n&apos;acceptez pas ces conditions, vous devez cesser immédiatement d&apos;utiliser le service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                3. Création de compte et Waitlist
              </h2>
              <p>L&apos;accès au service complet nécessite l&apos;inscription à la plateforme. L&apos;utilisateur s&apos;engage à :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Fournir des informations exactes, complètes et à jour lors de l&apos;inscription.</li>
                <li>Maintenir la confidentialité de ses identifiants de connexion.</li>
                <li>Notifier immédiatement SAAS AGOU & CO de toute utilisation non autorisée de son compte.</li>
                <li>Ne pas créer plusieurs comptes pour un même utilisateur.</li>
              </ul>
              <p className="mt-2">SAAS AGOU & CO se réserve le droit de suspendre ou de supprimer tout compte en cas de non-respect des présentes CGU.</p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                4. Utilisation du service et IA
              </h2>
              <p>L&apos;utilisateur s&apos;engage à utiliser MonBaito exclusivement dans un cadre légal. Conformément à la réglementation sur l&apos;Intelligence Artificielle de 2026, l&apos;utilisateur est informé que le service repose sur des algorithmes :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong className="text-foreground">Aide à la candidature :</strong> Les lettres générées par l&apos;IA doivent être vérifiées par l&apos;utilisateur. MonBaito ne garantit pas l&apos;obtention d&apos;un emploi.</li>
                <li><strong className="text-foreground">Analyse anti-fraude :</strong> MonBaito utilise des algorithmes pour détecter les fraudes. L&apos;appréciation finale relève toujours du discernement de l&apos;utilisateur. Un "Trust Score" élevé ne constitue pas une garantie juridique de sécurité de l&apos;employeur.</li>
              </ul>
              <p className="mt-4 font-medium text-foreground">Il est expressément interdit de :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Utiliser le service à des fins illicites ou contraires aux présentes CGU.</li>
                <li>Tenter de contourner les mesures de sécurité ou le rate-limiting de la plateforme.</li>
                <li>Usurper l&apos;identité d&apos;un tiers ou fournir de faux CVs.</li>
                <li>Exploiter ou scraper le service (incluant les modèles IA) à des fins de revente ou de copie.</li>
                <li>Respecter les droits de propriété intellectuelle de SAAS AGOU & CO.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                5. Données utilisateurs
              </h2>
              <p>
                L&apos;utilisateur reste propriétaire de l&apos;ensemble des données qu&apos;il saisit dans MonBaito (profil, CV, préférences). SAAS AGOU & CO s&apos;engage à n&apos;exploiter ces données que pour le fonctionnement du service d&apos;intermédiation étudiante, et à en assurer la sécurité et la confidentialité conformément à la politique de confidentialité.
              </p>
               <p className="mt-2">
                En cas de résiliation du compte, les données sont supprimées ou exportables selon les règles définies par le RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                6. Disponibilité du service
              </h2>
              <p>
                SAAS AGOU & CO s&apos;efforce d&apos;assurer la disponibilité du service 24h/24 et 7j/7. Toutefois, des interruptions peuvent survenir pour des raisons de maintenance, de mise à jour ou de force majeure. SAAS AGOU & CO ne saurait être tenue responsable des interruptions de service et de leurs conséquences.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                7. Limitation de responsabilité
              </h2>
              <p>
                MonBaito n&apos;est pas une agence de recrutement. SAAS AGOU & CO ne saurait en aucun cas être tenue responsable :
              </p>
               <ul className="list-disc pl-6 space-y-1 mt-2 mb-2">
                <li>D&apos;un litige entre l&apos;utilisateur et le recruteur final concernant une offre listée sur MonBaito.</li>
                <li>De conditions de travail inadaptées, illégales ou de scam non intercepté par nos filtres automatisés.</li>
              </ul>
              <p>
                SAAS AGOU & CO ne saurait être tenue responsable des dommages directs ou indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service, y compris les pertes de données ou interruptions d&apos;activité.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                8. Modification des CGU
              </h2>
              <p>
                SAAS AGOU & CO se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs enregistrés seront informés de toute modification substantielle avec un préavis d&apos;au moins 15 jours. La poursuite de l&apos;utilisation du service après ce délai vaut acceptation des nouvelles conditions.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                9. Droit applicable et juridiction
              </h2>
              <p>
                Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux du ressort de Rouen seront seuls compétents.
              </p>
            </section>
            
          </div>
        </div>
      </main>
    </>
  );
}
