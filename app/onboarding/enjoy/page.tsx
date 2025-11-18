"use client";

import Link from "next/link";

export default function Onboard2() {
  return (
    <div className="h-screen flex flex-col justify-between items-center px-6 py-10 text-center bg-white dark:bg-slate-900">

      <div className="pt-20">
        <h1 className="text-3xl font-bold mb-4">Enjoy Fasting</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          Build healthy habits, track progress, and stay motivated.
        </p>
      </div>

      <div className="w-full space-y-4 pb-10">
        <Link href="/onboarding/get-started">
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