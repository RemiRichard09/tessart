"use client";

import Link from "next/link";
import { LanguageSwitch, useI18n } from "@/components/LanguageProvider";
import TessartLogo from "@/components/TessartLogo";

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-edge/70 bg-navy-950/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-baseline gap-2">
          <TessartLogo className="text-[21px]" />
          <span className="text-[15px] font-medium tracking-wide text-txt-2">
            {t.common.plantStudio}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Link
            href="/studio"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
          >
            {t.common.startAssessment}
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-edge/70">
      <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-txt-3">
        &copy; {new Date().getFullYear()} Tessart — Plant Studio.{" "}
        {t.common.footer}
      </div>
    </footer>
  );
}
