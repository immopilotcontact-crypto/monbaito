import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const uid = session.user.id;

  const [profile, applications, feedback] = await Promise.all([
    supabase.from("profiles").select("id,email,first_name,last_name,level,field,city,postal_code,mobility_km,looking_for,min_hourly_rate,red_flags,tier,created_at").eq("id", uid).single(),
    supabase.from("applications").select("offer_id,letter_text,applied_at,status").eq("user_id", uid),
    supabase.from("offer_feedback").select("response_received,response_days,was_scam,manager_quality,would_recommend,notes,created_at").eq("user_id", uid),
  ]);

  const export_data = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    applications: applications.data ?? [],
    feedback: feedback.data ?? [],
  };

  return new NextResponse(JSON.stringify(export_data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="monbaito-mes-donnees-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
