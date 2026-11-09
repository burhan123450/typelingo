import { LanguageConfig } from "@/types/typing";
import en from "@/data/languages/en.json";
import ur from "@/data/languages/ur.json";
import ar from "@/data/languages/ar.json";

/**
 * Adding a new language in the future (e.g. Hindi, Spanish, French):
 * 1. Drop a new JSON file in src/data/languages/ (e.g., es.json)
 * 2. Import and include it in LANGUAGES_LIST below.
 * All UI selectors, keyboards, lessons, and SEO routes automatically adapt.
 */
export const LANGUAGES_LIST: LanguageConfig[] = [
  en as LanguageConfig,
  ur as LanguageConfig,
  ar as LanguageConfig,
];

export const LANGUAGES_BY_ID: Record<string, LanguageConfig> = Object.fromEntries(
  LANGUAGES_LIST.map((lang) => [lang.id, lang])
);

export const LANGUAGES_BY_SLUG: Record<string, LanguageConfig> = Object.fromEntries(
  LANGUAGES_LIST.map((lang) => [lang.slug, lang])
);

export function getLanguageById(id: string): LanguageConfig {
  return LANGUAGES_BY_ID[id] || LANGUAGES_LIST[0];
}

export function getLanguageBySlug(slug: string): LanguageConfig | undefined {
  return LANGUAGES_BY_SLUG[slug];
}

export function generatePracticeText(
  lang: LanguageConfig,
  mode: "30s" | "60s" | "120s" | "lesson" | "weak-keys",
  options?: {
    lessonId?: string;
    weakKeysMap?: Record<string, number>;
    contentType?: "words" | "sentences";
  }
): string {
  if (mode === "lesson" && options?.lessonId) {
    const lesson = lang.lessons.find((l) => l.id === options.lessonId);
    if (lesson && lesson.practiceText.length > 0) {
      return lesson.practiceText.join(" ");
    }
  }

  if (mode === "weak-keys" && options?.weakKeysMap) {
    const sortedWeakChars = Object.entries(options.weakKeysMap)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([char]) => char);

    if (sortedWeakChars.length > 0) {
      const matchingWords = lang.words.filter((w) =>
        sortedWeakChars.some((ch) => w.includes(ch))
      );
      const pool = matchingWords.length >= 8 ? matchingWords : lang.words;
      const selected: string[] = [];
      for (let i = 0; i < 45; i++) {
        const randomWord = pool[Math.floor(Math.random() * pool.length)];
        selected.push(randomWord);
      }
      return selected.join(" ");
    }
  }

  const wordCount = mode === "30s" ? 45 : mode === "60s" ? 80 : 140;

  if (options?.contentType === "words") {
    const picked: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const w = lang.words[Math.floor(Math.random() * lang.words.length)];
      picked.push(w);
    }
    return picked.join(" ");
  }

  // Mix sentences and words for natural typing test feel
  const shuffledSentences = [...lang.sentences].sort(() => Math.random() - 0.5);
  const targetChars = mode === "30s" ? 260 : mode === "60s" ? 480 : 850;
  let result = "";
  let idx = 0;
  while (result.length < targetChars) {
    const sentence = shuffledSentences[idx % shuffledSentences.length];
    result = result ? `${result} ${sentence}` : sentence;
    idx++;
  }
  return result.trim();
}
