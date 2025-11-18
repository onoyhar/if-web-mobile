"use client";

import Link from "next/link";

export default function Onboard3() {
  return (
    <div className="h-screen flex flex-col justify-between items-center px-6 py-10 text-center bg-white dark:bg-slate-900">

      <div className="pt-20">
        <h1 className="text-3xl font-bold mb-3">Get Started</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          Let's begin your fasting journey.
        </p>
      </div>

      <div className="w-full space-y-4 pb-10">
        <button
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold"
          onClick={() => {
            localStorage.setItem("onboarding", "done");
            window.location.href = "/login";
          }}
        >
          Login
        </button>

        <button
          className="w-full border border-purple-600 text-purple-600 py-3 rounded-xl font-semibold"
          onClick={() => {
            localStorage.setItem("onboarding", "done");
            window.location.href = "/register";
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}