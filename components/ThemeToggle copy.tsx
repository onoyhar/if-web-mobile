"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunMedium, MoonStar, MonitorSmartphone } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/70 p-1 text-[10px] shadow-sm dark:bg-[#20152f]">
      <ToggleButton
        active={theme === "light"}
        onClick={() => setTheme("light")}
        icon={<SunMedium className="h-3 w-3" />}
        label="Light"
      />
      <ToggleButton
        active={theme === "dark"}
        onClick={() => setTheme("dark")}
        icon={<MoonStar className="h-3 w-3" />}
        label="Dark"
      />
      <ToggleButton
        active={theme === "system"}
        onClick={() => setTheme("system")}
        icon={<MonitorSmartphone className="h-3 w-3" />}
        label="Auto"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-2 py-1 transition ${
        active
          ? "bg-brandPurple text-white shadow"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#2a1c42]"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
