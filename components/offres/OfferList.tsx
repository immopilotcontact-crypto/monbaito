import type { EnrichedOfferWithRaw } from "@/types/database";
import { OfferCard } from "./OfferCard";
import { EmptyState } from "./EmptyState";

interface OfferListProps {
  offres: EnrichedOfferWithRaw[];
  loading?: boolean;
}

export function OfferList({ offres }: OfferListProps) {
  if (offres.length === 0) {
    return <EmptyState filtered={false} />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {offres.map((o) => (
        <OfferCard offer={o} key={o.id} />
      ))}
    </div>
  );
}
