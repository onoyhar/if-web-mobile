"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  BarChart2,
  User,
  Plus
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/report", label: "Report", icon: BarChart2 },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-40
      bg-white/90 dark:bg-slate-900/80
      backdrop-blur-xl
      border-t border-slate-200 dark:border-slate-800
      pb-8 pt-3
    ">
      <div className="max-w-md mx-auto relative">

        {/* ---- Floating Action Button (FAB) ---- */}
        <button
          className="
            absolute -top-8 left-1/2 -translate-x-1/2
            w-16 h-16 rounded-full
            bg-brandPurple text-white
            shadow-xl shadow-brandPurple/40
            flex items-center justify-center
            active:scale-95 transition-transform
          "
          onClick={() => alert('FAB clicked!')}
        >
          <Plus className="h-8 w-8" />
        </button>

        {/* ---- Nav Bar Items ---- */}
        <div className="flex justify-between px-8">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            // For layout around FAB, skip center space
            const positionClass =
              i === 1 ? "mr-10" : i === 2 ? "ml-10" : "";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center w-16 ${positionClass}`}
              >
                <div className="relative flex items-center justify-center">
                  {/* Bubble animation behind icon */}
                  {active && (
                    <span className="
                      absolute w-10 h-10 rounded-full bg-brandPurple/20 
                      animate-bubble
                    "></span>
                  )}

                  <Icon
                    className={`h-5 w-5 transition-all ${
                      active
                        ? "text-brandPurple scale-110"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    active
                      ? "text-brandPurple"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}