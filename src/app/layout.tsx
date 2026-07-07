import type { Metadata } from "next";
import Link from "next/link";
import TessartLogo from "@/components/TessartLogo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tessart Plant Studio",
  description:
    "Visualize, simulate, and size thermal storage for industrial plants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-navy-950 text-txt">
        <header className="sticky top-0 z-50 border-b border-edge/70 bg-navy-950/85 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <Link href="/" className="flex items-baseline gap-2">
              <TessartLogo className="text-[21px]" />
              <span className="text-[15px] font-medium tracking-wide text-txt-2">
                Plant Studio
              </span>
            </Link>
            <Link
              href="/studio"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
            >
              Start plant assessment
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-edge/70">
          <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-txt-3">
            &copy; {new Date().getFullYear()} Tessart — TESSA Plant Studio.
            Simulation results are indicative estimates.
          </div>
        </footer>
      </body>
    </html>
  );
}
