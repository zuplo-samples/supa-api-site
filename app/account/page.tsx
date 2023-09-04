import { redirect } from "next/navigation";
import { getSession } from "../supabase-server";
import { getSubscription } from "../stripe";
import Link from "next/link";
import { getOrCreateZuploConsumer } from "../zuplo";

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await getSession();

  if (!session || !session.user.email) {
    return redirect("/signin");
  }

  const subscription = await getSubscription({
    email: session.user.email,
  });

  if (subscription === null) {
    return redirect("/pricing");
  }

  await getOrCreateZuploConsumer({
    email: session.user.email,
  });

  return (
    <div className="flex flex-col  items-center justify-center gap-10">
      <h1 className="text-center text-5xl">Start using the API</h1>

      <Link
        className="max-w-xs rounded-md bg-black p-4 text-xl text-white hover:bg-gray-800"
        href={process.env.NEXT_PUBLIC_ZUPLO_API_URL + "/docs"}
      >
        Go to API docs
      </Link>
    </div>
  );
}
