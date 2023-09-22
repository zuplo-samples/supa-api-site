import { cookies, headers } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getURL } from "@/utils/helpers";
import { createOrGetCustomer, stripe } from "@/app/stripe";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 1. Get the priceId from the query params
  const requestUrl = new URL(req.url);
  const searchParams = new URLSearchParams(requestUrl.search);
  const priceId = searchParams.get("priceId");

  if (!priceId) {
    return NextResponse.redirect(
      `${requestUrl.origin}/pricing?error=Price is not defined`,
      {
        status: 301,
      },
    );
  }

  try {
    // 2. Get the user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${requestUrl.origin}/pricing?error=User is not signed up`,
        {
          status: 301,
        },
      );
    }

    // 3. Get the Stripe Price object and the Stripe customer object

    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
    } catch (err) {
      return NextResponse.redirect(
        `${requestUrl.origin}/pricing?error=Price is not defined`,
        {
          status: 301,
        },
      );
    }

    if (!user.email) {
      return NextResponse.redirect(
        `${requestUrl.origin}/pricing?error=User email is not defined`,
        {
          status: 301,
        },
      );
    }

    const stripeCustomer = await createOrGetCustomer({
      email: user.email,
    });

    if (!stripeCustomer) {
      return NextResponse.redirect(
        `${requestUrl.origin}/pricing?error=Could not create or get customer from Stripe`,
        {
          status: 301,
        },
      );
    }

    // 4. Create a checkout session in Stripe
    if (price.type !== "recurring") {
      return NextResponse.redirect(
        `${requestUrl.origin}/pricing?error=Pricing model is not supported`,
        {
          status: 301,
        },
      );
    }

    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        customer: stripeCustomer.id,
        customer_update: {
          address: "auto",
          name: "auto",
          shipping: "never",
        },
        line_items: [
          {
            price: price.id,
          },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        success_url: `${getURL()}/account`,
        cancel_url: `${getURL()}/`,
      });
    } catch (err) {
      return NextResponse.redirect(
        `${requestUrl.origin}/pricing?error=Could not create checkout session`,
        {
          status: 301,
        },
      );
    }

    if (!stripeSession?.url) {
      return NextResponse.redirect(
        `${requestUrl.origin}/pricing?error=Could not create checkout session`,
        {
          status: 301,
        },
      );
    }

    return NextResponse.redirect(stripeSession.url, {
      status: 301,
    });
  } catch (err: any) {
    console.log(err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
