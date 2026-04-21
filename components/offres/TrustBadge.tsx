interface TrustBadgeProps {
  score: number | null;
}

export function TrustBadge({ score }: TrustBadgeProps) {
  if (score === null) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
        En cours d&apos;analyse
      </span>
    );
  }

  if (score >= 75) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/15 text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {score}/100 · fiable
      </span>
    );
  }

  if (score >= 45) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-amber-500/15 text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {score}/100 · à vérifier
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-red-500/15 text-red-400">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      {score}/100 · risque
    </span>
  );
}
