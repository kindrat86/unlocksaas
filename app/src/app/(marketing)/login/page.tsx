import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in — Unlock SaaS",
  description: "Sign in to your Unlock SaaS account with a one-time email link.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  // If already signed in, skip the form and go where the user was headed.
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect(searchParams.next || "/machine");
  }

  const next = searchParams.next || "/machine";

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Sign in.</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One email, one link, no password to forget. You will be back in the
            Machine in under a minute.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
