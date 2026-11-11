"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { LanguageConfig, TestResult } from "@/types/typing";
import { useApp } from "@/components/AppProvider";
import { generatePracticeText, LANGUAGES_LIST } from "@/lib/languages";
import { calculateWPM, calculateAccuracy, calculateConsistency } from "@/lib/metrics";
import { getLocalDateString } from "@/lib/storage";
import OnScreenKeyboard from "@/components/OnScreenKeyboard";
import {
  RotateCcw,
  Keyboard as KeyboardIcon,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

interface TypingBoxProps {
  forcedLanguage?: LanguageConfig;
  initialMode?: "30s" | "60s" | "120s" | "lesson" | "weak-keys";
  lessonId?: string;
  onLessonComplete?: (result: TestResult) => void;
  onBackFromLesson?: () => void;
}

export default function TypingBox({
  forcedLanguage,
  initialMode = "30s",
  lessonId,
  onLessonComplete,
  onBackFromLesson,
}: TypingBoxProps) {
  const {
    currentLanguage,
    setTypingLanguage,
    storage,
    t,
    recordTestResult,
  } = useApp();

  const searchParams = useSearchParams();
  const activeLang = forcedLanguage || currentLanguage;

  useEffect(() => {
    if (forcedLanguage && forcedLanguage.id !== currentLanguage.id) {
      setTypingLanguage(forcedLanguage.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedLanguage?.id]);

  const urlMode = searchParams?.get("mode");
  const startingMode: "30s" | "60s" | "120s" | "lesson" | "weak-keys" = lessonId
    ? "lesson"
    : urlMode === "weak-keys"
    ? "weak-keys"
    : initialMode;

  const [mode, setMode] = useState<"30s" | "60s" | "120s" | "lesson" | "weak-keys">(
    startingMode
  );
  const [contentType, setContentType] = useState<"sentences" | "words">("words");
  const [displayStyle, setDisplayStyle] = useState<"tiles" | "line">("tiles");
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [targetText, setTargetText] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [hasCurrentError, setHasCurrentError] = useState<boolean>(false);

  useEffect(() => {
    if (!lessonId && urlMode === "weak-keys" && mode !== "weak-keys") {
      setMode("weak-keys");
    }
  }, [urlMode, lessonId, mode]);

  const durationForMode = (m: typeof mode): number => {
    if (m === "30s") return 30;
    if (m === "60s") return 60;
    if (m === "120s") return 120;
    return 60;
  };

  const [timeLeft, setTimeLeft] = useState<number>(durationForMode(mode));
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const startTimeMsRef = useRef<number | null>(null);
  const typedTextRef = useRef<string>("");
  const targetTextRef = useRef<string>("");
  const totalTypedRef = useRef<number>(0);
  const lastSampleCorrectRef = useRef<number>(0);
  const errorMapRef = useRef<Record<string, number>>({});
  const wpmSamplesRef = useRef<number[]>([]);
  const isComposingRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const savedResultRef = useRef<boolean>(false);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);

  const initTest = useCallback(
    (selectedMode = mode, selectedLang = activeLang, selectedContent = contentType) => {
      const weakMap = storage.weakKeys[selectedLang.id] || {};
      const text = generatePracticeText(selectedLang, selectedMode, {
        lessonId,
        weakKeysMap: weakMap,
        contentType: selectedContent,
      }).normalize("NFC");

      setTargetText(text);
      targetTextRef.current = text;
      setTypedText("");
      typedTextRef.current = "";
      setIsRunning(false);
      setIsFinished(false);
      setHasCurrentError(false);

      const dur = durationForMode(selectedMode);
      setTimeLeft(dur);
      setElapsedSeconds(0);
      startTimeMsRef.current = null;
      totalTypedRef.current = 0;
      lastSampleCorrectRef.current = 0;
      errorMapRef.current = {};
      wpmSamplesRef.current = [];
      savedResultRef.current = false;

      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeLang, mode, lessonId, contentType]
  );

  useEffect(() => {
    initTest(lessonId ? "lesson" : mode, activeLang, contentType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang.id, mode, lessonId, contentType]);

  const countCorrectChars = useCallback(
    (typed: string, target: string): number => {
      let correct = 0;
      const len = Math.min(typed.length, target.length);
      for (let i = 0; i < len; i++) {
        if (typed[i] === target[i]) {
          correct++;
        }
      }
      return correct;
    },
    []
  );

  const finishTest = useCallback(
    (finalTyped: string, finalElapsedSeconds: number) => {
      if (savedResultRef.current) return;
      savedResultRef.current = true;
      setIsRunning(false);
      setIsFinished(true);

      const effectiveElapsed = Math.max(1, finalElapsedSeconds);
      const currentTarget = targetTextRef.current;
      const correctChars = countCorrectChars(finalTyped, currentTarget);
      const totalTyped = Math.max(correctChars, totalTypedRef.current);
      const wpm = calculateWPM(correctChars, effectiveElapsed);
      const accuracy = calculateAccuracy(correctChars, totalTyped);
      const consistency = calculateConsistency(
        wpmSamplesRef.current.length > 0 ? wpmSamplesRef.current : [wpm]
      );

      const result: TestResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        dateStr: getLocalDateString(new Date()),
        languageId: activeLang.id,
        mode,
        lessonId,
        durationSeconds: Math.round(effectiveElapsed),
        wpm,
        accuracy,
        consistency,
        correctChars,
        totalTypedChars: totalTyped,
        errorMap: { ...errorMapRef.current },
      };

      recordTestResult(result);
      if (onLessonComplete) {
        onLessonComplete(result);
      }
    },
    [activeLang.id, countCorrectChars, lessonId, mode, onLessonComplete, recordTestResult]
  );

  // Wall-clock timer
  useEffect(() => {
    if (!isRunning || isFinished) return;

    const totalDuration = durationForMode(mode);
    let lastSampleSecond = 0;

    const interval = setInterval(() => {
      if (!startTimeMsRef.current) return;
      const exactElapsed = (Date.now() - startTimeMsRef.current) / 1000;
      const remaining = Math.max(0, Math.ceil(totalDuration - exactElapsed));

      setElapsedSeconds(exactElapsed);
      setTimeLeft(remaining);

      const wholeSecond = Math.floor(exactElapsed);
      if (wholeSecond > lastSampleSecond && wholeSecond >= 1) {
        lastSampleSecond = wholeSecond;
        const correctNow = countCorrectChars(
          typedTextRef.current,
          targetTextRef.current
        );
        const charsInThisSecond = Math.max(
          0,
          correctNow - lastSampleCorrectRef.current
        );
        lastSampleCorrectRef.current = correctNow;
        const instantWpm = calculateWPM(charsInThisSecond, 1);
        wpmSamplesRef.current.push(instantWpm);
      }

      if (exactElapsed >= totalDuration) {
        clearInterval(interval);
        finishTest(typedTextRef.current, totalDuration);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, isFinished, mode, countCorrectChars, finishTest]);

  useEffect(() => {
    if (activeCharRef.current) {
      activeCharRef.current.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [typedText.length]);

  const applyNewTypedValue = (rawNewVal: string) => {
    if (isFinished) return;
    const normalized = rawNewVal.normalize("NFC");

    if (!isRunning && normalized.length > 0) {
      startTimeMsRef.current = Date.now();
      setIsRunning(true);
      setShowOptionsMenu(false);
    }

    const currentTyped = typedTextRef.current;
    let currentTarget = targetTextRef.current;

    if (normalized.length < currentTyped.length) {
      typedTextRef.current = normalized;
      setTypedText(normalized);
      setHasCurrentError(false);
      return;
    }

    let accepted = currentTyped;
    let hitWrongKey = false;

    for (let i = currentTyped.length; i < normalized.length; i++) {
      const typedChar = normalized[i];
      const expectedChar = currentTarget[accepted.length];
      if (!expectedChar) break;

      totalTypedRef.current += 1;

      if (typedChar === expectedChar) {
        accepted += typedChar;
        hitWrongKey = false;
      } else {
        errorMapRef.current[expectedChar] =
          (errorMapRef.current[expectedChar] || 0) + 1;
        hitWrongKey = true;
        break;
      }
    }

    if (
      mode === "lesson" &&
      accepted.length >= currentTarget.length &&
      currentTarget.length > 0
    ) {
      setHasCurrentError(false);
      typedTextRef.current = accepted;
      setTypedText(accepted);
      const exactSec = startTimeMsRef.current
        ? (Date.now() - startTimeMsRef.current) / 1000
        : elapsedSeconds;
      finishTest(accepted, Math.max(1, exactSec));
      return;
    }

    if (mode !== "lesson" && currentTarget.length - accepted.length < 80) {
      const weakMap = storage.weakKeys[activeLang.id] || {};
      const moreText = generatePracticeText(activeLang, mode, {
        lessonId,
        weakKeysMap: weakMap,
        contentType,
      }).normalize("NFC");
      currentTarget = `${currentTarget} ${moreText}`;
      targetTextRef.current = currentTarget;
      setTargetText(currentTarget);
    }

    setHasCurrentError(hitWrongKey);
    typedTextRef.current = accepted;
    setTypedText(accepted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setPressedCode(e.code);
    if (e.key === "Tab") {
      e.preventDefault();
      initTest(mode, activeLang, contentType);
    }
  };

  const handleKeyUp = () => {
    setPressedCode(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposingRef.current) {
      setTypedText(e.target.value);
      return;
    }
    applyNewTypedValue(e.target.value);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    applyNewTypedValue(e.currentTarget.value);
  };

  const correctCharsLive = countCorrectChars(typedText, targetText);
  const totalTypedLive = Math.max(correctCharsLive, totalTypedRef.current);
  const mistakesLive = Math.max(0, totalTypedLive - correctCharsLive);
  const effectiveLiveSeconds = elapsedSeconds >= 1.5 ? elapsedSeconds : 0;
  const liveWpm = isFinished
    ? calculateWPM(correctCharsLive, Math.max(1, elapsedSeconds))
    : effectiveLiveSeconds > 0
    ? calculateWPM(correctCharsLive, effectiveLiveSeconds)
    : 0;
  const rawWpm = isFinished
    ? calculateWPM(totalTypedLive, Math.max(1, elapsedSeconds))
    : effectiveLiveSeconds > 0
    ? calculateWPM(totalTypedLive, effectiveLiveSeconds)
    : 0;
  const liveAccuracy = calculateAccuracy(correctCharsLive, totalTypedLive);
  const liveConsistency = calculateConsistency(wpmSamplesRef.current);
  const nextChar =
    typedText.length < targetText.length ? targetText[typedText.length] : null;

  const isRTL = activeLang.direction === "rtl";

  // Windowed characters for the clean "Boxed Tile" view (shows a sliding window of 10 tiles like TypingClub)
  const charsArray = Array.from(targetText);
  const currentIndex = typedText.length;
  const windowSize = 10;
  const windowStart = Math.floor(currentIndex / windowSize) * windowSize;
  const visibleTileChars = charsArray.slice(
    windowStart,
    windowStart + windowSize
  );

  const topMissedKeys = Object.entries(errorMapRef.current)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // If test is finished, show the clean Result Card
  if (isFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 animate-in fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {liveAccuracy >= 90 ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            )}
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {t.testCompleted}
              </h2>
              {lessonId && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {liveAccuracy >= 90 ? t.lessonPassed : t.lessonFailed}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => initTest(mode, activeLang, contentType)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {t.tryAgain}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">{t.wpm}</div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {liveWpm}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">{t.accuracy}</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {liveAccuracy}%
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">{t.consistency}</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {liveConsistency}%
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">{t.rawWpm}</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {rawWpm}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            {t.correctChars}: <strong>{correctCharsLive}</strong> · {t.mistakes}:{" "}
            <strong>{mistakesLive}</strong>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span>{t.mostMissed}:</span>
            {topMissedKeys.length === 0 ? (
              <strong className="text-emerald-600">{t.noMistakes}</strong>
            ) : (
              topMissedKeys.map(([ch, cnt]) => (
                <span
                  key={ch}
                  className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold"
                >
                  {ch === " " ? t.space : ch} ({cnt})
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-4 sm:py-8 gap-6 cursor-text select-none"
    >
      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="text"
        value={typedText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        disabled={isFinished}
        aria-label="Typing input"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="sr-only"
      />

      {/* 1. TOP: TYPING PROMPT (Tiles Mode or Clean Line Mode) */}
      <div
        dir={activeLang.direction}
        className={`w-full flex flex-col items-center justify-center min-h-[120px] px-4 ${activeLang.fontClass}`}
      >
        {displayStyle === "tiles" && !isRTL ? (
          /* Boxed Letter Tiles (Exact Screenshot Style) */
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {visibleTileChars.map((char, idx) => {
              const absoluteIdx = windowStart + idx;
              const isTyped = absoluteIdx < currentIndex;
              const isCurrent = absoluteIdx === currentIndex;

              return (
                <div
                  key={absoluteIdx}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-medium transition-all duration-100 ${
                      isCurrent
                        ? hasCurrentError
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 shadow-sm scale-105"
                          : "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-slate-900 dark:text-white shadow-sm scale-105"
                        : isTyped
                        ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {char === " " ? "␣" : char}
                  </div>
                  {/* Green / Red Indicator Bar Under Current Box */}
                  <span
                    className={`h-1 w-9 rounded-full transition-all ${
                      isCurrent
                        ? hasCurrentError
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                        : "bg-transparent"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Flowing Line Mode (Auto-used for Urdu/Arabic RTL joined scripts or when "Aa" is toggled) */
          <div
            className={`max-w-3xl text-center leading-relaxed tracking-wide max-h-[140px] overflow-y-auto px-4 py-2 ${
              isRTL
                ? "text-2xl sm:text-3xl leading-[2.4]"
                : "text-2xl sm:text-3xl leading-relaxed"
            }`}
          >
            {charsArray.map((char, idx) => {
              const isTyped = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              let colorClass = "text-slate-400 dark:text-slate-500";
              if (isTyped) {
                colorClass = "text-emerald-600 dark:text-emerald-400";
              } else if (isCurrent && hasCurrentError) {
                colorClass =
                  "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70 rounded";
              }

              return (
                <span
                  key={idx}
                  ref={isCurrent ? activeCharRef : null}
                  className={`${colorClass} ${
                    isCurrent
                      ? hasCurrentError
                        ? "underline decoration-2 decoration-rose-500 underline-offset-8 rounded"
                        : "underline decoration-2 decoration-emerald-500 underline-offset-8 bg-emerald-500/10 rounded px-0.5"
                      : ""
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. MIDDLE: THIN DIVIDER + COMPACT FLOATING PILL BAR (Exact Screenshot Layout) */}
      <div className="w-full max-w-xl flex flex-col items-center gap-3">
        {/* Thin Horizontal Progress/Divider Line */}
        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
          {isRunning && mode !== "lesson" && (
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{
                width: `${Math.min(
                  100,
                  (elapsedSeconds / durationForMode(mode)) * 100
                )}%`,
              }}
            />
          )}
        </div>

        {/* Small Green Restart Icon + Minimal Live Metrics when running */}
        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          {isRunning && (
            <span>
              <strong className="text-slate-700 dark:text-slate-300">
                {liveWpm}
              </strong>{" "}
              WPM ·{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {liveAccuracy}%
              </strong>{" "}
              ·{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {timeLeft}s
              </strong>
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              initTest(mode, activeLang, contentType);
            }}
            title={`${t.restart} (Tab)`}
            className="p-1.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Rounded Toolbar Pill: [ ← | ⌨ QWERTY v | Aa v | ⚙ ] */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative inline-flex items-center gap-1 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-300"
        >
          {onBackFromLesson && (
            <button
              type="button"
              onClick={onBackFromLesson}
              title={t.backToLessons}
              className="px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Language / Keyboard Layout Selector */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <KeyboardIcon className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Keyboard Language"
              value={activeLang.id}
              onChange={(e) => setTypingLanguage(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              {LANGUAGES_LIST.map((l) => (
                <option
                  key={l.id}
                  value={l.id}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {l.keyboardLayoutName} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Display Style Toggle (Aa: Boxed Tiles vs Line) */}
          <button
            type="button"
            onClick={() =>
              setDisplayStyle((s) => (s === "tiles" ? "line" : "tiles"))
            }
            title="Switch Boxed Tiles / Text Line"
            className="px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
          >
            Aa
          </button>

          {/* Settings Popover Button (Mode 30s/60s/2m, Words/Sentences, Show/Hide Keyboard) */}
          <button
            type="button"
            onClick={() => setShowOptionsMenu((v) => !v)}
            title="Practice Options"
            className="px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Compact Popover Menu when clicking ⚙ */}
          {showOptionsMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-30 w-64 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col gap-3 text-xs">
              {!lessonId && (
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                    Timer / Mode
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {(
                      [
                        { id: "30s", label: t.mode30s },
                        { id: "60s", label: t.mode60s },
                        { id: "120s", label: t.mode120s },
                        { id: "weak-keys", label: t.modeWeakKeys },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMode(m.id);
                          setShowOptionsMenu(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg font-semibold ${
                          mode === m.id
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!lessonId && mode !== "weak-keys" && (
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                    Content
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setContentType("words");
                        setShowOptionsMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg font-semibold ${
                        contentType === "words"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {t.words}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContentType("sentences");
                        setShowOptionsMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg font-semibold ${
                        contentType === "sentences"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {t.sentences}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{t.keyboardToggle}</span>
                <button
                  type="button"
                  onClick={() => setShowKeyboard((s) => !s)}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    showKeyboard
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {showKeyboard ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM: ON-SCREEN KEYBOARD WITH HAND & FINGER GUIDE */}
      {showKeyboard && (
        <OnScreenKeyboard
          language={activeLang}
          nextChar={nextChar}
          pressedCode={pressedCode}
        />
      )}
    </div>
  );
}
