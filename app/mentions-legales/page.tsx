import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales réglementaires du site MonBaito.",
};

export default function MentionsLegales() {
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

          <h1 className="heading-1 text-3xl md:text-4xl mb-8">Mentions légales</h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p>
              <em>Dernière mise à jour : mars 2026.</em>
              <br />
              Conformément aux dispositions des articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique (L.C.E.N.), il est porté à la connaissance des utilisateurs et visiteurs du site MonBaito les présentes mentions légales.
            </p>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                1. Éditeur du site
              </h2>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  <strong className="text-foreground">Raison sociale :</strong> SAAS AGOU & CO
                </li>
                <li>
                  <strong className="text-foreground">Statut juridique :</strong> Auto-entrepreneur
                </li>
                <li>
                  <strong className="text-foreground">Siège social :</strong> 8 Place Pablo Picasso, 76380 Canteleu, France
                </li>
                <li>
                  <strong className="text-foreground">SIREN :</strong> 101 600 773
                </li>
                <li>
                  <strong className="text-foreground">Directeur de la publication :</strong> Michel Elyas
                </li>
                <li>
                  <strong className="text-foreground">Email de contact :</strong>{" "}
                  <a href="mailto:hello@monbaito.fr" className="text-accent hover:underline">
                    hello@monbaito.fr
                  </a>
                </li>
                 <li>
                  <strong className="text-foreground">Site web :</strong> www.monbaito.fr
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                2. Hébergement du site
              </h2>
              <p>L&apos;hébergement du site est assuré par :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2 mb-4">
                <li>
                  <strong className="text-foreground">Hébergeur :</strong> Vercel Inc.
                </li>
                <li>
                  <strong className="text-foreground">Adresse :</strong> 340 Pine Street, Suite 900, San Francisco, CA 94104, États-Unis
                </li>
                <li>
                  <strong className="text-foreground">Site web :</strong> <a href="https://vercel.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                3. Propriété intellectuelle
              </h2>
              <p>
                L&apos;ensemble des éléments composant le site MonBaito (textes, graphismes, logotypes, icônes, images, code source, architecture, algorithmes) sont la propriété exclusive de SAAS AGOU & CO et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p className="mt-2">
                Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie de ces éléments, quel que soit le moyen ou le procédé utilisé (y compris par extraction automatisée ou web scraping), est strictement interdite sans l&apos;autorisation écrite préalable de SAAS AGOU & CO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                4. Données personnelles
              </h2>
              <p>
                Les informations collectées sur le site MonBaito font lapos;objet d&apos;un traitement informatique destiné à la gestion des comptes utilisateurs et à la fourniture du service. Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données.
              </p>
              <p className="mt-2">
                Pour exercer ces droits ou pour toute question relative à la protection de vos données, contactez-nous à : <a href="mailto:hello@monbaito.fr" className="text-accent hover:underline">hello@monbaito.fr</a>
              </p>
              <p className="mt-2">
                Pour plus de détails, consultez notre <Link href="/confidentialite" className="text-accent hover:underline">Politique de confidentialité</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                5. Limitation de responsabilité
              </h2>
              <p>
                SAAS AGOU & CO s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations publiées sur le site MonBaito. Toutefois, elle ne peut garantir l&apos;exhaustivité, l&apos;exactitude ou l&apos;actualité de ces informations à tout moment. L&apos;éditeur ne saurait être tenu responsable du contenu des offres externes, ni d&apos;éventuelles fraudes avérées sur des sites tiers malgré les filtres mis en place par l&apos;Intelligence Artificielle de MonBaito.
              </p>
               <p className="mt-2">
                En conséquence, SAAS AGOU & CO décline toute responsabilité pour les dommages directs ou indirects résultant de l&apos;utilisation du site, d&apos;une interruption de service ou d&apos;une inexactitude des informations publiées.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                6. Liens hypertextes
              </h2>
              <p>
                Le site MonBaito peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre informatif uniquement. SAAS AGOU & CO n&apos;exerce aucun contrôle sur le contenu de ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-foreground mb-3">
                7. Droit applicable et juridiction
              </h2>
              <p>
                Les présentes mentions légales sont soumises au droit français. En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes, et à défaut d&apos;accord amiable, les tribunaux compétents du ressort de Rouen seront seuls compétents.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
