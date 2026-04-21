"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { VILLES } from "@/lib/villes";

interface SearchBarProps {
  defaultQ?: string;
  defaultVille?: string;
  defaultType?: string;
  onSearch: (q: string, ville: string, type: string) => void;
}

export function SearchBar({
  defaultQ = "",
  defaultVille = "",
  defaultType = "",
  onSearch,
}: SearchBarProps) {
  const [q, setQ] = useState(defaultQ);
  const [ville, setVille] = useState(defaultVille);
  const [type, setType] = useState(defaultType);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(q, ville, type);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm"
    >
      <div className="flex flex-col md:flex-row">
        {/* Champ 1 : Quel job ? */}
        <div className="flex items-center flex-1 border-b md:border-b-0 md:border-r border-border/50 px-4 py-3">
          <Search size={16} className="text-muted-foreground flex-shrink-0 mr-3" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Serveur, caissier, babysitting..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Champ 2 : Quelle ville ? */}
        <div className="flex items-center flex-1 border-b md:border-b-0 md:border-r border-border/50 px-4 py-3">
          <MapPin size={16} className="text-muted-foreground flex-shrink-0 mr-3" />
          <input
            type="text"
            list="villes-list"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Paris, Lyon, Bordeaux..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <datalist id="villes-list">
            {VILLES.map((v) => (
              <option key={v.slug} value={v.label} />
            ))}
          </datalist>
        </div>

        {/* Champ 3 : Quel type ? */}
        <div className="flex items-center flex-1 border-b md:border-b-0 md:border-r border-border/50 px-4 py-3">
          <Briefcase size={16} className="text-muted-foreground flex-shrink-0 mr-3" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer"
          >
            <option value="">Tous les contrats</option>
            <option value="student">Job étudiant</option>
            <option value="internship">Stage</option>
            <option value="alternance">Alternance</option>
            <option value="seasonal">Saisonnier</option>
          </select>
        </div>

        {/* Bouton Rechercher */}
        <button
          type="submit"
          className="bg-accent text-accent-foreground font-semibold px-8 py-3 hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
        >
          Rechercher
        </button>
      </div>
    </form>
  );
}
