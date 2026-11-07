import Link from "next/link";
import { ArrowRight, CircleHelp, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PendingModule } from "@/lib/module-status";

export function PendingModuleView({
  title,
  module,
}: {
  title: string;
  module: PendingModule;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
          <PlugZap className="size-3.5" />
          Backend integration pending
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleHelp className="size-4 text-brand" />
            Capability not yet confirmed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <p className="text-sm text-muted-foreground">
            This module has no connected records or actions yet. No sample records are shown here, and this screen does not claim that the feature is operational.
          </p>
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            This module will be implemented with the app&apos;s Next.js backend.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/enquiries">
                Open enquiries
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
