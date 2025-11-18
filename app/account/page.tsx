"use client";

import {
  ArrowRight,
  User,
  Droplet,
  Clock,
  Weight,
  Settings,
  Bell,
  CreditCard,
  Shield,
  Link as LinkIcon,
  Eye,
  BarChart2,
  HelpCircle,
  LogOut,
  LogIn
} from "lucide-react";

import Card from "@/components/ui/card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState("");

  // Load login status
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    }
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/");
  };

  const protectedNav = (href: string) => {
    if (!user) {
      setPendingRoute(href);
      setShowModal(true);
      return;
    }
    router.push(href);
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-20 space-y-6">

      {/* HEADER */}
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      </div>

      {/* UPGRADE */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md">
        <h2 className="text-lg font-bold">Upgrade Plan Now!</h2>
        <p className="text-xs opacity-90 mt-1">
          Enjoy premium benefits and more possibilities.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox number="300" label="Total fasts" />
        <StatBox number="27.5 h" label="Longest fast" />
        <StatBox number="92" label="Longest streak" />
        <StatBox number="36" label="Streak" />
        <StatBox number="18.5 h" label="Avg. fast" />
        <StatBox number="25.9" label="BMI" />
      </div>

      {/* MAIN MENU */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-1 space-y-1 shadow-md">
        <MenuItem icon={<User />} label="Personal Info" onClick={() => protectedNav("/account/personal-info")} />
        <MenuItem icon={<Clock />} label="Fasting Tracker" onClick={() => protectedNav("/")} />
        <MenuItem icon={<Droplet />} label="Water Tracker" onClick={() => protectedNav("/")} />
        <MenuItem icon={<Weight />} label="Weight Tracker" onClick={() => protectedNav("/")} />
        <MenuItem icon={<Settings />} label="Preferences" onClick={() => protectedNav("/settings")} />
      </div>

      {/* SECONDARY MENU */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-1 space-y-1 shadow-md">
        <MenuItem icon={<Bell />} label="Notification" onClick={() => protectedNav("/notifications")} />
        <MenuItem icon={<CreditCard />} label="Payment Methods" onClick={() => protectedNav("/payments")} />
        <MenuItem icon={<Shield />} label="Account & Security" onClick={() => protectedNav("/security")} />
        <MenuItem icon={<LinkIcon />} label="Linked Accounts" onClick={() => protectedNav("/linked")} />
        <MenuItem icon={<Eye />} label="App Appearance" onClick={() => protectedNav("/appearance")} />
        <MenuItem icon={<BarChart2 />} label="Data & Analytics" onClick={() => protectedNav("/analytics")} />
        <MenuItem icon={<HelpCircle />} label="Help & Support" onClick={() => protectedNav("/help")} />
      </div>

      {/* AUTH AREA */}
      {user ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 w-full px-2 py-3 text-left font-semibold"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-3 text-purple-600 w-full px-2 py-3 text-left font-semibold"
        >
          <LogIn className="h-5 w-5" />
          Login to your account
        </button>
      )}

      {/* LOGIN REQUIRED MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-72 shadow-xl text-center">
            <p className="font-semibold text-lg">Login Required</p>
            <p className="text-sm text-slate-500 mt-1">
              You need to login to access this section.
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* --- COMPONENTS --- */

function StatBox({ number, label }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl py-3 text-center shadow-sm">
      <p className="text-lg font-bold">{number}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 rounded-xl
               hover:bg-slate-100 dark:hover:bg-slate-800 transition w-full text-left"
    >
      <div className="flex items-center gap-4">
        <span className="text-slate-500">{icon}</span>
        <span className="font-medium text-[15px]">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400" />
    </button>
  );
}