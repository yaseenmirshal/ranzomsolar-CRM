import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/shared/providers";


export const metadata: Metadata = {
  title: { default: "Ranzom Solar CRM", template: "%s · Ranzom Solar CRM" },
  description: "Solar business management CRM template for Ranzom Solar Solutions (demo data).",
};
export const viewport: Viewport = { themeColor: "#10263a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="min-h-dvh"><Providers>{children}</Providers></body>
    </html>
  );
}
