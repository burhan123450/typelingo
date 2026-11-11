import type { Metadata } from "next";
import { SITE_NAME, SITE_FULL_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `About ${SITE_NAME}`,
  description: `Learn about ${SITE_FULL_NAME}, our mission to make multilingual touch typing accessible in English, Urdu, Arabic, and beyond.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        About {SITE_NAME}
      </h1>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          <strong>{SITE_FULL_NAME}</strong> was built with a simple mission:{" "}
          <em>&ldquo;Type faster in any language.&rdquo;</em> While most typing websites only focus on English QWERTY, billions of people communicate daily in right-to-left (RTL) scripts like Urdu (اردو) and Arabic (العربية), as well as dozens of other world languages.
        </p>
        <p>
          Our platform combines clean, distraction-free design with accurate real-time metrics:
        </p>
        <ul className="list-disc ps-5 space-y-2">
          <li>
            <strong>Interactive Multilingual Keyboards:</strong> Visual key guidance mapped to physical key codes so you learn where every character lives without looking down.
          </li>
          <li>
            <strong>Structured 6-Stage Curriculum:</strong> Progress from the Home Row to full sentences, unlocking each level by achieving 90%+ accuracy.
          </li>
          <li>
            <strong>Smart Weak-Key Detection:</strong> {SITE_NAME} remembers which characters cause you trouble and generates personalized practice drills using those exact letters.
          </li>
          <li>
            <strong>Rich Progress Analytics &amp; Cloud Sync:</strong> Track your daily goals, streaks, WPM &amp; accuracy trends, and consistency heatmaps in your browser or sync across devices with Google Sign-In.
          </li>
        </ul>
      </div>
    </div>
  );
}
