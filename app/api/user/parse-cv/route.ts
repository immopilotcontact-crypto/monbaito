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

  if (file.type && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 2 Mo)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Valider la signature magic bytes PDF (%PDF)
  if (buffer.length < 4 || buffer.slice(0, 4).toString("ascii") !== "%PDF") {
    return NextResponse.json({ error: "Le fichier doit être un PDF valide" }, { status: 400 });
  }

  const parsed = await pdfParse(buffer);
  const text = parsed.text.slice(0, 10000).trim();

  if (!text) return NextResponse.json({ error: "Impossible d'extraire le texte du PDF" }, { status: 422 });

  return NextResponse.json({ text });
}
