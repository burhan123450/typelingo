import type { Metadata } from "next";
import { Mail, MessageSquare, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the TypeLingo team for feedback, language requests, or support.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        Contact Us
      </h1>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        <p>
          Have feedback, found a typo in one of our language packs, or want to request a new language (such as Hindi, Spanish, French, or Turkish)? We would love to hear from you!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              Email Support
            </div>
            <a
              href="mailto:support@typelingo.com"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              support@typelingo.com
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              Language Review
            </div>
            <p className="text-xs text-slate-500">
              Native speakers can submit word/sentence improvements anytime.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              Open Language Pack
            </div>
            <p className="text-xs text-slate-500">
              Each language is a single JSON file for easy community contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
