import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { getResend, FROM_EMAIL } from "@/lib/resend";

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const resend = getResend();

  // Candidatures envoyées il y a exactement 2 jours (fenêtre ±1h)
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const windowStart = new Date(twoDaysAgo.getTime() - 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(twoDaysAgo.getTime() + 60 * 60 * 1000).toISOString();

  const { data: apps } = await supabase
    .from("applications")
    .select("id, user_id, offer_id, profiles(email, first_name), enriched_offers(raw_offers(company_name, title))")
    .eq("status", "sent")
    .gte("applied_at", windowStart)
    .lte("applied_at", windowEnd);

  if (!apps?.length) return NextResponse.json({ success: true, sent: 0 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monbaito.fr";
  let sent = 0;

  for (const app of apps) {
    const profile = (app as any).profiles;
    const raw = (app as any).enriched_offers?.raw_offers;
    if (!profile?.email) continue;

    const companyName = raw?.company_name ?? "l'entreprise";
    const jobTitle = raw?.title ?? "ce poste";
    const firstName = profile.first_name ?? "toi";

    const feedbackBase = `${siteUrl}/api/feedback/submit`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: profile.email,
      subject: `Ça a donné quoi chez ${companyName} ? 🎯`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;color:#111">
          <h2>Hey ${firstName} 👋</h2>
          <p>Tu as postulé pour <strong>${jobTitle}</strong> chez <strong>${companyName}</strong> il y a 2 jours.</p>
          <p>C'était comment ? Aide les autres étudiants MonBaito avec ton retour (anonyme) :</p>
          <div style="margin:24px 0;display:flex;gap:12px;flex-direction:column">
            <a href="${siteUrl}/candidatures" style="display:inline-block;background:#ea7e7e;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600">
              📭 Pas encore de réponse
            </a>
            <a href="${siteUrl}/candidatures" style="display:inline-block;background:#10b981;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600">
              ✅ J'ai eu une réponse
            </a>
            <a href="${siteUrl}/candidatures" style="display:inline-block;background:#ef4444;color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600">
              ⚠️ C'était une arnaque
            </a>
          </div>
          <p style="color:#666;font-size:14px">Ton retour aide à améliorer le Trust Score et à protéger d'autres étudiants.</p>
          <p style="color:#999;font-size:12px">Tu reçois cet email car tu as utilisé MonBaito. <a href="${siteUrl}/profil">Me désabonner</a></p>
        </div>
      `,
    });
    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
