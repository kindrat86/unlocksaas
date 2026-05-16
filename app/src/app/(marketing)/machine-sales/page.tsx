import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MachineSalesPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Sprint 3
        </p>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
          The full $49 Machine sales page is being written, not assembled.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          It will run the long-form Perfect Webinar Lite structure: Big Domino,
          Three Secrets with Story-Strategy-Case Study, a fifteen-slide stack,
          sixteen mini-closes, the 60-day guarantee in writing. Not a single
          paragraph of it is fake.
        </p>

        <Card className="mb-8">
          <CardContent className="pt-6 text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can already cross the bridge to the full Machine through the
              Starter. Pay $1, finish your dream customer and your offer, and
              you will see the upgrade door at the end. That is the same door
              this page will eventually point at — just longer-form, for cold
              traffic.
            </p>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/starter">Start the Machine for $1</Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Or go back to the{" "}
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            home page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
