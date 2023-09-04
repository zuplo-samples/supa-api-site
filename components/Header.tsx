import { getSession } from "@/app/supabase-server";
import Link from "next/link";
import SignOutButton from "./SingoutButton";

export default async function Header() {
  const session = await getSession();

  return (
    <header className="mt-5 flex w-full items-center justify-between border-b-2 px-2 pb-7 sm:px-4">
      <Link href="/" className="flex space-x-3">
        <h1 className="ml-2 text-2xl font-bold tracking-tight sm:text-4xl">
          Supaweek
        </h1>
      </Link>
      {session ? (
        <SignOutButton />
      ) : (
        <Link href="/signin" className="text-lg font-semibold">
          Sign in
        </Link>
      )}
    </header>
  );
}
