import { Search } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  filtered?: boolean;
  onReset?: () => void;
}

export function EmptyState({ filtered = false, onReset }: EmptyStateProps) {
  if (filtered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Search size={48} className="text-muted-foreground mb-5" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucune offre ne correspond à tes critères.
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Essaie d&apos;élargir ta recherche.
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="border border-accent/50 text-accent text-sm font-medium px-5 py-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Minimal SVG: person with magnifying glass */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-5"
        aria-hidden="true"
      >
        {/* Body */}
        <circle cx="32" cy="20" r="10" stroke="hsl(354 80% 57%)" strokeWidth="2.5" />
        <path
          d="M12 60c0-11 9-20 20-20s20 9 20 20"
          stroke="hsl(354 80% 57%)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Magnifying glass */}
        <circle cx="58" cy="50" r="12" stroke="hsl(354 80% 57%)" strokeWidth="2.5" />
        <line
          x1="67"
          y1="59"
          x2="75"
          y2="67"
          stroke="hsl(354 80% 57%)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Les offres arrivent bientôt.
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        On scanne les sources en ce moment. Inscris-toi à la beta pour être notifié dès que les
        premières offres sont disponibles.
      </p>
      <Link
        href="/#beta"
        className="bg-accent text-accent-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        Rejoindre la beta
      </Link>
    </div>
  );
}
