"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Loader2, ExternalLink } from "lucide-react";

interface PostulerButtonProps {
  offreId: string;
  externalUrl: string | null;
  className?: string;
}

export function PostulerButton({ offreId, externalUrl, className = "" }: PostulerButtonProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const supabase = createClient();

  async function handleClick() {
    setChecking(true);
    const { data: { session } } = await supabase.auth.getSession();
    setChecking(false);

    if (!session) {
      router.push(`/auth/login?next=/offres/${offreId}`);
      return;
    }

    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    } else {
      router.push(`/offres/${offreId}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={checking}
      className={`inline-flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest bg-accent text-accent-foreground px-8 py-4 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {checking ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          Postuler à cette offre
          <ExternalLink size={14} />
        </>
      )}
    </button>
  );
}
