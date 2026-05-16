import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DiagnosticPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Sprint 2
        </p>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
          The Free Diagnostic is the next door I am building.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          It reads your live product page and labels what is wrong in one of
          three ways: Wrong Person, Weak Offer, Weak Belief. Then it hands you
          the door that fixes it. The door that is already open is the $1
          Starter. Two of the seven steps. Yours to keep.
        </p>

        <Card className="mb-8">
          <CardContent className="pt-6 text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The honest version: I shipped the Starter before I shipped the
              diagnostic on purpose. The diagnostic is downstream of the offer
              copy it points at. So the offer copy had to exist first. It does
              now. The diagnostic is next.
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
