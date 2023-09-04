import { redirect } from "next/navigation";
import { getStripeProducts, getSubscription } from "../stripe";
import { getSession } from "../supabase-server";

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const session = await getSession();
  const stripeProducts = await getStripeProducts();

  if (!session || !session.user.email) {
    redirect("/signin");
  }

  const subscription = await getSubscription({
    email: session.user.email,
  });

  if (subscription) {
    redirect("/account");
  }

  if (!stripeProducts) {
    alert("No products found");
    return <></>;
  }

  return (
    <div className="flex flex-col justify-between gap-10">
      <h1 className="text-center text-5xl">Choose a subscription plan</h1>
      <div className="flex justify-center gap-x-10">
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        <div
          dangerouslySetInnerHTML={{
            __html: `
            <stripe-pricing-table
              pricing-table-id="prctbl_1NG34MB1fwUIXnUbQDYUwfiW"
              publishable-key="pk_test_51NG2yoB1fwUIXnUbe2HFOrRqdBOn5nrutcQovulTdjhzALqHS3ArVcFdO9zmyYfLwCDxkqgCdhZdehGaJxV2TvR300vp7lMlOQ"
              ></stripe-pricing-table>
            `,
          }}
        />
      </div>
    </div>
  );
}
