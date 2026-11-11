"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { UserStorageData, TestResult, DailyGoal, LanguageConfig } from "@/types/typing";
import {
  DEFAULT_DATA,
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
  deleteCloudData,
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
  deleteMyCloudData: () => Promise<{ error?: string }>;
  clearAuthError: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const FONT_LINKS: Record<string, string> = {
  ur: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap",
  ar: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap",
};

function toUserInfo(u: {
  id: string;
  email?: string;
  user_metadata?: Record<string, string | undefined>;
}): AuthUserInfo {
  return {
    id: u.id,
    email: u.email,
    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
    avatarUrl: u.user_metadata?.avatar_url,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Start with defaults on BOTH server and browser (prevents the hydration flicker),
  // then load the saved browser data right after the page appears.
  const [storage, setStorage] = useState<UserStorageData>(DEFAULT_DATA);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<AuthUserInfo | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const syncingFor = useRef<string | null>(null);

  useEffect(() => {
    setStorage(loadStorageData());
    setIsHydrated(true);

    if (!supabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const sessionUser = session?.user;

      if (sessionUser && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        setUser(toUserInfo(sessionUser));
        if (syncingFor.current === sessionUser.id) return;
        syncingFor.current = sessionUser.id;
        syncStorageWithCloud(sessionUser.id).then((merged) => setStorage(merged));
      } else if (event === "SIGNED_OUT") {
        syncingFor.current = null;
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Dark / light mode
  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.classList.toggle("dark", storage.theme === "dark");
  }, [storage.theme, isHydrated]);

  const currentLanguage = getLanguageById(storage.selectedLanguageId);
  const uiLanguage = getLanguageById(storage.uiLanguageId);
  const t = UI_TRANSLATIONS[storage.uiLanguageId] || UI_TRANSLATIONS.en;

  // Page language + direction (tells browsers and Google which language the UI is in)
  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.lang = uiLanguage.id;
    document.documentElement.dir = uiLanguage.direction;
  }, [uiLanguage.id, uiLanguage.direction, isHydrated]);

  // Load the Urdu / Arabic font ONLY when that language is in use
  useEffect(() => {
    if (!isHydrated) return;
    const activeIds = new Set([storage.selectedLanguageId, storage.uiLanguageId]);
    for (const [langId, href] of Object.entries(FONT_LINKS)) {
      const id = `bigbird-font-${langId}`;
      if (activeIds.has(langId) && !document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    }
  }, [storage.selectedLanguageId, storage.uiLanguageId, isHydrated]);

  const setTypingLanguage = (langId: string) => {
    if (!LANGUAGES_LIST.some((l) => l.id === langId)) return;
    setStorage(updatePreferences({ selectedLanguageId: langId }));
  };

  const setUiLanguage = (langId: string) => {
    if (!LANGUAGES_LIST.some((l) => l.id === langId)) return;
    setStorage(updatePreferences({ uiLanguageId: langId }));
  };

  const toggleTheme = () => {
    setStorage(updatePreferences({ theme: storage.theme === "dark" ? "light" : "dark" }));
  };

  const recordTestResult = (result: TestResult) => setStorage(saveTestResult(result));
  const setDailyGoal = (goal: DailyGoal) => setStorage(updateDailyGoal(goal));
  const resetWeakKeys = (langId: string) => setStorage(clearWeakKeysForLanguage(langId));

  const importBackup = (json: string) => {
    const res = importProgressJson(json);
    if (res.success && res.data) setStorage(res.data);
    return { success: res.success, error: res.error };
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    const res = await signInWithGoogle();
    if (res.error) setAuthError(res.error);
  };

  const logout = async () => {
    const cleared = await signOutUser();
    syncingFor.current = null;
    setUser(null);
    setStorage(cleared);
  };

  const deleteMyCloudData = async () => {
    if (!user) return { error: "Not signed in." };
    const res = await deleteCloudData(user.id);
    if (!res.error) {
      const cleared = await signOutUser();
      syncingFor.current = null;
      setUser(null);
      setStorage(cleared);
    }
    return res;
  };

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
        deleteMyCloudData,
        clearAuthError: () => setAuthError(null),
      }}
    >
      <div className={`min-h-screen flex flex-col ${uiLanguage.fontClass}`}>{children}</div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
