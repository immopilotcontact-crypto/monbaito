export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { checkRedisRateLimit } from "@/lib/rate-limit-redis";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default ?? (pdfParseModule as any);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const rl = await checkRedisRateLimit(`cv:${session.user.id}`, 5, "1 h");
  if (!rl.allowed) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("cv");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Fichier PDF requis" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await pdfParse(buffer);
  const text = parsed.text.slice(0, 10000).trim();

  if (!text) return NextResponse.json({ error: "Impossible d'extraire le texte du PDF" }, { status: 422 });

  return NextResponse.json({ text });
}
