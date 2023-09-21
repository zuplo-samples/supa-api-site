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

  // Read the user data from the sign-in response
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Could not authenticate user`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      },
    );
  }

  // Call the sessionCreateUrl to create an auth session on the Dev Portal
  const sessionCreateUrl = requestUrl.searchParams.get("session-create-url");
  if (sessionCreateUrl) {
    const user = data.user;
    // The sessionCreateUrl will already point to the correct environment
    // (ex. working copy, prod, staging), so no additional configuration
    // is needed.
    const ssoResponse = await fetch(sessionCreateUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.ZUPLO_API_KEY}`,
        "dev-portal-id": "supaweek-day-5-main-8a19a50",
        "dev-portal-host": "supaweek-day-5-main-8a19a50.d2.zuplo.dev",
      },
      body: JSON.stringify({
        email: user.email,
        name: user.user_metadata?.full_name,
        email_verified: user.confirmed_at != null,
        sub: user.id,
        picture: user.user_metadata?.avatar_url,
      }),
    });

    if (!ssoResponse.ok) {
      console.log(await ssoResponse.text());
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Could not authenticate user`,
        {
          status: 301,
        },
      );
    }

    // The session creation response will contain a redirectURI that your user
    // must be redirected to in order to start their session
    const { redirectUri } = await ssoResponse.json();
    return NextResponse.redirect(redirectUri, {
      status: 301,
    });
  }

  // If the login does not originate from the Dev Portal, redirect back to the
  // homepage
  return NextResponse.redirect(requestUrl.origin, {
    status: 301,
  });
}
