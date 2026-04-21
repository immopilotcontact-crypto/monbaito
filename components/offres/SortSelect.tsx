"use client";

interface SortSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="text-sm text-muted-foreground whitespace-nowrap"
      >
        Trier par :
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card border border-border/50 text-sm text-foreground rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-border transition-colors"
      >
        <option value="">Plus récent</option>
        <option value="trust">Trust Score</option>
        <option value="salaire">Salaire</option>
      </select>
    </div>
  );
}
