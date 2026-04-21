import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { checkRedisRateLimit } from "@/lib/rate-limit-redis";
import { z } from "zod";

const BodySchema = z.object({ offerId: z.string().uuid() });

const FREE_WEEKLY_LIMIT = 5;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "offerId requis" }, { status: 400 });

  // Rate limiting par user
  const rl = await checkRedisRateLimit(`letter:${session.user.id}`, 20, "1 d");
  if (!rl.allowed) return NextResponse.json({ error: "Limite quotidienne atteinte. Réessaie demain." }, { status: 429 });

  // Vérification limite Free (5/semaine)
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, cv_text, tier")
    .eq("id", session.user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  if (profile.tier === "free") {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .gte("applied_at", weekStart.toISOString());
    if ((count ?? 0) >= FREE_WEEKLY_LIMIT) {
      return NextResponse.json({ error: `Limite Free atteinte (${FREE_WEEKLY_LIMIT}/semaine). Passe Pro pour des candidatures illimitées.`, upgrade: true }, { status: 403 });
    }
  }

  // Récupère l'offre
  const { data: enriched } = await supabase
    .from("enriched_offers")
    .select("*, raw_offers(title, company_name, description, contract_type, location_city, salary_raw)")
    .eq("id", parsed.data.offerId)
    .single();

  if (!enriched) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
  const raw = (enriched as any).raw_offers;

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODELS.opus,
    max_tokens: 600,
    system: `Tu es un coach en recherche d'emploi étudiant. Rédige une lettre de motivation concise et authentique (150-200 mots) pour cet étudiant à partir de son CV et de l'offre ci-dessous. Style : naturel, jeune, sans cliché ("je suis motivé et dynamique" interdit). Mentionne 1-2 éléments précis de l'offre qui correspondent au profil. Signe avec le prénom + nom de l'étudiant. Réponds UNIQUEMENT avec le texte de la lettre, sans titre ni formatage Markdown.`,
    messages: [
      {
        role: "user",
        content: `PROFIL ÉTUDIANT :
Prénom : ${profile.first_name ?? "Étudiant"}
Nom : ${profile.last_name ?? ""}
CV : ${profile.cv_text ? profile.cv_text.slice(0, 2000) : "Non renseigné"}

OFFRE :
Poste : ${raw?.title ?? ""}
Entreprise : ${raw?.company_name ?? ""}
Localisation : ${raw?.location_city ?? ""}
Type de contrat : ${raw?.contract_type ?? ""}
Salaire : ${raw?.salary_raw ?? "Non précisé"}
Description : ${raw?.description ? raw.description.slice(0, 2000) : "Non disponible"}`,
      },
    ],
  });

  const letter = response.content[0].type === "text" ? response.content[0].text : "";

  // Sauvegarde dans user_matches.letter_generated
  await supabase
    .from("user_matches")
    .update({ letter_generated: letter })
    .eq("user_id", session.user.id)
    .eq("offer_id", parsed.data.offerId);

  return NextResponse.json({ letter });
}
