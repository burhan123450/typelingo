import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for TypeLingo. Learn how we handle your typing data, browser storage, and cookies.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        Privacy Policy
      </h1>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        <p className="text-xs text-slate-400">Last updated: November 2026</p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          1. Local Data Storage
        </h2>
        <p>
          In Version 1.0 of TypeLingo, all of your typing test history, daily goals, streaks, lesson progress, and weak-key statistics are stored locally on your own device using your browser&apos;s <code>localStorage</code>. We do not transmit your typing strokes to external servers. You can export or clear your data at any time from the Progress Dashboard.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          2. Cookies &amp; Third-Party Advertising (Google AdSense)
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
          3. Fonts &amp; External Resources
        </h2>
        <p>
          To display Urdu and Arabic scripts accurately, TypeLingo loads <em>Noto Nastaliq Urdu</em> and <em>Noto Naskh Arabic</em> from Google Fonts when those languages are selected.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          4. Contact Us
        </h2>
        <p>
          If you have any questions about this Privacy Policy, please reach out via our Contact page.
        </p>
      </div>
    </div>
  );
}
