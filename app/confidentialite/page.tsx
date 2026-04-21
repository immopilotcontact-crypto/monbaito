import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et protection des données personnelles de MonBaito.",
};

export default function Confidentialite() {
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
            Politique de confidentialité
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p>
              <em>Dernière mise à jour : mars 2026</em>
            </p>

            <p>
              Nous accordons une importance primordiale à la protection de vos données personnelles (RGPD). Sur MonBaito, vous n&apos;êtes pas le produit.
            </p>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                1. Responsable du traitement
              </h2>
              <p>
                Le responsable du traitement des données collectées sur{" "}
                <strong className="text-foreground">monbaito.fr</strong> est <strong className="text-foreground">Michel Elyas</strong> (pour SAAS AGOU & CO),
                joignable à l&apos;adresse :{" "}
                <a
                  href="mailto:hello@monbaito.fr"
                  className="text-accent hover:underline"
                >
                  hello@monbaito.fr
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                2. Données collectées
              </h2>
              <p>
                Nous minimisons au strict nécessaire les données que nous collectons :
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  <strong className="text-foreground">Données de compte et contact</strong> : Adresse email (fournie volontairement pour la waitlist ou la création de compte).
                </li>
                <li>
                  <strong className="text-foreground">Données techniques anonymisées de sécurité</strong> : Hash de l&apos;adresse IP (anonymisé de manière non réversible via SHA-256), user-agent (navigateur), paramètres UTM ou source d&apos;acquisition.
                </li>
              </ul>
              <p className="mt-2 text-foreground font-medium">
                Conformément à nos engagements :
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                 <li>Nous ne collectons jamais votre adresse IP en clair.</li>
                 <li>Nous ne déposons aucun cookie de tracking publicitaire (voir la <Link href="/cookies" className="text-accent hover:underline">Politique de Cookies</Link>).</li>
                 <li>Nous ne vous demanderons aucune donnée de santé, d&apos;opinion politique ou religieuse.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                3. Finalité du traitement et bases légales
              </h2>
              <p>Les données sont collectées sur la base de :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  <strong className="text-foreground">Votre consentement (Art. 6.1.a RGPD)</strong> : Pour l&apos;inscription à la waitlist et l&apos;envoi de communications concernant la sortie de la beta.
                </li>
                <li>
                  <strong className="text-foreground">Mesures pré-contractuelles (Art. 6.1.b RGPD)</strong> : Pour la future création de votre compte utilisateur et la fourniture du service MonBaito.
                </li>
                <li>
                  <strong className="text-foreground">Intérêt légitime (Art. 6.1.f RGPD)</strong> : Pour la prévention des abus technologiques, sécurisation de notre API (rate limiting) et maintien en conditions opérationnelles de notre plateforme.
                </li>
              </ul>
            </section>

             <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                4. Sous-traitants (Hébergement et Services tiers)
              </h2>
              <p>Vos données de sont jamais revendues. Elles transitent uniquement chez des partenaires strictement audités pour le seul besoin du service :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  <strong className="text-foreground">Supabase (Base de données et Auth)</strong> : Données stockées en Irlande (Union Européenne). Couvert par un Accord de Traitement des Données (DPA) strict.
                </li>
                <li>
                  <strong className="text-foreground">Vercel (Serveurs web)</strong> : Hébergement du frontend.
                </li>
                 <li>
                  <strong className="text-foreground">Resend (Emails transactionnels futurs)</strong> : Pour l&apos;envoi de notifications (plateforme conforme RGPD).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                5. Durée de conservation
              </h2>
              <p>
                SAAS AGOU & CO s&apos;engage à ne pas exploiter ces données à des fins commerciales.
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  <strong className="text-foreground">Données de compte utilisateur</strong> : En cas de résiliation du compte, l&apos;utilisateur peut exporter ses données dans les 30 jours suivant la résiliation. Passé ce délai, les données sont définitivement supprimées.
                </li>
                 <li>
                  <strong className="text-foreground">Logs de sécurité techniques</strong> : Conservés sur nos serveurs pour une durée glissante n&apos;excédant pas 1 an (obligations de l&apos;hébergeur).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                6. Vos droits fondamentaux
              </h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous contrôlez vos données. Vous disposez du :
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong className="text-foreground">Droit d&apos;accès</strong> : obtenir la liste claire de ce que nous détenons.</li>
                <li><strong className="text-foreground">Droit de rectification</strong> : modifier ce qui serait erroné.</li>
                <li><strong className="text-foreground">Droit à l&apos;effacement ("droit à l&apos;oubli")</strong> : suppression ferme et définitive.</li>
                <li><strong className="text-foreground">Droit d&apos;opposition et retrait du consentement</strong> : à tout instant.</li>
                <li><strong className="text-foreground">Droit à la portabilité</strong> : recevoir l&apos;export brut de vos données.</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits ou pour toute question relative à la protection de vos données, contactez-nous à : <a href="mailto:hello@monbaito.fr" className="text-accent hover:underline">hello@monbaito.fr</a>. 
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                7. Saisine de la CNIL
              </h2>
              <p>
                Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation auprès de l&apos;autorité de contrôle française, la <strong className="text-foreground">CNIL</strong> (<a href="https://www.cnil.fr" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
