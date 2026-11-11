import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE_NAME} (${SITE_URL}). Learn how we handle your typing data, browser storage, Google Sign-In cloud sync, and cookies.`,
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        Privacy Policy
      </h1>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        <p className="text-xs text-slate-400">Last updated: {LAST_UPDATED}</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          1. Guest Mode (Local Browser Storage)
        </h2>
        <p>
          When you use <strong>{SITE_NAME}</strong> without signing in, your typing test history, daily goals, streaks, lesson progress, and weak-key statistics are saved locally on your own device using your browser&apos;s <code>localStorage</code>. You can export or clear your browser data at any time from the Progress Dashboard.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          2. Google Sign-In &amp; Cloud Sync (Supabase)
        </h2>
        <p>
          If you choose to sign in with Google, we receive your basic Google profile identifier (email address, display name, and profile avatar) via Supabase Authentication solely to create your account and sync your typing progress across devices. You can permanently delete your cloud data at any time with one click using the <strong>&ldquo;Delete my cloud data&rdquo;</strong> button on your Progress Dashboard.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          3. Cookies &amp; Third-Party Advertising (Google AdSense)
        </h2>
        <p>
          We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. Google uses cookies (including the DoubleClick cookie) to serve ads based on a user&apos;s prior visits to this website or other websites on the internet. Users may opt out of personalized advertising by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 underline"
          >
            Google Ads Settings
          </a>
          .
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          4. Fonts &amp; External Resources
        </h2>
        <p>
          To display Urdu and Arabic scripts accurately, {SITE_NAME} loads <em>Noto Nastaliq Urdu</em> and <em>Noto Naskh Arabic</em> from Google Fonts when those languages are selected.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          5. Contact Us
        </h2>
        <p>
          If you have any questions about this Privacy Policy or wish to request data deletion, please email us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-emerald-600 dark:text-emerald-400 underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
