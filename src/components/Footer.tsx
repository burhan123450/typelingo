"use client";

import React from "react";
import Link from "next/link";
import { LANGUAGES_LIST } from "@/lib/languages";
import { useApp } from "@/components/AppProvider";
import { SITE_NAME } from "@/lib/site";
import { fmt } from "@/lib/i18n";

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {SITE_NAME}
          </span>
          <span>— {t.tagline}</span>
        </div>

        {/* Dedicated SEO Language Links */}
        <div className="flex flex-wrap items-center gap-3">
          {LANGUAGES_LIST.map((lang) => (
            <Link
              key={lang.id}
              href={`/${lang.slug}`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 underline-offset-4 hover:underline"
            >
              {fmt(t.languageTest, { lang: lang.name })}
            </Link>
          ))}
        </div>

        {/* Policy & Info Links */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/about"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t.about}
          </Link>
          <Link
            href="/privacy"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t.privacy}
          </Link>
          <Link
            href="/terms"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t.terms}
          </Link>
          <Link
            href="/contact"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {t.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
