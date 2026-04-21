interface TrustBadgeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

export function TrustBadge({ score, size = "md" }: TrustBadgeProps) {
  if (score === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
        Non évalué
      </span>
    );
  }

  const { label, colorClass } =
    score >= 75
      ? { label: "Fiable", colorClass: "text-emerald-400 bg-emerald-400/10" }
      : score >= 50
      ? { label: "Correct", colorClass: "text-amber-400 bg-amber-400/10" }
      : { label: "Risqué", colorClass: "text-red-400 bg-red-400/10" };

  const sizeClass =
    size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-base px-4 py-1.5" : "text-sm px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${colorClass} ${sizeClass}`}>
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-red-400"
        }`}
      />
      {score} — {label}
    </span>
  );
}
