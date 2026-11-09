"use client";

import React from "react";
import { LanguageConfig, KeyMapping } from "@/types/typing";

interface OnScreenKeyboardProps {
  language: LanguageConfig;
  nextChar: string | null;
  pressedCode: string | null;
}

export default function OnScreenKeyboard({
  language,
  nextChar,
  pressedCode,
}: OnScreenKeyboardProps) {
  // Determine which key (and whether Shift is needed) matches nextChar
  let targetKeyCode: string | null = null;
  let requiresShift = false;

  if (nextChar) {
    if (nextChar === " ") {
      targetKeyCode = "Space";
    } else {
      for (const row of language.keyboardRows) {
        for (const k of row) {
          if (k.label === nextChar) {
            targetKeyCode = k.code;
            requiresShift = false;
            break;
          }
          if (k.shiftLabel && k.shiftLabel === nextChar) {
            targetKeyCode = k.code;
            requiresShift = true;
            break;
          }
        }
        if (targetKeyCode) break;
      }
    }
  }

  return (
    <div
      dir="ltr"
      className="w-full max-w-4xl mx-auto p-3 sm:p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-inner select-none overflow-x-auto"
    >
      <div className="min-w-[640px] flex flex-col gap-1.5">
        {language.keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center gap-1.5">
            {row.map((keyObj: KeyMapping) => {
              const isTarget =
                keyObj.code === targetKeyCode ||
                (requiresShift &&
                  (keyObj.code === "ShiftLeft" || keyObj.code === "ShiftRight"));
              const isPressed = pressedCode === keyObj.code;
              const isHomeBump = keyObj.code === "KeyF" || keyObj.code === "KeyJ";

              const flexBasis = keyObj.width ? `${keyObj.width * 3.1}rem` : "3.1rem";

              return (
                <div
                  key={keyObj.code}
                  style={{ width: flexBasis }}
                  className={`relative h-11 sm:h-12 rounded-lg flex flex-col items-center justify-center px-1 border text-sm font-medium transition-all duration-75 ${
                    isPressed
                      ? "bg-emerald-600 text-white border-emerald-500 scale-95 shadow-none"
                      : isTarget
                      ? "bg-emerald-500/20 dark:bg-emerald-500/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/40 font-bold"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
                  }`}
                >
                  {keyObj.shiftLabel && (
                    <span className="text-[10px] leading-none text-slate-400 dark:text-slate-500 self-start ps-1">
                      {keyObj.shiftLabel}
                    </span>
                  )}
                  <span
                    className={`${
                      language.id === "ur"
                        ? "font-urdu text-base"
                        : language.id === "ar"
                        ? "font-arabic text-base"
                        : "font-sans text-sm"
                    } leading-tight`}
                  >
                    {keyObj.label}
                  </span>
                  {isHomeBump && (
                    <span className="absolute bottom-1 w-3 h-0.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
