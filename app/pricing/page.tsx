import { redirect } from "next/navigation";
import { getStripeProducts, getSubscription } from "../stripe";
import { getSession } from "../supabase-server";
import Messages from "../login/messages";

export default async function PricingPage() {
  const session = await getSession();
  const stripeProducts = await getStripeProducts();

  if (!session || !session.user.email) {
    redirect("/login");
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
        <Messages />
        <form>
          {stripeProducts.map((product) => {
            return (
              <div
                className="flex max-w-xs flex-col space-y-3 rounded-xl border border-gray-500 p-4 shadow-lg"
                key={product.id}
              >
                <span className="text-xl">{product.name}</span>
                <span className="w-2/3 text-sm text-gray-500">
                  {product.description}
                </span>
                <div className="flex flex-row space-x-2">
                  <span className="text-2xl">
                    {product.currency.toUpperCase()} {product.price}
                  </span>
                  <span>
                    per request / <br /> per month
                  </span>
                </div>
                <button
                  className="mt-2 rounded-md bg-black p-2 text-xl text-white hover:bg-gray-800"
                  formAction={`/api/checkout?priceId=${product.priceId}`}
                  formMethod="POST"
                >
                  Subscribe
                </button>
              </div>
            );
          })}
        </form>
      </div>
    </div>
  );
}
