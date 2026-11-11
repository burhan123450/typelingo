import React, { Suspense } from "react";
import TypingBox from "@/components/TypingBox";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
      <Suspense
        fallback={
          <div className="h-64 w-full max-w-3xl rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        }
      >
        <TypingBox />
      </Suspense>
    </div>
  );
}
