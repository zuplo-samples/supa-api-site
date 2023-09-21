import Link from "next/link";
import { getSession } from "./supabase-server";
import { redirect } from "next/navigation";
import { getSubscription } from "./stripe";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getSession();

  if (session) {
    if (session.user.email) {
      const subscription = await getSubscription({
        email: session.user.email,
      });

      if (subscription) {
        redirect("/account");
      } else {
        redirect("/pricing");
      }
    }
  }

  return (
    <main className="flex flex-col items-center gap-10">
      <h1 className="text-center text-8xl font-bold">
        Where APIs start making money
      </h1>
      <button className="max-w-xs p-4 text-xl bg-black hover:bg-gray-800 rounded-md text-white">
        <Link href="/login">Sign in to start</Link>
      </button>
    </main>
  );
}
