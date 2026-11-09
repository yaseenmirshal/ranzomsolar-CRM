import { redirect } from "next/navigation";
import { getActiveUser, isDemoMode } from "@/lib/auth/authorization";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { IntroLoader } from "@/components/layout/intro-loader";
import { DataSourceNotice } from "@/components/shared/data-source-notice";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getActiveUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh">
      <IntroLoader />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={{ name: user.name, email: user.email }} isDemoMode={isDemoMode} />
        <DataSourceNotice />
        <main id="main" className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-6 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
