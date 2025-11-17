"use client";

import Link from "next/link";
import { X, Dumbbell, User, Target } from "lucide-react";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div
        className="h-full w-full bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="relative flex h-full w-72 flex-col bg-background px-4 py-4 shadow-2xl dark:bg-[#150f23]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-background hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2 text-sm">
          <SidebarItem href="/exercise" icon={<Dumbbell className="h-4 w-4" />} onClick={onClose}>
            Exercise
          </SidebarItem>

          <SidebarItem href="/profile" icon={<User className="h-4 w-4" />} onClick={onClose}>
            Profile
          </SidebarItem>

          <SidebarItem href="/settings" icon={<Target className="h-4 w-4" />} onClick={onClose}>
            Settings & Goals
          </SidebarItem>
        </nav>

        {/* Footer Info */}
        <div className="mt-auto pt-4 text-[11px] text-slate-500 dark:text-slate-400">
          IF Health Tracker • v1.0
        </div>
      </aside>
    </div>
  );
}

function SidebarItem({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-brandLightPurple/40 dark:hover:bg-[#241530] transition-colors"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brandLightPurple/40 text-brandPurple dark:bg-[#2f1b4a]">
        {icon}
      </span>
      <span className="text-sm">{children}</span>
    </Link>
  );
}