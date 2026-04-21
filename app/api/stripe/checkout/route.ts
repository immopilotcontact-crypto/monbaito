import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getStripe, STRIPE_PRICES } from "@/lib/stripe";
import { z } from "zod";

const BodySchema = z.object({ plan: z.enum(["monthly", "yearly"]) });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "plan invalide" }, { status: 400 });

  const priceId = parsed.data.plan === "monthly" ? STRIPE_PRICES.proMonthly : STRIPE_PRICES.proYearly;
  if (!priceId) return NextResponse.json({ error: "Stripe prices not configured" }, { status: 500 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", session.user.id)
    .single();

  const stripe = getStripe();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monbaito.fr";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : profile?.email ?? session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings/billing?success=1`,
    cancel_url: `${origin}/settings/billing?cancelled=1`,
    metadata: { userId: session.user.id },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
