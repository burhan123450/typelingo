"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { LANGUAGES_LIST } from "@/lib/languages";
import { calculateStreak, getLocalDateString, exportProgressJson } from "@/lib/storage";
import { fmt } from "@/lib/i18n";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Flame,
  Target,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Sparkles,
  Trash2,
  Calendar,
  Award,
  Cloud,
} from "lucide-react";

export default function DashboardView() {
  const {
    storage,
    isHydrated,
    user,
    currentLanguage,
    t,
    setDailyGoal,
    resetWeakKeys,
    importBackup,
    setTypingLanguage,
    loginWithGoogle,
    deleteMyCloudData,
  } = useApp();

  const [filterLangId, setFilterLangId] = useState<string>("all");
  const [goalType, setGoalType] = useState<"minutes" | "tests">(
    storage.dailyGoal.type
  );
  const [goalTarget, setGoalTarget] = useState<number>(storage.dailyGoal.target);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    if (filterLangId === "all") return storage.results;
    return storage.results.filter((r) => r.languageId === filterLangId);
  }, [storage.results, filterLangId]);

  const streakInfo = useMemo(
    () => calculateStreak(storage.results),
    [storage.results]
  );

  const todayStr = getLocalDateString(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  // Daily Summary (Today vs Yesterday)
  const dailyComparison = useMemo(() => {
    const todayRes = filteredResults.filter((r) => r.dateStr === todayStr);
    const yestRes = filteredResults.filter((r) => r.dateStr === yesterdayStr);

    const summarize = (arr: typeof filteredResults) => {
      if (arr.length === 0) {
        return { minutes: 0, tests: 0, wpm: 0, accuracy: 0 };
      }
      const totalSec = arr.reduce((s, r) => s + r.durationSeconds, 0);
      const avgWpm = Math.round(arr.reduce((s, r) => s + r.wpm, 0) / arr.length);
      const avgAcc =
        Math.round(
          (arr.reduce((s, r) => s + r.accuracy, 0) / arr.length) * 10
        ) / 10;
      return {
        minutes: Math.round((totalSec / 60) * 10) / 10,
        tests: arr.length,
        wpm: avgWpm,
        accuracy: avgAcc,
      };
    };

    const today = summarize(todayRes);
    const yesterday = summarize(yestRes);
    return {
      today,
      yesterday,
      wpmDiff: today.wpm - yesterday.wpm,
      accDiff: Math.round((today.accuracy - yesterday.accuracy) * 10) / 10,
    };
  }, [filteredResults, todayStr, yesterdayStr]);

  // Weekly Comparison (Last 7 days vs Previous 7 days)
  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msPerDay = 86400000;

    const thisWeekRes = filteredResults.filter((r) => {
      const [y, m, d] = r.dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      const diff = (startOfToday.getTime() - dt.getTime()) / msPerDay;
      return diff >= 0 && diff < 7;
    });

    const prevWeekRes = filteredResults.filter((r) => {
      const [y, m, d] = r.dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      const diff = (startOfToday.getTime() - dt.getTime()) / msPerDay;
      return diff >= 7 && diff < 14;
    });

    const avg = (arr: typeof filteredResults) => {
      if (arr.length === 0) return { wpm: 0, accuracy: 0, tests: 0 };
      return {
        wpm: Math.round(arr.reduce((s, r) => s + r.wpm, 0) / arr.length),
        accuracy:
          Math.round(
            (arr.reduce((s, r) => s + r.accuracy, 0) / arr.length) * 10
          ) / 10,
        tests: arr.length,
      };
    };

    const currentWeek = avg(thisWeekRes);
    const previousWeek = avg(prevWeekRes);
    return {
      currentWeek,
      previousWeek,
      wpmDiff: currentWeek.wpm - previousWeek.wpm,
    };
  }, [filteredResults]);

  // Last 14 Days Chart Data
  const chartData = useMemo(() => {
    const days: {
      date: string;
      label: string;
      avgWpm: number;
      avgAccuracy: number;
      minutes: number;
    }[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = getLocalDateString(d);
      const dayResults = filteredResults.filter((r) => r.dateStr === ds);
      const totalSec = dayResults.reduce((s, r) => s + r.durationSeconds, 0);
      const avgWpm =
        dayResults.length > 0
          ? Math.round(
              dayResults.reduce((s, r) => s + r.wpm, 0) / dayResults.length
            )
          : 0;
      const avgAccuracy =
        dayResults.length > 0
          ? Math.round(
              (dayResults.reduce((s, r) => s + r.accuracy, 0) /
                dayResults.length) *
                10
            ) / 10
          : 0;

      days.push({
        date: ds,
        label: ds.slice(5),
        avgWpm,
        avgAccuracy,
        minutes: Math.round((totalSec / 60) * 10) / 10,
      });
    }
    return days;
  }, [filteredResults]);

  // True GitHub-style Calendar Heatmap (24 weeks × 7 days)
  const heatmapWeeks = useMemo(() => {
    const weeks: { dateStr: string; count: number; minutes: number }[][] = [];
    const totalWeeks = 24;
    const today = new Date();
    const endDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Align to Sunday of the earliest week
    const startDay = new Date(endDay);
    startDay.setDate(endDay.getDate() - (totalWeeks * 7 - 1));

    let cursor = new Date(startDay);
    for (let w = 0; w < totalWeeks; w++) {
      const weekCol: { dateStr: string; count: number; minutes: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const ds = getLocalDateString(cursor);
        const dayRes = storage.results.filter((r) => r.dateStr === ds);
        const mins =
          Math.round(
            (dayRes.reduce((s, r) => s + r.durationSeconds, 0) / 60) * 10
          ) / 10;
        weekCol.push({
          dateStr: ds,
          count: dayRes.length,
          minutes: mins,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(weekCol);
    }
    return weeks;
  }, [storage.results]);

  // Daily Goal progress (across all languages today)
  const todayAllLangs = storage.results.filter((r) => r.dateStr === todayStr);
  const todayMinutesAll =
    Math.round(
      (todayAllLangs.reduce((s, r) => s + r.durationSeconds, 0) / 60) * 10
    ) / 10;
  const todayTestsAll = todayAllLangs.length;
  const goalCurrent =
    storage.dailyGoal.type === "minutes" ? todayMinutesAll : todayTestsAll;
  const goalPercent = Math.min(
    100,
    Math.round((goalCurrent / Math.max(1, storage.dailyGoal.target)) * 100)
  );

  // Per-language stats breakdown
  const languageBreakdown = useMemo(() => {
    return LANGUAGES_LIST.map((lang) => {
      const res = storage.results.filter((r) => r.languageId === lang.id);
      const bestWpm = res.reduce((max, r) => Math.max(max, r.wpm), 0);
      const avgWpm =
        res.length > 0
          ? Math.round(res.reduce((s, r) => s + r.wpm, 0) / res.length)
          : 0;
      const avgAcc =
        res.length > 0
          ? Math.round(
              (res.reduce((s, r) => s + r.accuracy, 0) / res.length) * 10
            ) / 10
          : 0;
      return {
        lang,
        tests: res.length,
        bestWpm,
        avgWpm,
        avgAcc,
      };
    });
  }, [storage.results]);

  const activeWeakLangId =
    filterLangId === "all" ? currentLanguage.id : filterLangId;
  const weakKeysEntries = Object.entries(
    storage.weakKeys[activeWeakLangId] || {}
  )
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const handleExport = () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bigbird-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      const res = importBackup(content);
      if (res.success) {
        setImportStatus(t.importSuccess);
      } else {
        setImportStatus(fmt(t.importError, { error: res.error || "" }));
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteCloud = async () => {
    if (!window.confirm(t.deleteConfirm)) return;
    const res = await deleteMyCloudData();
    if (!res.error) {
      setImportStatus(t.deleted);
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header + Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.dashboardTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.dashboardSubtitle}
          </p>
        </div>

        {/* Language Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterLangId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filterLangId === "all"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {t.allLanguages}
          </button>
          {LANGUAGES_LIST.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setFilterLangId(l.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                filterLangId === l.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {l.name} ({l.nativeName})
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Daily Goal, Streak, Today vs Yesterday, Weekly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Goal Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.dailyGoalTitle}
              </span>
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {goalCurrent} / {storage.dailyGoal.target}
              </span>
              <span className="text-xs text-slate-500">
                {storage.dailyGoal.type === "minutes"
                  ? t.minutesPerDay
                  : t.testsPerDay}
              </span>
            </div>
            <div className="mt-3 w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <select
              value={goalType}
              onChange={(e) =>
                setGoalType(e.target.value as "minutes" | "tests")
              }
              aria-label="Goal Type"
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1"
            >
              <option value="minutes">{t.minutes}</option>
              <option value="tests">{t.tests}</option>
            </select>
            <input
              type="number"
              min={1}
              max={180}
              value={goalTarget}
              onChange={(e) => setGoalTarget(Number(e.target.value) || 1)}
              aria-label="Goal Target"
              className="w-14 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1"
            />
            <button
              type="button"
              onClick={() => setDailyGoal({ type: goalType, target: goalTarget })}
              className="ms-auto px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              {t.saveGoal}
            </button>
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.streakTitle}
            </span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {streakInfo.currentStreak} {t.days}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.longestStreak}: <strong>{streakInfo.longestStreak}</strong>{" "}
              {t.days}
            </p>
          </div>
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {streakInfo.practicedToday ? `✓ ${t.practicedToday}` : t.keepStreak}
          </div>
        </div>

        {/* Today vs Yesterday Summary */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.todaySummary}
            </span>
            {dailyComparison.wpmDiff >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
              <span>{dailyComparison.today.wpm} WPM</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  dailyComparison.wpmDiff >= 0
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                }`}
              >
                {dailyComparison.wpmDiff >= 0
                  ? `+${dailyComparison.wpmDiff}`
                  : dailyComparison.wpmDiff}{" "}
                WPM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.today}: {dailyComparison.today.minutes}m ·{" "}
              {dailyComparison.today.tests} {t.tests.toLowerCase()} ·{" "}
              {dailyComparison.today.accuracy}%
            </p>
          </div>
          <div className="text-xs text-slate-400">
            {t.yesterday}: {dailyComparison.yesterday.wpm} WPM (
            {dailyComparison.yesterday.accuracy}%)
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.weeklyComparison}
            </span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
              <span>{weeklyComparison.currentWeek.wpm} WPM</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  weeklyComparison.wpmDiff >= 0
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                }`}
              >
                {weeklyComparison.wpmDiff >= 0
                  ? `+${weeklyComparison.wpmDiff}`
                  : weeklyComparison.wpmDiff}{" "}
                WPM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.thisWeek}: {weeklyComparison.currentWeek.tests}{" "}
              {t.tests.toLowerCase()} · {weeklyComparison.currentWeek.accuracy}%
            </p>
          </div>
          <div className="text-xs text-slate-400">
            {t.lastWeek}: {weeklyComparison.previousWeek.wpm} WPM (
            {weeklyComparison.previousWeek.accuracy}%)
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            {t.chartWpmTitle}
          </h2>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#f8fafc",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="avgWpm"
                  name={t.avgWpm}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgAccuracy"
                  name={`${t.accuracy} (%)`}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            {t.chartMinutesTitle}
          </h2>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#f8fafc",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="minutes"
                  name={t.practiceMinutes}
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* True GitHub-style Calendar Heatmap (24 weeks × 7 days) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.heatmapTitle}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{t.less}</span>
            <span className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500 inline-block" />
            <span>{t.more}</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1" dir="ltr">
          <div className="inline-flex gap-1.5 min-w-full justify-between">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                {week.map((d) => {
                  let color = "bg-slate-100 dark:bg-slate-800";
                  if (d.minutes > 10 || d.count >= 5) {
                    color = "bg-emerald-600 dark:bg-emerald-500";
                  } else if (d.minutes > 3 || d.count >= 2) {
                    color = "bg-emerald-400 dark:bg-emerald-700";
                  } else if (d.count >= 1) {
                    color = "bg-emerald-200 dark:bg-emerald-900";
                  }
                  return (
                    <div
                      key={d.dateStr}
                      title={fmt(t.heatmapTooltip, {
                        date: d.dateStr,
                        tests: d.count,
                        minutes: d.minutes,
                      })}
                      className={`h-3.5 min-w-[12px] rounded-sm ${color} transition-transform hover:scale-125`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Separate Stats Per Language + Weak Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Language Stats Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            {t.perLanguageTitle}
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {languageBreakdown.map(({ lang, tests, bestWpm, avgWpm, avgAcc }) => (
              <div
                key={lang.id}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {lang.name} ({lang.nativeName})
                  </div>
                  <div className="text-xs text-slate-500">
                    {fmt(t.testsCompleted, { n: tests })}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400">{t.best}:</span>{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {bestWpm} WPM
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">{t.avg}:</span>{" "}
                    <strong>{avgWpm} WPM</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">{t.accuracy}:</span>{" "}
                    <strong>{avgAcc}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Keys & Targeted Practice */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {t.weakKeysTitle} ({activeWeakLangId.toUpperCase()})
                </span>
              </h2>
              {weakKeysEntries.length > 0 && (
                <button
                  type="button"
                  onClick={() => resetWeakKeys(activeWeakLangId)}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.reset}</span>
                </button>
              )}
            </div>

            {weakKeysEntries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-6">
                {t.noWeakKeys}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 my-3">
                {weakKeysEntries.map(([char, count]) => (
                  <div
                    key={char}
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2"
                  >
                    <span className="text-lg font-bold text-rose-700 dark:text-rose-300">
                      {char}
                    </span>
                    <span className="text-xs text-rose-500">
                      {count} {t.misses}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{t.weakKeysHint}</span>
            <Link
              href="/?mode=weak-keys"
              onClick={() => setTypingLanguage(activeWeakLangId)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shrink-0"
            >
              {t.practiceWeakKeys}
            </Link>
          </div>
        </div>
      </div>

      {/* Cloud Sync & JSON Backup Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cloud Sync Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-500" />
              <span>{t.cloudTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user
                ? fmt(t.cloudSignedIn, { name: user.name || user.email || "" })
                : t.cloudGuest}
            </p>
          </div>

          {user ? (
            <button
              type="button"
              onClick={handleDeleteCloud}
              className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              {t.deleteCloud}
            </button>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
            >
              {t.signIn}
            </button>
          )}
        </div>

        {/* Export / Import Progress JSON */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.backupTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.backupDesc}
            </p>
            {importStatus && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {importStatus}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportData}</span>
            </button>

            <label className="cursor-pointer px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Upload className="w-4 h-4" />
              <span>{t.importData}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
