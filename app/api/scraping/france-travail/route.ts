export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

let ftToken: { value: string; expiresAt: number } | null = null;

async function getFTToken(): Promise<string> {
  if (ftToken && Date.now() < ftToken.expiresAt - 30_000) return ftToken.value;
  const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("France Travail credentials not configured");
  const res = await fetch(
    "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "api_offresdemploiv2 o2dsoffre",
      }),
    }
  );
  if (!res.ok) throw new Error(`FT auth failed: ${res.status}`);
  const data = await res.json();
  ftToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return ftToken.value;
}

const FTOfferSchema = z.object({
  id: z.string(),
  intitule: z.string(),
  description: z.string().optional(),
  dateCreation: z.string().optional(),
  lieuTravail: z.object({ libelle: z.string().optional(), codePostal: z.string().optional() }).optional(),
  entreprise: z.object({ nom: z.string().optional(), siret: z.string().optional() }).optional(),
  salaire: z.object({ libelle: z.string().optional(), commentaire: z.string().optional() }).optional(),
  typeContrat: z.string().optional(),
  origineOffre: z.object({ urlOrigine: z.string().optional() }).optional(),
}).passthrough();

function mapContractType(t: string | undefined): string {
  if (!t) return "other";
  const u = t.toUpperCase();
  if (["CDD", "MIS"].includes(u)) return "student";
  if (u.includes("ALT") || u.includes("APP") || u.includes("PRO")) return "alternance";
  if (u === "SAI") return "seasonal";
  if (u === "STG") return "internship";
  return "other";
}

function parseSalary(libelle: string | undefined) {
  if (!libelle) return { min: null, max: null, period: null };
  const hourly = libelle.match(/(\d+[,.]?\d*)\s*€?\s*\/?\s*h/i);
  if (hourly) return { min: parseFloat(hourly[1].replace(",", ".")), max: null, period: "hour" as const };
  const monthly = libelle.match(/(\d+[,.]?\d*)\s*€?\s*\/?\s*(mois|mensuel)/i);
  if (monthly) return { min: parseFloat(monthly[1].replace(",", ".")), max: null, period: "month" as const };
  return { min: null, max: null, period: null };
}

const QUERIES = [
  "typeContrat=CDD&tempsPlein=false&motsCles=etudiant",
  "typeContrat=CDD&tempsPlein=false&motsCles=serveur",
  "typeContrat=CDD&tempsPlein=false&motsCles=caissier",
  "typeContrat=CDD&tempsPlein=false&motsCles=livreur",
  "typeContrat=CDD&tempsPlein=false&motsCles=baby-sitter",
  "typeContrat=CDD&tempsPlein=false&motsCles=vendeur",
  "typeContrat=SAI&motsCles=etudiant",
  "typeContrat=SAI",
  "typeContrat=MIS&tempsPlein=false",
];

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getFTToken();
    const now = new Date().toISOString();

    // Toutes les requêtes France Travail en parallèle
    const responses = await Promise.allSettled(
      QUERIES.map((q) =>
        fetch(
          `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${q}&range=0-49&sort=1`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
        ).then((r) => (r.ok ? r.json() : { resultats: [] }))
      )
    );

    // Collecte et déduplique toutes les offres par source_id
    const seen = new Set<string>();
    const rows: Record<string, unknown>[] = [];

    for (const result of responses) {
      if (result.status !== "fulfilled") continue;
      const offers = (result.value?.resultats ?? []) as unknown[];
      for (const raw of offers) {
        const parsed = FTOfferSchema.safeParse(raw);
        if (!parsed.success || seen.has(parsed.data.id)) continue;
        seen.add(parsed.data.id);
        const o = parsed.data;
        const salary = parseSalary(o.salaire?.libelle);
        const description = o.description
          ? sanitizeHtml(o.description, { allowedTags: [], allowedAttributes: {} })
          : null;
        rows.push({
          source: "france_travail",
          source_id: o.id,
          url: o.origineOffre?.urlOrigine ?? null,
          title: o.intitule,
          company_name: o.entreprise?.nom ?? null,
          company_siren: o.entreprise?.siret?.slice(0, 9) ?? null,
          description,
          salary_raw: o.salaire?.libelle ?? null,
          salary_min: salary.min,
          salary_max: salary.max,
          salary_period: salary.period,
          location_city: o.lieuTravail?.libelle?.split(" - ")[1] ?? o.lieuTravail?.libelle ?? null,
          location_postal: o.lieuTravail?.codePostal ?? null,
          contract_type: mapContractType(o.typeContrat),
          posted_at: o.dateCreation ?? null,
          raw_data: o as Record<string, unknown>,
          scraped_at: now,
        });
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: true, inserted: 0 });
    }

    // Upsert groupé en lots de 100
    let inserted = 0;
    const supabase = createServiceClient();
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase
        .from("raw_offers")
        .upsert(batch, { onConflict: "source,source_id" });
      if (!error) inserted += batch.length;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error("[france-travail]", err);
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
}
