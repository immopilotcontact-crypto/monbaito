import { NextResponse } from "next/server";

// Apify scraping — stub MVP (activer une fois le compte Apify configuré)
// Sources ciblées : Hellowork, JobTeaser, Jobijoba
export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    return NextResponse.json({ success: true, inserted: 0, note: "APIFY_API_TOKEN not configured" });
  }

  // TODO: Implémenter les acteurs Apify pour Hellowork et JobTeaser
  // Exemple : apify.com/apify/hellowork-jobs-scraper
  // const run = await fetch(`https://api.apify.com/v2/acts/apify~hellowork-jobs/runs`, {
  //   method: "POST", headers: { Authorization: `Bearer ${apifyToken}` },
  //   body: JSON.stringify({ query: "job étudiant", location: "France" })
  // })
  // const runData = await run.json()
  // Puis récupérer les résultats et les insérer comme raw_offers

  return NextResponse.json({ success: true, inserted: 0, note: "Apify stub — à implémenter en Phase 3" });
}
