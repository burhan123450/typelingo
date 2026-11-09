import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGUAGES_LIST, getLanguageBySlug } from "@/lib/languages";
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
  const description = `Practice ${lang.name} (${lang.nativeName}) touch typing online. Take 30s, 60s, or 2-minute typing speed tests with an on-screen ${lang.name} keyboard, live WPM, and accuracy tracking.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bigbirdcuration.com/${lang.slug}`,
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
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
          {lang.name} ({lang.nativeName})
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
          {lang.name} Typing Test & Touch Typing Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:whitespace-nowrap overflow-hidden text-ellipsis">
          Improve your {lang.name} typing speed (WPM) and accuracy with our interactive on-screen keyboard, real-time metrics, and {lang.words.length}+ curated words and sentences.
        </p>
      </div>

      <TypingBox forcedLanguage={lang} />

      {/* SEO Content Block */}
      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm leading-relaxed space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          How to Increase Your {lang.name} Typing Speed
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Whether you are a beginner learning the {lang.name} ({lang.nativeName}) keyboard layout or an experienced typist aiming for 80+ WPM, consistent daily practice is key. TypeLingo highlights the exact physical key you need to press next and tracks your personal weak keys automatically.
        </p>
        <ul className="list-disc ps-5 space-y-1.5 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Focus on 95%+ Accuracy First:</strong> Speed naturally follows muscle memory when you avoid backspacing.
          </li>
          <li>
            <strong>Use the On-Screen Keyboard:</strong> Keep your eyes on the screen and use the highlighted key indicator instead of looking down at your physical hands.
          </li>
          <li>
            <strong>Follow the 6 Progressive Lessons:</strong> Visit our{" "}
            <Link href="/lessons" className="text-emerald-600 dark:text-emerald-400 underline">
              {lang.name} Typing Lessons
            </Link>{" "}
            to master the home row, top row, bottom row, numbers, words, and sentences in order.
          </li>
        </ul>
      </article>
    </div>
  );
}
