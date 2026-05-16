"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sendMagicLink, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL: LoginState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send me a sign-in link"}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(sendMagicLink, INITIAL);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-green-700/40 bg-green-900/10 p-4 text-sm">
          {state.message}
        </div>
        <p className="text-xs text-muted-foreground">
          Wrong email? <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@yourdomain.com"
        />
      </div>
      {state.message && !state.ok ? (
        <div className="rounded-md border border-red-700/40 bg-red-900/10 p-3 text-sm text-red-200">
          {state.message}
        </div>
      ) : null}
      <SubmitButton />
      <p className="text-xs text-muted-foreground leading-relaxed">
        No password. We email you a one-time sign-in link. The link expires in
        an hour and only works once.
      </p>
    </form>
  );
}
