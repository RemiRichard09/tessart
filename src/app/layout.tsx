import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tessart - Accumulateurs Thermiques",
  description:
    "Découvrez combien vous pouvez économiser avec les accumulateurs thermiques Tessart. Téléversez votre facture Hydro-Québec et obtenez une estimation personnalisée.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
                T
              </div>
              <span className="text-xl font-bold text-gray-900">Tessart</span>
            </Link>
            <Link
              href="/economie"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
            >
              Calculer mes économies
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Tessart. Tous droits réservés.
          </div>
        </footer>
      </body>
    </html>
  );
}
