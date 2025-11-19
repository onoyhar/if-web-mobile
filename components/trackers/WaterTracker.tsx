"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import { ChevronRight, Minus, Plus } from "lucide-react";

interface WaterLog {
  date: string;
  amount: number;
}

const STORAGE_KEY = "if_water_logs_v2";

function loadTodayTotal(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const logs: WaterLog[] = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return logs
      .filter((l) => l.date.startsWith(today))
      .reduce((sum, l) => sum + l.amount, 0);
  } catch {
    return 0;
  }
}

function saveLog(amount: number) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const logs: WaterLog[] = raw ? JSON.parse(raw) : [];
  logs.push({
    date: new Date().toISOString(),
    amount,
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export default function WaterTracker() {
  const [total, setTotal] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500); // ml default

  useEffect(() => {
    setTotal(loadTodayTotal());
  }, []);

  const add = (amount: number) => {
    setTotal((prev) => prev + amount);
    saveLog(amount);
  };

  const percent = Math.min(100, (total / dailyGoal) * 100);
  const remaining = Math.max(0, dailyGoal - total);

  return (
    <Card className="rounded-3xl p-5 bg-white dark:bg-slate-900 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Water Tracker
        </h2>
        <button className="text-sky-500 hover:text-sky-600">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex items-center gap-6">
        {/* Left: Number display */}
        <div className="flex-shrink-0">
          <div className="text-left">
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {total}
            </p>
            <p className="text-sm text-slate-400 -mt-1">ml</p>
            <p className="text-xs text-slate-400 mt-1">
              / {dailyGoal} mL
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {Math.round(percent)}% completed
            </p>
          </div>
        </div>

        {/* Center: Droplet visual */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-28 flex items-center justify-center">
            {/* Water droplet SVG shape */}
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full"
            >
              {/* Background droplet */}
              <path
                d="M50 10 C30 30, 10 50, 10 70 C10 90, 28 110, 50 110 C72 110, 90 90, 90 70 C90 50, 70 30, 50 10 Z"
                fill="#e5e7eb"
                className="dark:fill-slate-700"
              />
              {/* Filled water with mask */}
              <defs>
                <clipPath id="droplet-clip">
                  <path d="M50 10 C30 30, 10 50, 10 70 C10 90, 28 110, 50 110 C72 110, 90 90, 90 70 C90 50, 70 30, 50 10 Z" />
                </clipPath>
              </defs>
              <rect
                x="10"
                y={110 - (percent / 100) * 100}
                width="80"
                height={(percent / 100) * 100}
                fill="#3b82f6"
                clipPath="url(#droplet-clip)"
              />
            </svg>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col gap-3 flex-1">
          <button
            onClick={() => add(100)}
            className="p-3 rounded-full border-2 border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            onClick={() => setTotal(Math.max(0, total - 100))}
            className="p-3 rounded-full border-2 border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 flex items-center justify-center"
          >
            <Minus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Card>
  );
}