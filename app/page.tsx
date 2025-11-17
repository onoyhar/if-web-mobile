import FastingTimer from "@/components/trackers/FastingTimer";
import WaterTracker from "@/components/trackers/WaterTracker";
import WeightTracker from "@/components/trackers/WeightTracker";
import NotificationSetup from "@/components/NotificationSetup";
import FastingPlanning from "@/components/trackers/FastingPlanning";

export default function HomePage() {
  return (
    <div className="space-y-4 pb-16">
      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brandLavender">
          Welcome back
        </p>
        <h1 className="bg-gradient-to-r from-brandPurple to-brandBlue bg-clip-text text-3xl font-bold text-transparent">
          Intermittent Fasting Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-300">
          Track your fasting window, water intake and weight — works offline and syncs when you&apos;re back online.
        </p>
      </section>

      <section className="space-y-3">
        <FastingTimer />
        <FastingPlanning />
        <WaterTracker />
        <WeightTracker />
        <NotificationSetup />
      </section>
    </div>
  );
}
