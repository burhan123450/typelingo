import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_FULL_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_FULL_NAME} — Type Faster in Any Language (English, Urdu, Arabic)`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free multilingual touch typing practice and speed test in English, Urdu (اردو), and Arabic (العربية). Interactive keyboard, step-by-step lessons, and daily progress analytics.",
  keywords: [
    "typing test",
    "bigbird typing",
    "multilingual typing practice",
    "english typing test",
    "urdu typing test",
    "arabic typing test",
    "touch typing lessons",
    "WPM test",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_FULL_NAME} — Type Faster in Any Language`,
    description:
      "Learn touch typing and increase your WPM speed in English, Urdu, and Arabic with interactive keyboards, lessons, and streak tracking.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_FULL_NAME} — Type Faster in Any Language`,
    description:
      "Practice touch typing in English, Urdu, and Arabic with real-time WPM, accuracy, and smart weak-key drills.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of dark mode if the user selected light mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=JSON.parse(localStorage.getItem("typelingo_v1_data")||"{}");if(d.theme==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
