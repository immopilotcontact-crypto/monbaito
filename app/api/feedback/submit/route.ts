import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { checkRedisRateLimit } from "@/lib/rate-limit-redis";
import { z } from "zod";

const BodySchema = z.object({
  matchId: z.string().uuid().optional(),
  responseReceived: z.boolean().optional(),
  responseDays: z.number().int().min(0).max(365).optional(),
  wasScam: z.boolean().optional(),
  actualHourlyRate: z.number().min(0).max(200).optional(),
  managerQuality: z.number().int().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") ?? session.user.id;
  const rl = await checkRedisRateLimit(`feedback:${ip}`, 20, "1 d");
  if (!rl.allowed) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { error } = await supabase.from("offer_feedback").insert({
    user_id: session.user.id,
    match_id: parsed.data.matchId ?? null,
    response_received: parsed.data.responseReceived ?? null,
    response_days: parsed.data.responseDays ?? null,
    was_scam: parsed.data.wasScam ?? null,
    actual_hourly_rate: parsed.data.actualHourlyRate ?? null,
    manager_quality: parsed.data.managerQuality ?? null,
    would_recommend: parsed.data.wouldRecommend ?? null,
    notes: parsed.data.notes ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
