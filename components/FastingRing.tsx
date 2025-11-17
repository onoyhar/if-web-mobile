"use client";

import { useMemo } from "react";

type Props = {
  progress: number;
  label: string;
  bigText: string;
};

export default function FastingRing({ progress, label, bigText }: Props) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  const clamped = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clamped / 100) * circumference;

  // ⚡ Determine milestone glow style
  const glowClass = useMemo(() => {
    if (clamped >= 100) {
      return "shadow-[0_0_35px_12px_rgba(127,74,217,0.7)] animate-pulse";
    }
    if (clamped >= 75) {
      return "shadow-[0_0_25px_8px_rgba(127,74,217,0.55)]";
    }
    if (clamped >= 50) {
      return "shadow-[0_0_18px_6px_rgba(127,74,217,0.4)]";
    }
    if (clamped >= 25) {
      return "shadow-[0_0_12px_4px_rgba(198,162,249,0.35)]";
    }
    return "";
  }, [clamped]);

  return (
    <div
      className={`relative flex h-36 w-36 items-center justify-center transition-all ${glowClass}`}
    >
      <svg
        width="144"
        height="144"
        className="-rotate-90 animate-[spin_12s_linear_infinite]"
      >
        <defs>
          <linearGradient id="fastingGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C6A2F9" />
            <stop offset="100%" stopColor="#7F4AD9" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          r={radius}
          cx="72"
          cy="72"
          stroke="#EEE7FF"
          strokeWidth="12"
          fill="none"
        />

        {/* Progress Ring */}
        <circle
          r={radius}
          cx="72"
          cy="72"
          stroke="url(#fastingGlowGradient)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-500">{label}</span>
        <span className="mt-1 text-xl font-bold text-brandPurple">
          {bigText}
        </span>
      </div>

      {/* Glow Overlay */}
      {clamped >= 75 && (
        <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-br from-brandLavender/40 to-brandPurple/40"></div>
      )}
    </div>
  );
}