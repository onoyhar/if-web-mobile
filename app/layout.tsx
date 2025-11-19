"use client";

import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/Toast";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Halaman yang tidak perlu bottom nav
  const hideBottomNav =
    pathname.startsWith("/onboarding") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground transition-colors">
        <ToastProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <main className="mx-auto max-w-md">
              {children}
            </main>

            {/* Bottom Navigation hanya muncul kalau TIDAK berada di onboarding */}
            {!hideBottomNav && <BottomNav />}

          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}