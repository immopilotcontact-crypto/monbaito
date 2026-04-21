import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { embedText } from "@/lib/openai-client";

export async function POST() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("cv_text")
    .eq("id", session.user.id)
    .single();

  if (!profile?.cv_text) return NextResponse.json({ success: false, reason: "Pas de CV" });

  const embedding = await embedText(profile.cv_text);
  await supabase.from("profiles").update({ cv_embedding: embedding }).eq("id", session.user.id);

  return NextResponse.json({ success: true });
}
