import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { priceType } = await req.json();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (priceType === "starter") {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_STARTER_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/oto?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/starter`,
    });

    return NextResponse.json({ url: session.url });
  }

  if (priceType === "machine") {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_MACHINE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/machine?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/oto`,
    });

    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Invalid price type" }, { status: 400 });
}
