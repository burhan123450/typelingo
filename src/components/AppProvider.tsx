"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserStorageData, TestResult, DailyGoal, LanguageConfig } from "@/types/typing";
import {
  loadStorageData,
  saveTestResult,
  updateDailyGoal,
  updatePreferences,
  clearWeakKeysForLanguage,
  importProgressJson,
  supabase,
  signInWithGoogle,
  signOutUser,
  syncStorageWithCloud,
} from "@/lib/storage";
import { getLanguageById, LANGUAGES_LIST } from "@/lib/languages";
import { UI_TRANSLATIONS, UIStrings } from "@/lib/i18n";

export interface AuthUserInfo {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface AppContextValue {
  storage: UserStorageData;
  isHydrated: boolean;
  user: AuthUserInfo | null;
  authError: string | null;
  currentLanguage: LanguageConfig;
  uiLanguage: LanguageConfig;
  t: UIStrings;
  setTypingLanguage: (langId: string) => void;
  setUiLanguage: (langId: string) => void;
  toggleTheme: () => void;
  recordTestResult: (result: TestResult) => void;
  setDailyGoal: (goal: DailyGoal) => void;
  resetWeakKeys: (langId: string) => void;
  importBackup: (json: string) => { success: boolean; error?: string };
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [storage, setStorage] = useState<UserStorageData>(() => loadStorageData());
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<AuthUserInfo | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadStorageData();
    setStorage(loaded);
    setIsHydrated(true);

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const sessionUser = data.session?.user;
        if (sessionUser) {
          const info: AuthUserInfo = {
            id: sessionUser.id,
            email: sessionUser.email,
            name:
              sessionUser.user_metadata?.full_name ||
              sessionUser.user_metadata?.name ||
              sessionUser.email,
            avatarUrl: sessionUser.user_metadata?.avatar_url,
          };
          setUser(info);
          syncStorageWithCloud(sessionUser.id, loaded).then((merged) => {
            setStorage(merged);
          });
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const sessionUser = session?.user;
          if (sessionUser) {
            const info: AuthUserInfo = {
              id: sessionUser.id,
              email: sessionUser.email,
              name:
                sessionUser.user_metadata?.full_name ||
                sessionUser.user_metadata?.name ||
                sessionUser.email,
              avatarUrl: sessionUser.user_metadata?.avatar_url,
            };
            setUser(info);
            const currentLocal = loadStorageData();
            syncStorageWithCloud(sessionUser.id, currentLocal).then((merged) => {
              setStorage(merged);
            });
          } else {
            setUser(null);
          }
        }
      );

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const root = document.documentElement;
    if (storage.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [storage.theme, isHydrated]);

  // Dynamically load Noto Nastaliq Urdu or Noto Naskh Arabic ONLY when selected
  useEffect(() => {
    if (!isHydrated) return;
    const activeIds = new Set([storage.selectedLanguageId, storage.uiLanguageId]);

    if (activeIds.has("ur")) {
      const id = "typelingo-font-urdu";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap";
        document.head.appendChild(link);
      }
    }

    if (activeIds.has("ar")) {
      const id = "typelingo-font-arabic";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&display=swap";
        document.head.appendChild(link);
      }
    }
  }, [storage.selectedLanguageId, storage.uiLanguageId, isHydrated]);

  const currentLanguage = getLanguageById(storage.selectedLanguageId);
  const uiLanguage = getLanguageById(storage.uiLanguageId);
  const t = UI_TRANSLATIONS[storage.uiLanguageId] || UI_TRANSLATIONS.en;

  const setTypingLanguage = (langId: string) => {
    if (!LANGUAGES_LIST.some((l) => l.id === langId)) return;
    const next = updatePreferences({ selectedLanguageId: langId });
    setStorage(next);
  };

  const setUiLanguage = (langId: string) => {
    if (!LANGUAGES_LIST.some((l) => l.id === langId)) return;
    const next = updatePreferences({ uiLanguageId: langId });
    setStorage(next);
  };

  const toggleTheme = () => {
    const nextTheme = storage.theme === "dark" ? "light" : "dark";
    const next = updatePreferences({ theme: nextTheme });
    setStorage(next);
  };

  const recordTestResult = (result: TestResult) => {
    const next = saveTestResult(result);
    setStorage(next);
  };

  const setDailyGoal = (goal: DailyGoal) => {
    const next = updateDailyGoal(goal);
    setStorage(next);
  };

  const resetWeakKeys = (langId: string) => {
    const next = clearWeakKeysForLanguage(langId);
    setStorage(next);
  };

  const importBackup = (json: string) => {
    const res = importProgressJson(json);
    if (res.success && res.data) {
      setStorage(res.data);
    }
    return { success: res.success, error: res.error };
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    const res = await signInWithGoogle();
    if (res.error) {
      setAuthError(res.error);
    }
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AppContext.Provider
      value={{
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
        recordTestResult,
        setDailyGoal,
        resetWeakKeys,
        importBackup,
        loginWithGoogle,
        logout,
        clearAuthError,
      }}
    >
      <div
        dir={uiLanguage.direction}
        className={`min-h-screen flex flex-col transition-colors duration-200 ${
          uiLanguage.id === "ur"
            ? "font-urdu"
            : uiLanguage.id === "ar"
            ? "font-arabic"
            : "font-sans"
        }`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}
