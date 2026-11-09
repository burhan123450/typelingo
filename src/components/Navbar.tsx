"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { LANGUAGES_LIST } from "@/lib/languages";
import { Keyboard, BookOpen, BarChart3, Sun, Moon, Globe, Flame } from "lucide-react";
import { calculateStreak } from "@/lib/storage";

export default function Navbar() {
  const pathname = usePathname();
  const {
    storage,
    isHydrated,
    currentLanguage,
    uiLanguage,
    t,
    setTypingLanguage,
    setUiLanguage,
    toggleTheme,
  } = useApp();

  const streak = isHydrated ? calculateStreak(storage.results).currentStreak : 0;

  const navItems = [
    { href: "/", label: t.navPractice, icon: Keyboard },
    { href: "/lessons", label: t.navLessons, icon: BookOpen },
    { href: "/dashboard", label: t.navDashboard, icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-sm group-hover:bg-emerald-500 transition-colors">
            TL
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Type</span>
              <span className="text-emerald-600 dark:text-emerald-400">Lingo</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.endsWith("-typing-test")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controls: Streak, Typing Language, UI Language, Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          <Link
            href="/dashboard"
            title={t.streakTitle}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{streak}</span>
          </Link>

          {/* Typing Language Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            {LANGUAGES_LIST.map((lang) => {
              const active = currentLanguage.id === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setTypingLanguage(lang.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    active
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {lang.nativeName}
                </button>
              );
            })}
          </div>

          {/* UI Language Switcher */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 pointer-events-none" />
            <select
              aria-label={t.uiLanguage}
              value={uiLanguage.id}
              onChange={(e) => setUiLanguage(e.target.value)}
              className="ps-7 pe-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  UI: {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {isHydrated && storage.theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
