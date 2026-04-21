export interface Ville {
  slug: string;
  label: string;
  departement: string;
  region: string;
}

export type VilleSlug =
  | "paris"
  | "lyon"
  | "marseille"
  | "bordeaux"
  | "toulouse"
  | "lille"
  | "nantes"
  | "rennes"
  | "rouen"
  | "strasbourg"
  | "montpellier"
  | "nice"
  | "grenoble"
  | "tours"
  | "dijon"
  | "angers"
  | "clermont-ferrand"
  | "caen"
  | "metz"
  | "canteleu";

export const VILLES: readonly Ville[] = [
  { slug: "paris", label: "Paris", departement: "75", region: "Île-de-France" },
  { slug: "lyon", label: "Lyon", departement: "69", region: "Auvergne-Rhône-Alpes" },
  { slug: "marseille", label: "Marseille", departement: "13", region: "PACA" },
  { slug: "bordeaux", label: "Bordeaux", departement: "33", region: "Nouvelle-Aquitaine" },
  { slug: "toulouse", label: "Toulouse", departement: "31", region: "Occitanie" },
  { slug: "lille", label: "Lille", departement: "59", region: "Hauts-de-France" },
  { slug: "nantes", label: "Nantes", departement: "44", region: "Pays de la Loire" },
  { slug: "rennes", label: "Rennes", departement: "35", region: "Bretagne" },
  { slug: "rouen", label: "Rouen", departement: "76", region: "Normandie" },
  { slug: "strasbourg", label: "Strasbourg", departement: "67", region: "Grand Est" },
  { slug: "montpellier", label: "Montpellier", departement: "34", region: "Occitanie" },
  { slug: "nice", label: "Nice", departement: "06", region: "PACA" },
  { slug: "grenoble", label: "Grenoble", departement: "38", region: "Auvergne-Rhône-Alpes" },
  { slug: "tours", label: "Tours", departement: "37", region: "Centre-Val de Loire" },
  { slug: "dijon", label: "Dijon", departement: "21", region: "Bourgogne-Franche-Comté" },
  { slug: "angers", label: "Angers", departement: "49", region: "Pays de la Loire" },
  { slug: "clermont-ferrand", label: "Clermont-Ferrand", departement: "63", region: "Auvergne-Rhône-Alpes" },
  { slug: "caen", label: "Caen", departement: "14", region: "Normandie" },
  { slug: "metz", label: "Metz", departement: "57", region: "Grand Est" },
  { slug: "canteleu", label: "Canteleu", departement: "76", region: "Normandie" },
] as const;

export function getVilleBySlug(slug: string): Ville | undefined {
  return VILLES.find((v) => v.slug === slug);
}

export function getRelatedVilles(ville: Ville, count = 4): Ville[] {
  // Priorité : même département, puis même région
  const sameDept = VILLES.filter(
    (v) => v.departement === ville.departement && v.slug !== ville.slug
  );
  const sameRegion = VILLES.filter(
    (v) =>
      v.region === ville.region &&
      v.departement !== ville.departement &&
      v.slug !== ville.slug
  );
  return [...sameDept, ...sameRegion].slice(0, count);
}
