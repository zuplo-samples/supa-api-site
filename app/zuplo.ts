import { stripe } from "./stripe";

export const getOrCreateZuploConsumer = async ({
  email,
}: {
  email: string;
}) => {
  const keyPrefix = email.replace(/[@.]/g, "-");
  const response = await fetch(
    `${process.env.ZUPLO_BUCKET_URL}/consumers/${keyPrefix}`,
    {
      headers: {
        authorization: `Bearer ${process.env.ZUPLO_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const createAPIKeyResponse = await createAPIKeyConsumer({
      email,
    });
    const createAPIKeyResponseJSON = await createAPIKeyResponse.json();
    return createAPIKeyResponseJSON;
  }

  const responseJSON = await response.json();

  return responseJSON;
};

// Uses the Dev API of Zuplo (https://dev.zuplo.com) to create a new API key consumer.
// We will add the email as a manager of the consumer and add the Stripe customer ID
// as metadata to key.
const createAPIKeyConsumer = async ({ email }: { email: string }) => {
  const stripeCustomer = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (stripeCustomer.data.length === 0) {
    throw new Error("Stripe customer not found");
  }

  const stripeCustomerData = stripeCustomer.data[0];
  const keyPrefix = email.replace(/[@.]/g, "-");
  const keyName = `${keyPrefix}`;

  const body = {
    name: keyName,
    managers: [email],
    metadata: {
      // This will be used by the your Zup API to retrieve the Stripe customer ID
      stripeCustomerId: stripeCustomerData.id,
      orgId: 1,
    },
    tags: {
      email,
    },
  };

  const response = await fetch(
    `${process.env.ZUPLO_BUCKET_URL}/consumers/?with-api-key=true`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.ZUPLO_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  return response;
};
