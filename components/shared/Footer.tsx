import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 — MonBaito brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/logo.png"
                alt="MonBaito"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              La plateforme IA qui trouve votre job étudiant et postule à votre place.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.95a8.2 8.2 0 0 0 4.78 1.52V7.03a4.85 4.85 0 0 1-1.02-.34z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* X (Twitter) */}
              <a
                href="#"
                aria-label="X (Twitter)"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Pour les étudiants */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Pour les étudiants</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/offres" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Voir les offres
                </Link>
              </li>
              <li>
                <Link href="/job-etudiant/paris" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Job étudiant Paris
                </Link>
              </li>
              <li>
                <Link href="/job-etudiant/lyon" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Job étudiant Lyon
                </Link>
              </li>
              <li>
                <Link href="/job-etudiant/marseille" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Job étudiant Marseille
                </Link>
              </li>
              <li>
                <Link href="/offres" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Toutes les villes
                </Link>
              </li>
              <li>
                <Link href="/#beta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Rejoindre la beta
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Secteurs */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Secteurs</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/offres?secteur=restauration" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Restauration
                </Link>
              </li>
              <li>
                <Link href="/offres?secteur=vente" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Vente
                </Link>
              </li>
              <li>
                <Link href="/offres?secteur=babysitting" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Garde d&apos;enfants
                </Link>
              </li>
              <li>
                <Link href="/offres?secteur=enseignement" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Soutien scolaire
                </Link>
              </li>
              <li>
                <Link href="/offres" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Tous les secteurs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 — Légal & contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">MonBaito</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#fondateur" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <a href="mailto:hello@monbaito.fr" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  hello@monbaito.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 MonBaito — Construit à Rouen, pour tous les étudiants de France.
          </p>
        </div>
      </div>
    </footer>
  );
}
