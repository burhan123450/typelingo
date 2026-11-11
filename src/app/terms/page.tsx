import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL, LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of Use for ${SITE_NAME} (${SITE_URL}).`,
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        Terms of Use
      </h1>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        <p className="text-xs text-slate-400">Last updated: {LAST_UPDATED}</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing and using <strong>{SITE_NAME}</strong> ({SITE_URL}), you agree to comply with and be bound by these Terms of Use. Our typing tests, lessons, and progress tools are provided free of charge for personal and educational use.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          2. Fair Use &amp; Account Responsibility
        </h2>
        <p>
          You agree not to misuse the service, attempt automated scraping, or interfere with the normal operation of the website. If you sign in with Google to sync your progress, you are responsible for maintaining the security of your Google account.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          3. Disclaimer of Warranties
        </h2>
        <p>
          {SITE_NAME} is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. We recommend periodically exporting a JSON backup of your progress from the Dashboard.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          4. Contact
        </h2>
        <p>
          Questions regarding these Terms may be sent to{" "}
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
