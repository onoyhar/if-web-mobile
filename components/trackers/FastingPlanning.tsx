"use client";

import Card from "@/components/ui/card";
import { useState } from "react";

const PLANS = [
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "4 Weeks", days: 28 },
];

export default function FastingPlanning() {
  const [plan, setPlan] = useState(7);

  return (
    <Card>
      <h2 className="text-sm font-semibold mb-1">Planning Intermittent Fasting</h2>

      <select
        value={plan}
        onChange={(e) => setPlan(parseInt(e.target.value))}
        className="w-full rounded-xl border border-slate-300 p-2 text-sm dark:bg-[#281a40]"
      >
        {PLANS.map((p) => (
          <option key={p.days} value={p.days}>
            {p.label}
          </option>
        ))}
        <option value="custom">Custom</option>
      </select>

      <div className="mt-4">
        <p className="text-[10px] uppercase text-slate-400 tracking-[0.2em]">
          Progress
        </p>

        {/* bar chart mock */}
        <div className="flex gap-1 mt-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-6 h-12 bg-gradient-to-t from-brandPurple/70 to-brandLavender/70 rounded-lg"></div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Avg fasting: <span className="font-semibold">17.2h</span>
        </p>
        <p className="text-xs text-slate-400">
          Streak: <span className="font-semibold">3 days</span>
        </p>
      </div>
    </Card>
  );
}