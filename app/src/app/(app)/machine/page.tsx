import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MachineDashboard() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Welcome, Builder.</h1>
      <p className="text-muted-foreground mb-8">
        You are here because you shipped something real. The only thing between
        that product and your first paying customer is the work you were taught
        to skip. Let&apos;s do it.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Start Step 1: Pin Your Dream Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Five questions. The engine pushes back on vague answers until you
            have one real person, named and specific. Not a category. A person.
          </p>
          <Button asChild>
            <Link href="/machine/step/1">Begin</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
