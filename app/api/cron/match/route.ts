import { NextResponse } from "next/server";

// Lance le recalcul des matchs pour tous les users actifs
export async function GET(request: Request) {
  return handleMatch(request);
}
export async function POST(request: Request) {
  return handleMatch(request);
}

async function handleMatch(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monbaito.fr";
  const res = await fetch(`${base}/api/matching/compute`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const json = await res.json().catch(() => ({}));
  return NextResponse.json({ success: res.ok, ...json });
}
