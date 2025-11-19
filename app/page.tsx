"use client";

import FastingTimer from "@/components/trackers/FastingTimer";
import WaterTracker from "@/components/trackers/WaterTracker";
import WeightTracker from "@/components/trackers/WeightTracker";
import WelcomeModal from "@/components/WelcomeModal";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

function HomeContent() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    logger.debug("HomePage mounted");
    
    if (typeof window !== "undefined") {
      const onboard = localStorage.getItem("onboarding");
      if (!onboard) {
        logger.info("No onboarding flag found, redirecting to /onboarding");
        window.location.href = "/onboarding";
        return;
      }
    }

    // Check if new user from signup
    const isNewUser = searchParams.get("newUser") === "true";
    if (isNewUser) {
      logger.info("New user detected, checking profile completeness");
      checkProfileAndShowModal();
    }
  }, [searchParams]);

  const checkProfileAndShowModal = async () => {
    logger.group("Check Profile Completeness");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn("No authenticated user found");
      logger.groupEnd();
      return;
    }

    logger.debug("Fetching user profile", { userId: user.id });

    // Get profile data - use maybeSingle() to handle new users without profile
    const { data: profile, error } = await supabase
      .from("users_profile")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      logger.error("Failed to fetch profile", error);
      logger.groupEnd();
      return;
    }

    setUserName(profile?.name || "");
    
    // Show modal if profile doesn't exist or is incomplete (no name set)
    if (!profile || !profile.name) {
      logger.info("Profile incomplete or doesn't exist, showing welcome modal");
      setShowWelcomeModal(true);
    } else {
      logger.info("Profile already complete", { name: profile.name });
    }
    
    logger.groupEnd();
  };

  return (
    <>
      <div className="pb-24 px-3 pt-3 max-w-md mx-auto space-y-3">
        {/* Fasting Card */}
        <FastingTimer />

        {/* Water Intake */}
        <WaterTracker />

        {/* Weight Tracker */}
        <WeightTracker />
      </div>

      {/* Welcome Modal for New Users */}
      {showWelcomeModal && (
        <WelcomeModal 
          onClose={() => setShowWelcomeModal(false)} 
          userName={userName}
        />
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="pb-24 px-3 pt-3 max-w-md mx-auto space-y-3">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}