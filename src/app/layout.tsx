import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/shared/providers";


export const metadata: Metadata = {
  title: { default: "Ranzom CRM", template: "%s · Ranzom CRM" },
  description: "A flexible customer and business management workspace by Ranzom Tech.",
};
export const viewport: Viewport = { themeColor: "#10263a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="min-h-dvh"><Providers>{children}</Providers></body>
    </html>
  );
}
