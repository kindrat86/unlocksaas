import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Unlock SaaS account with a one-time email link.",
};

// Cache Components: searchParams + Supabase auth read are request-time inputs.
// Outer export is a synchronous Suspense wrapper; the async body lives in
// LoginPageBody and starts with `await connection()` to defer to request time.
export default function LoginPage(
  props: {
    searchParams: Promise<{ next?: string }>;
  }
) {
  return (
    <Suspense fallback={null}>
      <LoginPageBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function LoginPageBody(
  props: {
    searchParams: Promise<{ next?: string }>;
  }
) {
  await connection();
  const searchParams = await props.searchParams;
  // If already signed in, skip the form and go where the user was headed.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect(searchParams.next || "/playbook");
  }

  const next = searchParams.next || "/playbook";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Sign in.</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One email, one link, no password to forget. You will be back in the
            Playbook in under a minute.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
