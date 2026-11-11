"use client";

import React, { useState, Suspense } from "react";
import { useApp } from "@/components/AppProvider";
import { LANGUAGES_LIST } from "@/lib/languages";
import TypingBox from "@/components/TypingBox";
import { Lock, CheckCircle2, Play, Award } from "lucide-react";

export default function LessonsView() {
  const { currentLanguage, setTypingLanguage, storage, isHydrated, t } = useApp();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-500">
        {t.loading}
      </div>
    );
  }

  const orderedLessons = [...currentLanguage.lessons].sort(
    (a, b) => a.order - b.order
  );

  const isLessonUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const prevLesson = orderedLessons[index - 1];
    const prevKey = `${currentLanguage.id}:${prevLesson.id}`;
    return Boolean(storage.lessonProgress[prevKey]?.completed);
  };

  if (activeLessonId) {
    return (
      <div className="max-w-5xl mx-auto px-4 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
        <Suspense fallback={null}>
          <TypingBox
            forcedLanguage={currentLanguage}
            initialMode="lesson"
            lessonId={activeLessonId}
            onBackFromLesson={() => setActiveLessonId(null)}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.lessonsTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.lessonsSubtitle}
          </p>
        </div>

        {/* Language Picker for Lessons */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {LANGUAGES_LIST.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setTypingLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentLanguage.id === lang.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {lang.name} ({lang.nativeName})
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orderedLessons.map((lesson, idx) => {
          const unlocked = isLessonUnlocked(idx);
          const progKey = `${currentLanguage.id}:${lesson.id}`;
          const prog = storage.lessonProgress[progKey];
          const completed = Boolean(prog?.completed);

          return (
            <div
              key={lesson.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                unlocked
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600"
                  : "bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {t.lessonLabel} {lesson.order}
                  </span>
                  {completed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.lessonCompleted}
                    </span>
                  ) : !unlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                      {t.lessonLocked}
                    </span>
                  ) : null}
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {lesson.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {lesson.description}
                </p>

                {/* Target Keys Preview */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {lesson.targetKeys.map((k, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      {k === " " ? t.space : k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {prog ? (
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>
                      {t.best}: <strong>{prog.bestWpm} WPM</strong> (
                      <strong>{prog.bestAccuracy}%</strong>)
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    {unlocked ? t.readyToStart : t.lessonUnlockHint}
                  </div>
                )}

                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    unlocked
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{completed ? t.practiceAgain : t.startLesson}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
