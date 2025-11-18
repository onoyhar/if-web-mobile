import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ClientProviders from "@/components/ClientProviders";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "IF Health Tracker",
  description:
    "Intermittent Fasting PWA with water intake, weight tracker, exercise videos & offline sync.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground transition-colors">
        <ClientProviders>
          <ServiceWorkerRegister />
          <Navbar />
          <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>
          {/* Bottom Navigation */}
          <BottomNav />
        </ClientProviders>
      </body>
    </html>
  );
}