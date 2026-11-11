import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserStorageData, TestResult, DailyGoal, LessonProgress } from "@/types/typing";

/**
 * ALL data storage lives in this one file.
 * - Guests: data is kept in the browser (localStorage).
 * - Signed-in users (Gmail): the same data is also synced to Supabase.
 *
 * NOTE: the key name below is kept from v1 on purpose, so existing visitors
 * do not lose their progress after the BigBird rename.
 */
const STORAGE_KEY = "typelingo_v1_data";

export const DEFAULT_DATA: UserStorageData = {
  version: 1,
  ownerUserId: null,
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

// ---------- Supabase (active only when the two Vercel environment variables exist) ----------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  if (!supabase) {
    return {
      error:
        "Gmail sign-in is not set up yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    };
  }
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) return { error: error.message };
  return {};
}

/**
 * Signs out AND clears this browser's progress, so the next person
 * using the same computer does not see (or inherit) your data.
 * Theme and language choices are kept.
 */
export async function signOutUser(): Promise<UserStorageData> {
  const current = loadStorageData();
  if (supabase && current.ownerUserId) {
    await pushStorageToCloud(current.ownerUserId, current);
    await supabase.auth.signOut();
  }
  const cleared: UserStorageData = {
    ...DEFAULT_DATA,
    theme: current.theme,
    uiLanguageId: current.uiLanguageId,
    selectedLanguageId: current.selectedLanguageId,
  };
  writeLocal(cleared);
  return cleared;
}

function mergeLessonProgress(
  a: Record<string, LessonProgress>,
  b: Record<string, LessonProgress>
): Record<string, LessonProgress> {
  const out: Record<string, LessonProgress> = { ...a };
  for (const [key, lp] of Object.entries(b)) {
    const existing = out[key];
    out[key] = existing
      ? {
          ...lp,
          bestWpm: Math.max(existing.bestWpm, lp.bestWpm),
          bestAccuracy: Math.max(existing.bestAccuracy, lp.bestAccuracy),
          completed: existing.completed || lp.completed,
          attempts: Math.max(existing.attempts, lp.attempts),
        }
      : lp;
  }
  return out;
}

function mergeWeakKeys(
  a: Record<string, Record<string, number>>,
  b: Record<string, Record<string, number>>
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  const langs = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const lang of Array.from(langs)) {
    const merged: Record<string, number> = { ...(a[lang] || {}) };
    for (const [ch, count] of Object.entries(b[lang] || {})) {
      merged[ch] = Math.max(merged[ch] || 0, count);
    }
    out[lang] = merged;
  }
  return out;
}

/**
 * Called right after a user signs in.
 * - Guest progress on this browser is moved into the user's account.
 * - If this browser holds ANOTHER user's data, it is discarded (never mixed).
 */
export async function syncStorageWithCloud(userId: string): Promise<UserStorageData> {
  let local = loadStorageData();

  if (local.ownerUserId && local.ownerUserId !== userId) {
    local = {
      ...DEFAULT_DATA,
      theme: local.theme,
      uiLanguageId: local.uiLanguageId,
      selectedLanguageId: local.selectedLanguageId,
    };
  }

  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("payload")
      .eq("user_id", userId)
      .maybeSingle();

    let merged: UserStorageData = { ...local, ownerUserId: userId };

    if (!error && data?.payload) {
      const cloud = { ...DEFAULT_DATA, ...(data.payload as Partial<UserStorageData>) };
      const byId = new Map<string, TestResult>();
      for (const r of [...(cloud.results || []), ...local.results]) byId.set(r.id, r);

      merged = {
        ...DEFAULT_DATA,
        ...cloud,
        // Keep the choices made on this device
        theme: local.theme,
        uiLanguageId: local.uiLanguageId,
        selectedLanguageId: local.selectedLanguageId,
        dailyGoal: local.ownerUserId === userId ? local.dailyGoal : cloud.dailyGoal,
        ownerUserId: userId,
        results: Array.from(byId.values()).sort((a, b) => a.timestamp - b.timestamp),
        lessonProgress: mergeLessonProgress(cloud.lessonProgress || {}, local.lessonProgress),
        weakKeys: mergeWeakKeys(cloud.weakKeys || {}, local.weakKeys),
      };
    }

    writeLocal(merged);
    await pushStorageToCloud(userId, merged);
    return merged;
  } catch (e) {
    console.error("Cloud sync error:", e);
    const fallback = { ...local, ownerUserId: userId };
    writeLocal(fallback);
    return fallback;
  }
}

export async function pushStorageToCloud(userId: string, data: UserStorageData): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        payload: data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) console.error("Failed to push to cloud:", error.message);
  } catch (e) {
    console.error("Failed to push to cloud:", e);
  }
}

/** Permanently deletes the signed-in user's progress from the cloud (privacy). */
export async function deleteCloudData(userId: string): Promise<{ error?: string }> {
  if (!supabase) return { error: "Cloud sync is not configured." };
  const { error } = await supabase.from("user_progress").delete().eq("user_id", userId);
  if (error) return { error: error.message };
  return {};
}

// Wait 1.5s after the last change before uploading, so we don't upload on every keystroke.
let pushTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePush(data: UserStorageData) {
  if (!supabase || !data.ownerUserId) return;
  const userId = data.ownerUserId;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushStorageToCloud(userId, data);
  }, 1500);
}

// ---------- Local (browser) storage ----------

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalize(parsed: Partial<UserStorageData>): UserStorageData {
  return {
    ...DEFAULT_DATA,
    ...parsed,
    dailyGoal: parsed.dailyGoal ?? DEFAULT_DATA.dailyGoal,
    results: Array.isArray(parsed.results) ? parsed.results : [],
    lessonProgress: parsed.lessonProgress ?? {},
    weakKeys: parsed.weakKeys ?? {},
  };
}

export function loadStorageData(): UserStorageData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return normalize(JSON.parse(raw) as Partial<UserStorageData>);
  } catch (e) {
    console.error("Failed to load storage data:", e);
    return DEFAULT_DATA;
  }
}

function writeLocal(data: UserStorageData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save storage data:", e);
  }
}

export function saveStorageData(data: UserStorageData): void {
  writeLocal(data);
  schedulePush(data);
}

export function saveTestResult(result: TestResult): UserStorageData {
  const data = loadStorageData();
  const updatedResults = [...data.results, result];

  // Add this test's mistakes to the weak-key counts for this language
  const langWeak = { ...(data.weakKeys[result.languageId] || {}) };
  for (const [char, count] of Object.entries(result.errorMap)) {
    if (char.trim().length > 0) {
      langWeak[char] = (langWeak[char] || 0) + count;
    }
  }

  // Update lesson progress (a lesson is completed with 90%+ accuracy)
  const updatedLessons = { ...data.lessonProgress };
  if (result.mode === "lesson" && result.lessonId) {
    const key = `${result.languageId}:${result.lessonId}`;
    const existing = updatedLessons[key];
    updatedLessons[key] = {
      lessonId: result.lessonId,
      languageId: result.languageId,
      bestWpm: Math.max(existing?.bestWpm ?? 0, result.wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, result.accuracy),
      completed: (existing?.completed ?? false) || result.accuracy >= 90,
      attempts: (existing?.attempts ?? 0) + 1,
    };
  }

  const nextData: UserStorageData = {
    ...data,
    results: updatedResults,
    weakKeys: { ...data.weakKeys, [result.languageId]: langWeak },
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
  const { ownerUserId: _owner, ...rest } = loadStorageData();
  void _owner;
  return JSON.stringify(rest, null, 2);
}

export function importProgressJson(jsonString: string): {
  success: boolean;
  data?: UserStorageData;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString) as Partial<UserStorageData>;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.results)) {
      return { success: false, error: "This is not a valid backup file." };
    }
    const current = loadStorageData();
    // Imported data always belongs to whoever is using this browser right now
    const merged: UserStorageData = { ...normalize(parsed), ownerUserId: current.ownerUserId };
    saveStorageData(merged);
    return { success: true, data: merged };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Could not read this file.",
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

  // Current streak: counts back from today (or from yesterday if not practiced yet today)
  let currentStreak = 0;
  if (practicedToday || dateSet.has(yesterdayStr)) {
    const checkDate = practicedToday ? new Date() : yesterday;
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Longest streak ever
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;
  for (const ds of uniqueDates) {
    const [y, m, d] = ds.split("-").map(Number);
    const curDate = new Date(y, m - 1, d);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / 86400000);
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = curDate;
  }

  return { currentStreak, longestStreak, practicedToday };
}
