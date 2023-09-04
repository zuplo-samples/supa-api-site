import { redirect } from "next/navigation";
import { getSession } from "../supabase-server";
import AuthUI from "./AuthUI";
import { getSubscription } from "../stripe";

export default async function SignIn() {
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
    <div className="m-auto flex w-80 max-w-lg flex-col justify-center p-3">
      <AuthUI />
    </div>
  );
}
