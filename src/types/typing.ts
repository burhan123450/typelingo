export type LanguageDirection = "ltr" | "rtl";

export interface KeyMapping {
  code: string;
  label: string;
  shiftLabel?: string;
  finger?: "pinky-l" | "ring-l" | "middle-l" | "index-l" | "thumb" | "index-r" | "middle-r" | "ring-r" | "pinky-r";
  width?: number;
}

export interface LessonConfig {
  id: string;
  order: number;
  titleKey: string;
  title: string;
  description: string;
  targetKeys: string[];
  practiceText: string[];
}

export interface LanguageConfig {
  id: string;
  name: string;
  nativeName: string;
  slug: string;
  direction: LanguageDirection;
  fontClass: string;
  fontFamilyName: string;
  helpNote: string;
  keyboardRows: KeyMapping[][];
  lessons: LessonConfig[];
  words: string[];
  sentences: string[];
}

export interface TestResult {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD local date
  languageId: string;
  mode: "30s" | "60s" | "120s" | "lesson" | "weak-keys";
  lessonId?: string;
  durationSeconds: number;
  wpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  totalTypedChars: number;
  errorMap: Record<string, number>;
}

export interface DailyGoal {
  type: "minutes" | "tests";
  target: number;
}

export interface LessonProgress {
  lessonId: string;
  languageId: string;
  bestWpm: number;
  bestAccuracy: number;
  completed: boolean;
  attempts: number;
}

export interface UserStorageData {
  version: number;
  selectedLanguageId: string;
  uiLanguageId: string;
  theme: "light" | "dark";
  dailyGoal: DailyGoal;
  results: TestResult[];
  lessonProgress: Record<string, LessonProgress>; // key: `${languageId}:${lessonId}`
  weakKeys: Record<string, Record<string, number>>; // languageId -> { char: errorCount }
}
