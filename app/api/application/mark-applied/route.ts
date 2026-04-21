import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

const BodySchema = z.object({
  offerId: z.string().uuid(),
  matchId: z.string().uuid().optional(),
  letterText: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { offerId, matchId, letterText } = parsed.data;

  // Insère la candidature
  const { data: app, error } = await supabase.from("applications").insert({
    user_id: session.user.id,
    offer_id: offerId,
    letter_text: letterText ?? null,
    status: "sent",
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Met à jour user_matches.applied_at
  if (matchId) {
    await supabase
      .from("user_matches")
      .update({ applied_at: new Date().toISOString() })
      .eq("id", matchId)
      .eq("user_id", session.user.id);
  }

  return NextResponse.json({ success: true, applicationId: app.id });
}
