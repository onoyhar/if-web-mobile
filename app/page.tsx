"use client";

import FastingTimer from "@/components/trackers/FastingTimer";
import WaterTracker from "@/components/trackers/WaterTracker";
import WeightTracker from "@/components/trackers/WeightTracker";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="pb-28 px-4 pt-4 max-w-md mx-auto space-y-6">

      {/* Page Title */}
      <div className="mt-2 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track your daily fasting, water, and weight goals.
        </p>
      </div>

      {/* Fasting Card */}
      <div className="animate-fadeIn">
        <FastingTimer />
      </div>

      {/* Water Intake */}
      <div className="animate-fadeIn delay-100">
        <WaterTracker />
      </div>

      {/* Weight Tracker */}
      <div className="animate-fadeIn delay-200">
        <WeightTracker />
      </div>

      {/* Exercise Library Shortcut */}
      <div className="animate-fadeIn delay-300">
        <Link href="/exercise">
          <div className="rounded-3xl bg-gradient-to-br from-brandLightPurple/50 to-white dark:from-slate-800/60 dark:to-slate-900 p-5 shadow-sm border border-slate-200 dark:border-slate-800 active:scale-[.98] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Exercise Library
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Watch guided workout videos
                </p>
              </div>
              <span className="text-brandPurple font-bold text-xl">{">"}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}