import React, { Suspense } from "react";
import TypingBox from "@/components/TypingBox";
import Link from "next/link";
import { LANGUAGES_LIST } from "@/lib/languages";
import { BookOpen, BarChart3, Globe2, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-12">
      {/* Hero + Typing Box */}
      <section className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Type faster in <span className="text-emerald-600 dark:text-emerald-400">any language</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Master touch typing in English, Urdu (اردو), and Arabic (العربية) with live WPM analytics, smart weak-key practice, and interactive keyboards.
          </p>
        </div>

        <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />}>
          <TypingBox />
        </Suspense>
      </section>

      {/* Feature Highlights & Language Landing Links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        {LANGUAGES_LIST.map((lang) => (
          <Link
            key={lang.id}
            href={`/${lang.slug}`}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {lang.direction.toUpperCase()} Layout
              </span>
              <Globe2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {lang.name} Typing Test ({lang.nativeName})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Practice {lang.words.length}+ common words, {lang.sentences.length}+ sentences, and 6 progressive lessons in {lang.name}.
            </p>
          </Link>
        ))}
      </section>

      {/* Quick Value Props */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <strong className="text-slate-900 dark:text-white block mb-0.5">
              6 Structured Lessons per Language
            </strong>
            Start from the Home Row and unlock Top Row, Bottom Row, Numbers, Words, and Sentences with 90%+ accuracy.
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <strong className="text-slate-900 dark:text-white block mb-0.5">
              Streaks, Heatmap & Weak Keys
            </strong>
            Track daily WPM, consistency scores, and automatically drill the exact keys you miss most.
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <strong className="text-slate-900 dark:text-white block mb-0.5">
              Instant & Private
            </strong>
            No account required in v1. Your progress is stored in your browser and can be exported anytime as JSON.
          </div>
        </div>
      </section>
    </div>
  );
}
