import Messages from "./messages";

export default function Login({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="m-auto flex w-80 max-w-lg flex-col justify-center p-3">
      <form
        className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground"
        action={`/api/auth/sign-in${
          typeof searchParams?.["session-create-url"] === "string"
            ? `?session-create-url=${encodeURIComponent(
                searchParams["session-create-url"],
              )}`
            : ""
        }`}
        method="post"
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="mb-6 rounded-md border bg-inherit px-4 py-2"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="mb-6 rounded-md border bg-inherit px-4 py-2"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button className="mb-2 rounded bg-green-700 px-4 py-2 text-white">
          Sign In
        </button>
        <button
          formAction={`/api/auth/sign-up${
            typeof searchParams?.["session-create-url"] === "string"
              ? `?session-create-url=${encodeURIComponent(
                  searchParams["session-create-url"],
                )}`
              : ""
          }`}
          className="mb-2 rounded border border-gray-700 px-4 py-2 text-black dark:text-white"
        >
          Sign Up
        </button>
        <Messages />
      </form>
    </div>
  );
}
