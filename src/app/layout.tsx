import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tessart Plant Studio",
  description:
    "Visualisez, simulez et dimensionnez le stockage thermique pour vos usines. Visualize, simulate, and size thermal storage for industrial plants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-navy-950 text-txt">
        <LanguageProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
