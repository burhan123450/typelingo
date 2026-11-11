"use client";

import React from "react";
import { LanguageConfig, KeyMapping } from "@/types/typing";

interface OnScreenKeyboardProps {
  language: LanguageConfig;
  nextChar: string | null;
  pressedCode: string | null;
}

type FingerId =
  | "pinky-l"
  | "ring-l"
  | "middle-l"
  | "index-l"
  | "thumb"
  | "index-r"
  | "middle-r"
  | "ring-r"
  | "pinky-r";

const CODE_TO_FINGER: Record<string, FingerId> = {
  Backquote: "pinky-l",
  Digit1: "pinky-l",
  Tab: "pinky-l",
  CapsLock: "pinky-l",
  ShiftLeft: "pinky-l",
  KeyQ: "pinky-l",
  KeyA: "pinky-l",
  KeyZ: "pinky-l",

  Digit2: "ring-l",
  KeyW: "ring-l",
  KeyS: "ring-l",
  KeyX: "ring-l",

  Digit3: "middle-l",
  KeyE: "middle-l",
  KeyD: "middle-l",
  KeyC: "middle-l",

  Digit4: "index-l",
  Digit5: "index-l",
  KeyR: "index-l",
  KeyT: "index-l",
  KeyF: "index-l",
  KeyG: "index-l",
  KeyV: "index-l",
  KeyB: "index-l",

  Space: "thumb",

  Digit6: "index-r",
  Digit7: "index-r",
  KeyY: "index-r",
  KeyU: "index-r",
  KeyH: "index-r",
  KeyJ: "index-r",
  KeyN: "index-r",
  KeyM: "index-r",

  Digit8: "middle-r",
  KeyI: "middle-r",
  KeyK: "middle-r",
  Comma: "middle-r",

  Digit9: "ring-r",
  KeyO: "ring-r",
  KeyL: "ring-r",
  Period: "ring-r",

  Digit0: "pinky-r",
  Minus: "pinky-r",
  Equal: "pinky-r",
  Backspace: "pinky-r",
  KeyP: "pinky-r",
  BracketLeft: "pinky-r",
  BracketRight: "pinky-r",
  Backslash: "pinky-r",
  Semicolon: "pinky-r",
  Quote: "pinky-r",
  Enter: "pinky-r",
  Slash: "pinky-r",
  ShiftRight: "pinky-r",
};

export default function OnScreenKeyboard({
  language,
  nextChar,
  pressedCode,
}: OnScreenKeyboardProps) {
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

  const activeFinger: FingerId | null = targetKeyCode
    ? CODE_TO_FINGER[targetKeyCode] || null
    : null;

  // Opposite hand pinky presses Shift when required
  const shiftCode: string | null = requiresShift
    ? activeFinger && activeFinger.endsWith("-l")
      ? "ShiftRight"
      : "ShiftLeft"
    : null;

  const isFingerActive = (f: FingerId) =>
    activeFinger === f ||
    (shiftCode === "ShiftLeft" && f === "pinky-l") ||
    (shiftCode === "ShiftRight" && f === "pinky-r");

  const fingerStroke = (f: FingerId) =>
    isFingerActive(f) ? "#f97316" : "currentColor";
  const fingerWidth = (f: FingerId) => (isFingerActive(f) ? 3.5 : 1.5);
  const fingerFill = (f: FingerId) =>
    isFingerActive(f) ? "rgba(249, 115, 22, 0.14)" : "rgba(148, 163, 184, 0.12)";

  return (
    <div
      dir="ltr"
      className="relative w-full max-w-3xl mx-auto pt-2 pb-16 select-none overflow-x-auto"
    >
      {/* Keyboard Frame */}
      <div className="min-w-[620px] p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col gap-1.5">
        {language.keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center gap-1.5">
            {row.map((keyObj: KeyMapping) => {
              const isTarget =
                keyObj.code === targetKeyCode || keyObj.code === shiftCode;
              const isPressed = pressedCode === keyObj.code;
              const isHomeBump = keyObj.code === "KeyF" || keyObj.code === "KeyJ";

              const flexBasis = keyObj.width
                ? `${keyObj.width * 2.85}rem`
                : "2.85rem";

              const isSpecialKey =
                keyObj.code === "Tab" ||
                keyObj.code === "CapsLock" ||
                keyObj.code === "ShiftLeft" ||
                keyObj.code === "ShiftRight" ||
                keyObj.code === "Enter" ||
                keyObj.code === "Backspace" ||
                keyObj.code === "Space";

              return (
                <div
                  key={keyObj.code}
                  style={{ width: flexBasis }}
                  className={`relative h-11 rounded-lg flex flex-col items-center justify-center px-1 border transition-all duration-75 ${
                    isPressed
                      ? "bg-emerald-600 text-white border-emerald-600 scale-95"
                      : isTarget
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-sm font-bold scale-[1.03]"
                      : "bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {keyObj.shiftLabel && !isSpecialKey && (
                    <span
                      className={`text-[10px] leading-none self-start ps-1 ${
                        isTarget
                          ? "text-white/90"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {keyObj.shiftLabel}
                    </span>
                  )}
                  <span
                    className={`${
                      isSpecialKey
                        ? "text-xs text-slate-400 dark:text-slate-500"
                        : language.id === "ur"
                        ? "font-urdu text-base"
                        : language.id === "ar"
                        ? "font-arabic text-base"
                        : "font-sans text-sm uppercase font-semibold"
                    } ${isTarget && isSpecialKey ? "!text-white font-bold" : ""} leading-tight`}
                  >
                    {isSpecialKey && keyObj.code !== "Backspace" ? "" : keyObj.label}
                  </span>
                  {isHomeBump && (
                    <span
                      className={`absolute bottom-1.5 w-3 h-0.5 rounded-full ${
                        isTarget ? "bg-white" : "bg-slate-400 dark:bg-slate-500"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Semi-Transparent Hands & Finger Guide Overlay (TypingClub Style) */}
      <svg
        viewBox="0 0 680 180"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[620px] h-[155px] text-slate-400/60 dark:text-slate-500/50"
        aria-hidden="true"
      >
        {/* LEFT HAND */}
        <g>
          {/* Left Palm Base */}
          <path
            d="M 135 178 C 130 135, 145 105, 165 98 L 265 98 C 285 105, 295 135, 290 178 Z"
            fill="rgba(148, 163, 184, 0.10)"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          {/* Left Pinky */}
          <rect
            x="138"
            y="38"
            width="24"
            height="68"
            rx="12"
            transform="rotate(-10 150 72)"
            fill={fingerFill("pinky-l")}
            stroke={fingerStroke("pinky-l")}
            strokeWidth={fingerWidth("pinky-l")}
          />
          {/* Left Ring */}
          <rect
            x="170"
            y="20"
            width="25"
            height="82"
            rx="12.5"
            transform="rotate(-4 182 60)"
            fill={fingerFill("ring-l")}
            stroke={fingerStroke("ring-l")}
            strokeWidth={fingerWidth("ring-l")}
          />
          {/* Left Middle */}
          <rect
            x="203"
            y="12"
            width="26"
            height="88"
            rx="13"
            fill={fingerFill("middle-l")}
            stroke={fingerStroke("middle-l")}
            strokeWidth={fingerWidth("middle-l")}
          />
          {/* Left Index */}
          <rect
            x="236"
            y="22"
            width="26"
            height="80"
            rx="13"
            transform="rotate(6 249 62)"
            fill={fingerFill("index-l")}
            stroke={fingerStroke("index-l")}
            strokeWidth={fingerWidth("index-l")}
          />
          {/* Left Thumb */}
          <rect
            x="276"
            y="72"
            width="26"
            height="64"
            rx="13"
            transform="rotate(28 289 104)"
            fill={fingerFill("thumb")}
            stroke={fingerStroke("thumb")}
            strokeWidth={fingerWidth("thumb")}
          />
        </g>

        {/* RIGHT HAND */}
        <g>
          {/* Right Palm Base */}
          <path
            d="M 390 178 C 385 135, 395 105, 415 98 L 515 98 C 535 105, 550 135, 545 178 Z"
            fill="rgba(148, 163, 184, 0.10)"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          {/* Right Thumb */}
          <rect
            x="378"
            y="72"
            width="26"
            height="64"
            rx="13"
            transform="rotate(-28 391 104)"
            fill={fingerFill("thumb")}
            stroke={fingerStroke("thumb")}
            strokeWidth={fingerWidth("thumb")}
          />
          {/* Right Index */}
          <rect
            x="418"
            y="22"
            width="26"
            height="80"
            rx="13"
            transform="rotate(-6 431 62)"
            fill={fingerFill("index-r")}
            stroke={fingerStroke("index-r")}
            strokeWidth={fingerWidth("index-r")}
          />
          {/* Right Middle */}
          <rect
            x="451"
            y="12"
            width="26"
            height="88"
            rx="13"
            fill={fingerFill("middle-r")}
            stroke={fingerStroke("middle-r")}
            strokeWidth={fingerWidth("middle-r")}
          />
          {/* Right Ring */}
          <rect
            x="485"
            y="20"
            width="25"
            height="82"
            rx="12.5"
            transform="rotate(4 497 60)"
            fill={fingerFill("ring-r")}
            stroke={fingerStroke("ring-r")}
            strokeWidth={fingerWidth("ring-r")}
          />
          {/* Right Pinky */}
          <rect
            x="518"
            y="38"
            width="24"
            height="68"
            rx="12"
            transform="rotate(10 530 72)"
            fill={fingerFill("pinky-r")}
            stroke={fingerStroke("pinky-r")}
            strokeWidth={fingerWidth("pinky-r")}
          />
        </g>
      </svg>
    </div>
  );
}
