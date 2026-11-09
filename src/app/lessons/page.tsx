import type { Metadata } from "next";
import LessonsView from "@/components/LessonsView";

export const metadata: Metadata = {
  title: "Touch Typing Lessons — Home Row to Full Sentences",
  description:
    "Step-by-step touch typing lessons in English, Urdu, and Arabic. Master the home row, top row, bottom row, numbers, words, and sentences.",
};

export default function LessonsPage() {
  return <LessonsView />;
}
