"use client";

import Link from "next/link";
import { Timer } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {

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

          {/* Right: Mobile - Theme only */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}