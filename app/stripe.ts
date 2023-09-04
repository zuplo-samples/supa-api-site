import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
});

export const getSubscription = async ({ email }: { email: string }) => {
  try {
    const customer = await stripe.customers.list({
      limit: 1,
      email,
    });

    if (customer.data.length === 0) {
      return null;
    }

    const subscription = await stripe.subscriptions.list({
      limit: 1,
      customer: customer.data[0].id,
    });

    if (subscription.data.length === 0) {
      return null;
    }

    return subscription.data[0];
  } catch (err) {
    console.log(err);
    return null;
  }
};

export type StripeProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceId: string;
  currency: string;
};

export const getStripeProducts = async (): Promise<StripeProduct[] | null> => {
  try {
    const subscriptions = await stripe.products.list({
      limit: 100,
    });

    const prices = await stripe.prices.list({
      limit: 100,
    });

    const data = subscriptions.data
      .map((subscription) => {
        const price = prices.data.find(
          (price) => price.product === subscription.id,
        );

        if (!price) {
          return null;
        }

        return {
          id: subscription.id,
          name: subscription.name,
          description: subscription.description,
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          priceId: price.id,
          currency: price.currency,
        };
      })
      .filter(
        (subscription): subscription is NonNullable<typeof subscription> =>
          subscription !== null,
      );

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
