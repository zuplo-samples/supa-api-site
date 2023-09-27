import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createRouteHandlerClient({ cookies });

  const sessionCreateUrl = requestUrl.searchParams.get("session-create-url");
  const redirectUrl = new URL(`${requestUrl.origin}/auth/callback`);
  if (sessionCreateUrl) {
    // This will send the session-create-url as a query parameter to your
    // /auth/callback endpoint. We will use this in the next step
    redirectUrl.searchParams.set("session-create-url", sessionCreateUrl);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The email confirmation link sent to the user will now redirect to
      // your /auth/callback endpoint
      emailRedirectTo: redirectUrl.toString(),
    },
  });

  if (error) {
    console.error(error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Could not authenticate user. Already registered?`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      },
    );
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=Check email to continue sign in process`,
    {
      // a 301 status is required to redirect from a POST to a GET route
      status: 301,
    },
  );
}
