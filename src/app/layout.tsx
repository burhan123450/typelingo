import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://typelingo.com"),
  title: {
    default: "TypeLingo — Type Faster in Any Language (English, Urdu, Arabic)",
    template: "%s | TypeLingo",
  },
  description:
    "Free multilingual touch typing practice and speed test in English, Urdu (اردو), and Arabic (العربية). Interactive keyboard, step-by-step lessons, and daily progress analytics.",
  keywords: [
    "typing test",
    "multilingual typing practice",
    "english typing test",
    "urdu typing test",
    "arabic typing test",
    "touch typing lessons",
    "WPM test",
  ],
  openGraph: {
    title: "TypeLingo — Type Faster in Any Language",
    description:
      "Learn touch typing and increase your WPM speed in English, Urdu, and Arabic with interactive keyboards, lessons, and streak tracking.",
    url: "https://typelingo.com",
    siteName: "TypeLingo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeLingo — Type Faster in Any Language",
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
