"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { OfferCard } from "@/components/app/OfferCard";
import { RefreshCw, AlertCircle, Briefcase, Send, TrendingUp, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { UserMatchWithOffer } from "@/types/database";

const CONTRACT_FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "student_job", label: "Job étudiant" },
  { value: "alternance", label: "Alternance" },
  { value: "internship", label: "Stage" },
  { value: "seasonal", label: "Saisonnier" },
];

interface Stats {
  matchCount: number;
  appCount: number;
  replyCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{ first_name: string | null } | null>(null);
  const [matches, setMatches] = useState<UserMatchWithOffer[]>([]);
  const [stats, setStats] = useState<Stats>({ matchCount: 0, appCount: 0, replyCount: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/auth/login"); return; }

    const { data: prof } = await supabase.from("profiles").select("first_name").eq("id", session.user.id).single();
    if (!prof) { router.push("/onboarding"); return; }
    setProfile(prof);

    const [matchesRes, appsRes] = await Promise.all([
      supabase
        .from("user_matches")
        .select(`*, enriched_offers(*, raw_offers(*))`)
        .eq("user_id", session.user.id)
        .eq("dismissed", false)
        .order("match_score", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase
        .from("applications")
        .select("id, status")
        .eq("user_id", session.user.id),
    ]);

    const apps = appsRes.data ?? [];
    setMatches((matchesRes.data as unknown as UserMatchWithOffer[]) ?? []);
    setStats({
      matchCount: (matchesRes.data ?? []).length,
      appCount: apps.length,
      replyCount: apps.filter((a) => a.status !== "sent" && a.status !== "ghosted").length,
    });
    setLoading(false);
  }, [supabase, router, page]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/matching/compute", { method: "POST", headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` } });
      await loadData();
      toast.success("Offres actualisées !");
    } catch {
      toast.error("Erreur lors de l'actualisation");
    }
    setRefreshing(false);
  }

  async function handleDismiss(matchId: string) {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    await supabase.from("user_matches").update({ dismissed: true }).eq("id", matchId);
  }

  const filtered =
    filter === "all"
      ? matches
      : matches.filter((m) => {
          const ct = m.enriched_offers.raw_offers.contract_type;
          return (
            (filter === "student_job" && ct === "student") ||
            (filter === "alternance" && ct === "alternance") ||
            (filter === "internship" && ct === "internship") ||
            (filter === "seasonal" && ct === "seasonal")
          );
        });

  const STAT_CARDS = [
    { label: "Offres matchées", value: stats.matchCount, icon: ShieldCheck, color: "text-accent" },
    { label: "Candidatures", value: stats.appCount, icon: Send, color: "text-blue-400" },
    { label: "Réponses reçues", value: stats.replyCount, icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Bonjour{profile?.first_name ? `, ${profile.first_name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Chargement…" : `${filtered.length} offre${filtered.length !== 1 ? "s" : ""} sélectionnée${filtered.length !== 1 ? "s" : ""} pour toi`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border/50 rounded-xl p-4">
              <Icon size={18} className={`${color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CONTRACT_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f.value
                ? "bg-accent/15 border-accent/40 text-accent"
                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-card rounded-2xl animate-pulse border border-border/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center bg-card rounded-2xl border border-border/50">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Briefcase size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {matches.length === 0
                ? "Aucune offre personnalisée pour l'instant."
                : "Aucune offre pour ce filtre."}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {matches.length === 0
                ? "Les offres matchées arriveront dès que le moteur tournera. En attendant, explore toutes les offres."
                : "Essaie un autre filtre ou réinitialise."}
            </p>
          </div>
          <Link
            href="/offres"
            className="text-sm font-medium bg-accent text-accent-foreground px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Voir toutes les offres
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((match) => (
            <OfferCard key={match.id} match={match} onDismiss={handleDismiss} />
          ))}
          {filtered.length === PAGE_SIZE && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-xl hover:bg-card transition-colors"
            >
              Voir plus d&apos;offres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
