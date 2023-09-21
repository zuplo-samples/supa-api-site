import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the Auth Helpers package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const sessionCreateUrl = requestUrl.searchParams.get("session-create-url");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const sessionData = await supabase.auth.exchangeCodeForSession(code);
    // Read the user data from the code exchange response
    const { user } = sessionData?.data;

    if (!user) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Could not authenticate user`,
        {
          status: 301,
        },
      );
    }

    // Call the sessionCreateUrl to create an auth session on the Dev Portal
    if (sessionCreateUrl) {
      // The sessionCreateUrl will already point to the correct environment
      // (ex. working copy, prod, staging), so no additional configuration
      // is needed.
      const ssoResponse = await fetch(sessionCreateUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.ZUPLO_API_KEY}`,
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
  }

  // If the sign up does not originate from the Dev Portal, redirect back to the
  // homepage
  return NextResponse.redirect(requestUrl.origin);
}
