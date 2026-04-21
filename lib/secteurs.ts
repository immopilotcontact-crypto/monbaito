export interface Secteur {
  slug: string;
  label: string;
  keywords: string[];
}

export type SecteurSlug =
  | "restauration"
  | "vente"
  | "babysitting"
  | "enseignement"
  | "hotellerie"
  | "livraison"
  | "service-client"
  | "logistique"
  | "administratif"
  | "autre";

export const SECTEURS: readonly Secteur[] = [
  {
    slug: "restauration",
    label: "Restauration",
    keywords: [
      "restauration", "restaurant", "serveur", "serveuse", "cuisine", "cuisinier",
      "plongeur", "brasserie", "bistrot", "café", "bar", "fast food", "pizzeria",
      "traiteur", "self", "cantine",
    ],
  },
  {
    slug: "vente",
    label: "Vente",
    keywords: [
      "vente", "vendeur", "vendeuse", "caissier", "caissière", "commerce",
      "boutique", "magasin", "grande surface", "supermarché", "hypermarché",
      "retail", "conseiller de vente", "hôte de caisse", "hôtesse de caisse",
    ],
  },
  {
    slug: "babysitting",
    label: "Garde d'enfants",
    keywords: [
      "babysitting", "baby-sitting", "garde d'enfants", "baby sitter", "baby-sitter",
      "nounou", "nourrice", "aide à domicile enfants", "creche", "crèche",
      "assistante maternelle", "périscolaire",
    ],
  },
  {
    slug: "enseignement",
    label: "Soutien scolaire",
    keywords: [
      "soutien scolaire", "cours particuliers", "enseignement", "professeur",
      "tuteur", "tutrice", "répétiteur", "précepteur", "aide aux devoirs",
      "enseignant", "formateur", "formation", "cours à domicile",
    ],
  },
  {
    slug: "hotellerie",
    label: "Hôtellerie",
    keywords: [
      "hôtellerie", "hotel", "hôtel", "réception", "réceptionniste", "concierge",
      "gouvernante", "femme de chambre", "valet", "hébergement", "tourisme",
      "résidence", "camping", "gîte",
    ],
  },
  {
    slug: "livraison",
    label: "Livraison",
    keywords: [
      "livraison", "livreur", "livreuse", "coursier", "coursière", "uber eats",
      "deliveroo", "just eat", "colis", "transport", "vélo", "scooter",
      "messagerie", "chauffeur livreur",
    ],
  },
  {
    slug: "service-client",
    label: "Service client",
    keywords: [
      "service client", "relation client", "téléconseiller", "téléconseillers",
      "conseiller clientèle", "support client", "hotline", "centre d'appel",
      "call center", "accueil", "hôte d'accueil", "hôtesse d'accueil",
      "chargé de relation", "satisfaction client",
    ],
  },
  {
    slug: "logistique",
    label: "Logistique",
    keywords: [
      "logistique", "entrepôt", "préparateur de commandes", "magasinier",
      "cariste", "manutentionnaire", "stock", "inventaire", "supply chain",
      "picking", "packing", "plateforme logistique", "amazon", "opearteur",
    ],
  },
  {
    slug: "administratif",
    label: "Administratif",
    keywords: [
      "administratif", "secrétaire", "assistant administratif", "assistante administrative",
      "bureautique", "saisie", "data entry", "archivage", "comptabilité",
      "ressources humaines", "rh", "office manager", "back office",
    ],
  },
  {
    slug: "autre",
    label: "Autre",
    keywords: [],
  },
] as const;

export function getSecteurBySlug(slug: string): Secteur | undefined {
  return SECTEURS.find((s) => s.slug === slug);
}

export function matchesSecteur(
  title: string,
  description: string | null | undefined,
  secteurSlug: string
): boolean {
  if (secteurSlug === "autre") return true;
  const secteur = getSecteurBySlug(secteurSlug);
  if (!secteur || secteur.keywords.length === 0) return false;

  const haystack = `${title} ${description ?? ""}`.toLowerCase();
  return secteur.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}
