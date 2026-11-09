"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LanguageConfig, TestResult } from "@/types/typing";
import { useApp } from "@/components/AppProvider";
import { generatePracticeText, LANGUAGES_LIST } from "@/lib/languages";
import { calculateWPM, calculateAccuracy, calculateConsistency } from "@/lib/metrics";
import { getLocalDateString } from "@/lib/storage";
import OnScreenKeyboard from "@/components/OnScreenKeyboard";
import {
  RotateCcw,
  Timer,
  Gauge,
  Target,
  Activity,
  Keyboard as KeyboardIcon,
  Info,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface TypingBoxProps {
  forcedLanguage?: LanguageConfig;
  initialMode?: "30s" | "60s" | "120s" | "lesson" | "weak-keys";
  lessonId?: string;
  onLessonComplete?: (result: TestResult) => void;
}

export default function TypingBox({
  forcedLanguage,
  initialMode = "30s",
  lessonId,
  onLessonComplete,
}: TypingBoxProps) {
  const {
    currentLanguage,
    setTypingLanguage,
    storage,
    t,
    recordTestResult,
  } = useApp();

  const activeLang = forcedLanguage || currentLanguage;

  // Sync forcedLanguage with app context on mount if provided
  useEffect(() => {
    if (forcedLanguage && forcedLanguage.id !== currentLanguage.id) {
      setTypingLanguage(forcedLanguage.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedLanguage?.id]);

  const [mode, setMode] = useState<"30s" | "60s" | "120s" | "lesson" | "weak-keys">(
    lessonId ? "lesson" : initialMode
  );
  const [contentType, setContentType] = useState<"sentences" | "words">("sentences");
  const [targetText, setTargetText] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [hasCurrentError, setHasCurrentError] = useState<boolean>(false);

  const durationForMode = (m: typeof mode): number => {
    if (m === "30s") return 30;
    if (m === "60s") return 60;
    if (m === "120s") return 120;
    return 60; // default 60s max for lessons / weak-keys drill
  };

  const [timeLeft, setTimeLeft] = useState<number>(durationForMode(mode));
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Metrics tracking refs
  const totalTypedRef = useRef<number>(0);
  const errorMapRef = useRef<Record<string, number>>({});
  const wpmSamplesRef = useRef<number[]>([]);
  const isComposingRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const savedResultRef = useRef<boolean>(false);

  const initTest = useCallback(
    (selectedMode = mode, selectedLang = activeLang, selectedContent = contentType) => {
      const weakMap = storage.weakKeys[selectedLang.id] || {};
      const text = generatePracticeText(selectedLang, selectedMode, {
        lessonId,
        weakKeysMap: weakMap,
        contentType: selectedContent,
      });
      setTargetText(text.normalize("NFC"));
      setTypedText("");
      setIsRunning(false);
      setIsFinished(false);
      setHasCurrentError(false);
      const dur = durationForMode(selectedMode);
      setTimeLeft(dur);
      setElapsedSeconds(0);
      totalTypedRef.current = 0;
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

  // Count currently matching characters
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

  // Complete test & persist result
  const finishTest = useCallback(
    (finalTyped: string, finalElapsed: number) => {
      if (savedResultRef.current) return;
      savedResultRef.current = true;
      setIsRunning(false);
      setIsFinished(true);

      const effectiveElapsed = Math.max(1, finalElapsed);
      const correctChars = countCorrectChars(finalTyped, targetText);
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
        durationSeconds: effectiveElapsed,
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
    [activeLang.id, countCorrectChars, lessonId, mode, onLessonComplete, recordTestResult, targetText]
  );

  // Timer interval
  useEffect(() => {
    if (!isRunning || isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextElapsed = prev + 1;
        const correctNow = countCorrectChars(typedText, targetText);
        const currentWpm = calculateWPM(correctNow, nextElapsed);
        wpmSamplesRef.current.push(currentWpm);
        return nextElapsed;
      });

      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest(typedText, durationForMode(mode));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isFinished, typedText, targetText, mode, countCorrectChars, finishTest]);

  // Process newly typed string (handles standard keys + RTL IME composition)
  // Blocks advancing until the user types the exact expected character
  const applyNewTypedValue = (rawNewVal: string) => {
    if (isFinished) return;
    const normalized = rawNewVal.normalize("NFC");

    if (!isRunning && normalized.length > 0) {
      setIsRunning(true);
    }

    // Allow backspace if user wants to step back
    if (normalized.length < typedText.length) {
      setTypedText(normalized);
      setHasCurrentError(false);
      return;
    }

    // Check newly typed character(s) one by one; only advance on exact match
    let accepted = typedText;
    let hitWrongKey = false;

    for (let i = typedText.length; i < normalized.length; i++) {
      const typedChar = normalized[i];
      const expectedChar = targetText[accepted.length];
      if (!expectedChar) break;

      totalTypedRef.current += 1;

      if (typedChar === expectedChar) {
        accepted += typedChar;
        hitWrongKey = false;
      } else {
        errorMapRef.current[expectedChar] =
          (errorMapRef.current[expectedChar] || 0) + 1;
        hitWrongKey = true;
        break; // Stop immediately: do not advance cursor until correct character is pressed
      }
    }

    setHasCurrentError(hitWrongKey);
    setTypedText(accepted);

    if (accepted.length >= targetText.length && targetText.length > 0) {
      finishTest(accepted, Math.max(1, elapsedSeconds));
    }
  };

  // Physical keydown handler using event.code for keyboard highlight & event.key for typing
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
  const liveWpm = calculateWPM(correctCharsLive, Math.max(1, elapsedSeconds));
  const liveAccuracy = calculateAccuracy(
    correctCharsLive,
    Math.max(correctCharsLive, totalTypedRef.current)
  );
  const liveConsistency = calculateConsistency(wpmSamplesRef.current);
  const nextChar =
    typedText.length < targetText.length ? targetText[typedText.length] : null;

  const isRTL = activeLang.direction === "rtl";

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      {/* Top Bar: Language + Mode + Content Type */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Language Pills */}
        {!lessonId && (
          <div className="flex items-center gap-1.5">
            {LANGUAGES_LIST.map((lang) => {
              const active = activeLang.id === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setTypingLanguage(lang.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {lang.name} ({lang.nativeName})
                </button>
              );
            })}
          </div>
        )}

        {/* Mode Selector (30s / 60s / 2 min / Weak Keys) */}
        {!lessonId && (
          <div className="flex flex-wrap items-center gap-1.5">
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
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 ${
                  mode === m.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {m.id === "weak-keys" && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span>{m.label}</span>
              </button>
            ))}

            {mode !== "weak-keys" && (
              <div className="ms-1 flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setContentType("sentences")}
                  className={`px-2.5 py-1 rounded-lg ${
                    contentType === "sentences"
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Sentences
                </button>
                <button
                  type="button"
                  onClick={() => setContentType("words")}
                  className={`px-2.5 py-1 rounded-lg ${
                    contentType === "words"
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Words
                </button>
              </div>
            )}
          </div>
        )}

        {/* Restart & Keyboard Toggle */}
        <div className="flex items-center gap-2 ms-auto">
          <button
            type="button"
            onClick={() => setShowKeyboard((s) => !s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              showKeyboard
                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 text-slate-500"
            }`}
          >
            <KeyboardIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.keyboardToggle}</span>
          </button>

          <button
            type="button"
            onClick={() => initTest(mode, activeLang, contentType)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.restart} (Tab)</span>
          </button>
        </div>
      </div>

      {/* RTL / Language Help Note */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>{activeLang.helpNote}</span>
        </div>
        {isRTL && (
          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[11px] font-semibold shrink-0">
            RTL Mode Active
          </span>
        )}
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t.wpm}</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {liveWpm}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t.accuracy}</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {liveAccuracy}%
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.timeRemaining}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {timeLeft}s
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.consistency}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {liveConsistency}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Typing Area */}
      <div
        onClick={() => inputRef.current?.focus()}
        dir={activeLang.direction}
        className={`relative cursor-text rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 p-6 sm:p-8 shadow-sm transition-colors min-h-[190px] flex flex-col justify-between ${activeLang.fontClass}`}
      >
        {/* Hidden Input that captures all keystrokes and IME composition */}
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

        {/* Prompt Display: For Urdu/Arabic joined scripts, per-span wrapping breaks ligature shaping in some browsers if not styled carefully, OR we render character spans with unicode-bidi & ligature-friendly font styling */}
        <div
          className={`select-none leading-relaxed tracking-wide ${
            isRTL ? "text-2xl sm:text-3xl leading-[2.4]" : "text-xl sm:text-2xl leading-relaxed"
          }`}
        >
          {Array.from(targetText).map((char, idx) => {
            const isTyped = idx < typedText.length;
            const isCorrect = isTyped && typedText[idx] === char;
            const isWrong = isTyped && typedText[idx] !== char;
            const isCurrent = idx === typedText.length;

            let colorClass = "text-slate-400 dark:text-slate-500";
            if (isCorrect) {
              colorClass = "text-emerald-600 dark:text-emerald-400";
            } else if (isWrong || (isCurrent && hasCurrentError)) {
              colorClass =
                "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70 rounded";
            }

            return (
              <span
                key={idx}
                className={`${colorClass} ${
                  isCurrent
                    ? hasCurrentError
                      ? "underline decoration-2 decoration-rose-500 underline-offset-8 rounded"
                      : "underline decoration-2 decoration-emerald-500 underline-offset-8 bg-emerald-500/10 rounded"
                    : ""
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {!isRunning && !isFinished && typedText.length === 0 && (
          <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <span>{t.startTypingPrompt}</span>
          </div>
        )}
      </div>

      {/* Post-Test Summary Banner */}
      {isFinished && (
        <div className="p-6 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            {liveAccuracy >= 90 ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.testCompleted}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {t.wpm}: <strong>{liveWpm}</strong> · {t.accuracy}:{" "}
                <strong>{liveAccuracy}%</strong> · {t.consistency}:{" "}
                <strong>{liveConsistency}%</strong>
                {lessonId &&
                  (liveAccuracy >= 90
                    ? " — Lesson passed (90%+ accuracy)! Next lesson unlocked."
                    : " — Need 90%+ accuracy to unlock the next lesson. Try again!")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => initTest(mode, activeLang, contentType)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              {t.tryAgain}
            </button>
            {!lessonId && (
              <button
                type="button"
                onClick={() => {
                  setMode("weak-keys");
                  initTest("weak-keys", activeLang, contentType);
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {t.practiceWeakKeys}
              </button>
            )}
          </div>
        </div>
      )}

      {/* On-Screen Keyboard */}
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
