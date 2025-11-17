"use client";

export default function WaterDroplet({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="relative h-28 w-20">
      <svg viewBox="0 0 100 140" className="h-full w-full">
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A1C4FD" />
            <stop offset="100%" stopColor="#C6F6FF" />
          </linearGradient>
          <clipPath id="dropletClip">
            <path d="M50 0 C65 30 90 60 90 90 C90 120 70 140 50 140 C30 140 10 120 10 90 C10 60 35 30 50 0 Z" />
          </clipPath>
        </defs>

        <path
          d="M50 0 C65 30 90 60 90 90 C90 120 70 140 50 140 C30 140 10 120 10 90 C10 60 35 30 50 0 Z"
          fill="#EEE7FF"
        />

        <g clipPath="url(#dropletClip)">
          <rect
            x="0"
            y={140 - (140 * clamped) / 100}
            width="100"
            height={(140 * clamped) / 100}
            fill="url(#waterGradient)"
            className="transition-all duration-500 ease-out"
          />
        </g>
      </svg>
    </div>
  );
}
