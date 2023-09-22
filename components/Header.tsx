import { getSession } from "@/app/supabase-server";
import Link from "next/link";

export default async function Header() {
  const session = await getSession();

  return (
    <header className="mt-5 flex w-full items-center justify-between border-b-2 px-2 pb-7 sm:px-4">
      <Link href="/" className="flex space-x-3">
        <h1 className="ml-2 text-2xl font-bold tracking-tight sm:text-4xl">
          SupaAPI Demo
        </h1>
      </Link>
      {session ? (
        <Link href="/auth/sign-out" className="text-lg font-semibold">
          Sign out
        </Link>
      ) : (
        <Link href="/login" className="text-lg font-semibold">
          Sign in
        </Link>
      )}
    </header>
  );
}
