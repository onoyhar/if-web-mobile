"use client";

import Link from "next/link";
import { Timer, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <nav className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-sky-400" />
              <span className="font-semibold text-sm">IF Health Tracker</span>
            </Link>
          </div>

          {/* Right: Desktop nav + Theme */}
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <Link href="/" className="hover:text-sky-400 transition-colors">
              Home
            </Link>
            <Link
              href="/exercise"
              className="hover:text-sky-400 transition-colors"
            >
              Exercise
            </Link>
            <Link
              href="/profile"
              className="hover:text-sky-400 transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              className="hover:text-sky-400 transition-colors"
            >
              Settings
            </Link>
            <ThemeToggle />
          </div>

          {/* Right: Mobile - Theme + Burger */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-background shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Sidebar Drawer */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}