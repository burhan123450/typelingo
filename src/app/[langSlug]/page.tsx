import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGUAGES_LIST, getLanguageBySlug } from "@/lib/languages";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import TypingBox from "@/components/TypingBox";
import Link from "next/link";

interface LangPageProps {
  params: {
    langSlug: string;
  };
}

export function generateStaticParams() {
  return LANGUAGES_LIST.map((lang) => ({
    langSlug: lang.slug,
  }));
}

export function generateMetadata({ params }: LangPageProps): Metadata {
  const lang = getLanguageBySlug(params.langSlug);
  if (!lang) {
    return { title: "Typing Test Not Found" };
  }

  const title = `${lang.name} Typing Test (${lang.nativeName}) — Free Online WPM Speed Test`;
  const description = `Practice ${lang.name} (${lang.nativeName}) touch typing online on ${SITE_NAME}. Take 30s, 60s, or 2-minute typing speed tests with an on-screen ${lang.name} keyboard, live WPM, and accuracy tracking.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang.slug}`,
      type: "website",
    },
  };
}

export default function LanguageSeoPage({ params }: LangPageProps) {
  const lang = getLanguageBySlug(params.langSlug);
  if (!lang) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10">
      <div className="text-center max-w-5xl mx-auto">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
          {lang.name} ({lang.nativeName}) · {lang.keyboardLayoutName}
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
          {lang.name} Typing Test & Touch Typing Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:whitespace-nowrap overflow-hidden text-ellipsis">
          Improve your {lang.name} typing speed (WPM) and accuracy with our interactive on-screen keyboard, real-time metrics, and {lang.words.length}+ curated words and sentences.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        }
      >
        <TypingBox forcedLanguage={lang} />
      </Suspense>

      {/* Rich SEO Guide & FAQ Block */}
      <article className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm leading-relaxed space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            How to Master {lang.name} ({lang.nativeName}) Touch Typing
          </h2>
          <p className="text-slate-600 dark:text-slate-300">{lang.seo.intro}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Top Tips for Faster {lang.name} Typing
          </h3>
          <ul className="list-disc ps-5 space-y-1.5 text-slate-600 dark:text-slate-300">
            {lang.seo.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
            <li>
              Visit our{" "}
              <Link
                href="/lessons"
                className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
              >
                {lang.name} Touch Typing Lessons
              </Link>{" "}
              to unlock all 6 progressive stages from Home Row to Full Sentences.
            </li>
          </ul>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions ({lang.name})
          </h3>
          <div className="space-y-3">
            {lang.seo.faq.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {item.q}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
