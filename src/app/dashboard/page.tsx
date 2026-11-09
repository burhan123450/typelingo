import type { Metadata } from "next";
import DashboardView from "@/components/DashboardView";

export const metadata: Metadata = {
  title: "Progress Dashboard — Streaks, WPM Charts & Weak Keys",
  description:
    "View your daily typing goal, streak counter, WPM & accuracy charts, GitHub-style practice heatmap, and weak-key analytics.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
