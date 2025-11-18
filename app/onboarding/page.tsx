"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Onboard1() {
  useEffect(() => {
    // If already completed onboarding → go login
    if (localStorage.getItem("onboarding") === "done") {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="h-screen flex flex-col justify-between items-center px-6 py-10 text-center bg-white dark:bg-slate-900">

      <div className="pt-20">
        <h1 className="text-4xl font-bold mb-4 text-purple-600">FastNoy</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          Welcome to your personal fasting companion.
        </p>
      </div>

      <div className="w-full space-y-4 pb-10">
        <Link href="/onboarding/enjoy">
          <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold">
            Next
          </button>
        </Link>

        <button
          className="w-full text-slate-500 underline"
          onClick={() => {
            localStorage.setItem("onboarding", "done");
            window.location.href = "/login";
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}