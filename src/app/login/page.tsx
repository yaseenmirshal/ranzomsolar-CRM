import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { authenticate } from "./actions";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 lg:flex solar-lines">
        <BrandLogo />
        <div>
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white">From first enquiry to after-sales service — one place.</h1>
          <p className="mt-3 max-w-md text-sm text-sidebar-foreground">Demo template. All data shown is fictional.</p>
        </div>
        <p className="text-xs text-sidebar-muted">© Ranzom Solar Solutions</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form
          className="w-full max-w-sm space-y-5"
          action={authenticate}
        >
          <div className="lg:hidden"><BrandLogo tone="auto" /></div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with your Ranzom Solar account.</p>
          </div>
          {error === "credentials" && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Email or password is incorrect.
            </p>
          )}
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="username" required /></div>
          <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" name="password" type="password" autoComplete="current-password" required /></div>
          <Button type="submit" size="lg" className="w-full">Sign in</Button>
        </form>
      </div>
    </div>
  );
}
