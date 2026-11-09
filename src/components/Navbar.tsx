"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { LANGUAGES_LIST } from "@/lib/languages";
import {
  Keyboard,
  BookOpen,
  BarChart3,
  Sun,
  Moon,
  Globe,
  Flame,
  LogOut,
  X,
} from "lucide-react";
import { calculateStreak } from "@/lib/storage";

export default function Navbar() {
  const pathname = usePathname();
  const {
    storage,
    isHydrated,
    user,
    authError,
    currentLanguage,
    uiLanguage,
    t,
    setTypingLanguage,
    setUiLanguage,
    toggleTheme,
    loginWithGoogle,
    logout,
    clearAuthError,
  } = useApp();

  const streak = isHydrated ? calculateStreak(storage.results).currentStreak : 0;

  const navItems = [
    { href: "/", label: t.navPractice, icon: Keyboard },
    { href: "/lessons", label: t.navLessons, icon: BookOpen },
    { href: "/dashboard", label: t.navDashboard, icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-base shadow-sm group-hover:bg-emerald-500 transition-colors">
            TL
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              <span>Type</span>
              <span className="text-emerald-600 dark:text-emerald-400">Lingo</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-none">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
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

        {/* Controls: Streak, Typing Language, UI Language, Theme Toggle, Google Login */}
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
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
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
          <div className="relative hidden md:flex items-center">
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

          {/* Sign in with Google / Gmail */}
          {user ? (
            <div className="flex items-center gap-2 ps-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="max-w-[110px] truncate">{user.name || user.email}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Sign in with Gmail</span>
            </button>
          )}
        </div>
      </div>

      {/* Helpful setup banner if user clicks Sign in before adding Supabase keys in Vercel */}
      {authError && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-t border-amber-200 dark:border-amber-800 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
          <span>{authError}</span>
          <button
            type="button"
            onClick={clearAuthError}
            className="p-1 rounded hover:bg-amber-200/50 dark:hover:bg-amber-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
}
