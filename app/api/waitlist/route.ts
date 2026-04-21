import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { isValidEmail } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_SALT || "monbaito-salt-2026"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = await hashIP(ip);

    const { allowed, resetIn } = checkRateLimit(ipHash);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Trop de tentatives. Réessaie dans quelques instants.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) },
        }
      );
    }

    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Adresse email invalide." },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || null;
    const utmSource = body.utm_source || null;
    const utmMedium = body.utm_medium || null;
    const utmCampaign = body.utm_campaign || null;

    const supabase = createServiceClient();

    const { error } = await supabase.from("waitlist").insert({
      email,
      source: "landing",
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      user_agent: userAgent,
      ip_hash: ipHash,
    });

    if (error) {
      if (error.code === "23505") {
        const { count } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true });

        return NextResponse.json({
          success: true,
          message: "Tu es déjà dans la liste, merci !",
          count: count || 0,
        });
      }

      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Une erreur est survenue. Réessaie dans quelques instants.",
        },
        { status: 500 }
      );
    }

    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      message: "Bienvenue à bord ! On te contacte dès le lancement de la beta.",
      count: count || 0,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue. Réessaie dans quelques instants.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Supabase count error:", error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
