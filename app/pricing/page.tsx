import { redirect } from "next/navigation";
import { getStripeProducts, getSubscription } from "../stripe";
import { getSession } from "../supabase-server";

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
        <form>
          {stripeProducts.map((product) => {
            return (
              <div className="flex flex-col max-w-xs rounded-xl p-4 border border-gray-500 shadow-lg space-y-3" key={product.id}>
                <span className="text-xl">{product.name}</span>
                <span className="text-sm text-gray-500 w-2/3">{product.description}</span>
                <div className="flex flex-row space-x-2">
                  <span className="text-2xl">
                    {product.currency.toUpperCase()}
                    {" "}
                    {product.price}
                  </span>
                  <span>per request / <br/> per month</span>
                </div>
                <button
                  className="p-2 mt-2 text-xl bg-black hover:bg-gray-800 rounded-md text-white"
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
