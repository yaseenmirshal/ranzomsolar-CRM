import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="login-backdrop flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="login-orbit pointer-events-none absolute -right-24 -top-32 size-96 rounded-full" aria-hidden />
      <div className="login-orbit login-orbit-delayed pointer-events-none absolute -bottom-40 -left-20 size-[28rem] rounded-full" aria-hidden />
      <section className="relative z-10 w-full max-w-md rounded-2xl border bg-card/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8">
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground shadow-lg">R</div>
          <p className="text-sm font-semibold tracking-wide text-brand">RANZOM TECH</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome to Ranzom CRM</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to your business workspace.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
