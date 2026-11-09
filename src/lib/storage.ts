import {
  UserStorageData,
  TestResult,
  DailyGoal,
  LessonProgress,
} from "@/types/typing";

const STORAGE_KEY = "typelingo_v1_data";

const DEFAULT_DATA: UserStorageData = {
  version: 1,
  selectedLanguageId: "en",
  uiLanguageId: "en",
  theme: "dark",
  dailyGoal: {
    type: "minutes",
    target: 10,
  },
  results: [],
  lessonProgress: {},
  weakKeys: {},
};

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadStorageData(): UserStorageData {
  if (typeof window === "undefined") {
    return DEFAULT_DATA;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<UserStorageData>;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      dailyGoal: parsed.dailyGoal ?? DEFAULT_DATA.dailyGoal,
      results: Array.isArray(parsed.results) ? parsed.results : [],
      lessonProgress: parsed.lessonProgress ?? {},
      weakKeys: parsed.weakKeys ?? {},
    };
  } catch (e) {
    console.error("Failed to load storage data:", e);
    return DEFAULT_DATA;
  }
}

export function saveStorageData(data: UserStorageData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save storage data:", e);
  }
}

export function saveTestResult(result: TestResult): UserStorageData {
  const data = loadStorageData();
  const updatedResults = [...data.results, result];

  // Update weakKeys for this language
  const langWeak = { ...(data.weakKeys[result.languageId] || {}) };
  for (const [char, count] of Object.entries(result.errorMap)) {
    if (char.trim().length > 0) {
      langWeak[char] = (langWeak[char] || 0) + count;
    }
  }

  // Update lesson progress if it was a lesson
  const updatedLessons = { ...data.lessonProgress };
  if (result.mode === "lesson" && result.lessonId) {
    const key = `${result.languageId}:${result.lessonId}`;
    const existing = updatedLessons[key];
    const completed = (existing?.completed ?? false) || result.accuracy >= 90;
    updatedLessons[key] = {
      lessonId: result.lessonId,
      languageId: result.languageId,
      bestWpm: Math.max(existing?.bestWpm ?? 0, result.wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, result.accuracy),
      completed,
      attempts: (existing?.attempts ?? 0) + 1,
    };
  }

  const nextData: UserStorageData = {
    ...data,
    results: updatedResults,
    weakKeys: {
      ...data.weakKeys,
      [result.languageId]: langWeak,
    },
    lessonProgress: updatedLessons,
  };

  saveStorageData(nextData);
  return nextData;
}

export function updateDailyGoal(goal: DailyGoal): UserStorageData {
  const data = loadStorageData();
  const nextData = { ...data, dailyGoal: goal };
  saveStorageData(nextData);
  return nextData;
}

export function updatePreferences(prefs: {
  selectedLanguageId?: string;
  uiLanguageId?: string;
  theme?: "light" | "dark";
}): UserStorageData {
  const data = loadStorageData();
  const nextData = {
    ...data,
    ...(prefs.selectedLanguageId ? { selectedLanguageId: prefs.selectedLanguageId } : {}),
    ...(prefs.uiLanguageId ? { uiLanguageId: prefs.uiLanguageId } : {}),
    ...(prefs.theme ? { theme: prefs.theme } : {}),
  };
  saveStorageData(nextData);
  return nextData;
}

export function clearWeakKeysForLanguage(languageId: string): UserStorageData {
  const data = loadStorageData();
  const nextWeak = { ...data.weakKeys };
  delete nextWeak[languageId];
  const nextData = { ...data, weakKeys: nextWeak };
  saveStorageData(nextData);
  return nextData;
}

export function exportProgressJson(): string {
  const data = loadStorageData();
  return JSON.stringify(data, null, 2);
}

export function importProgressJson(jsonString: string): {
  success: boolean;
  data?: UserStorageData;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString) as Partial<UserStorageData>;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.results)) {
      return {
        success: false,
        error: "Invalid backup file format. Missing 'results' array.",
      };
    }
    const merged: UserStorageData = {
      ...DEFAULT_DATA,
      ...parsed,
      dailyGoal: parsed.dailyGoal ?? DEFAULT_DATA.dailyGoal,
      results: parsed.results,
      lessonProgress: parsed.lessonProgress ?? {},
      weakKeys: parsed.weakKeys ?? {},
    };
    saveStorageData(merged);
    return { success: true, data: merged };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to parse JSON file.",
    };
  }
}

export function calculateStreak(results: TestResult[]): {
  currentStreak: number;
  longestStreak: number;
  practicedToday: boolean;
} {
  if (results.length === 0) {
    return { currentStreak: 0, longestStreak: 0, practicedToday: false };
  }

  const uniqueDates = Array.from(new Set(results.map((r) => r.dateStr))).sort();
  const dateSet = new Set(uniqueDates);

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const practicedToday = dateSet.has(todayStr);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date();
  if (!practicedToday && dateSet.has(yesterdayStr)) {
    checkDate = yesterday;
  }

  if (practicedToday || dateSet.has(yesterdayStr)) {
    while (true) {
      const ds = getLocalDateString(checkDate);
      if (dateSet.has(ds)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const ds of uniqueDates) {
    const [y, m, d] = ds.split("-").map(Number);
    const curDate = new Date(y, m - 1, d);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round(
        (curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = curDate;
  }

  return { currentStreak, longestStreak, practicedToday };
}
