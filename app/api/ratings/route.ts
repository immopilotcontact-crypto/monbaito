import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { offer_id, response_speed, satisfaction, trust } = body;

  if (!offer_id) return NextResponse.json({ error: "offer_id required" }, { status: 400 });

  const values: Record<string, unknown> = {
    user_id: session.user.id,
    offer_id,
    updated_at: new Date().toISOString(),
  };
  if (response_speed != null) values.response_speed = response_speed;
  if (satisfaction    != null) values.satisfaction    = satisfaction;
  if (trust           != null) values.trust           = trust;

  const { error } = await supabase
    .from("ratings")
    .upsert(values, { onConflict: "user_id,offer_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const offerId = new URL(req.url).searchParams.get("offer_id");
  if (!offerId) return NextResponse.json({ error: "offer_id required" }, { status: 400 });

  const [statsRes, myRes] = await Promise.all([
    supabase
      .from("offer_rating_stats")
      .select("*")
      .eq("offer_id", offerId)
      .maybeSingle(),
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return { data: null };
      return supabase
        .from("ratings")
        .select("response_speed,satisfaction,trust")
        .eq("offer_id", offerId)
        .eq("user_id", session.user.id)
        .maybeSingle();
    }),
  ]);

  return NextResponse.json({
    stats: statsRes.data,
    mine: myRes.data,
  });
}
