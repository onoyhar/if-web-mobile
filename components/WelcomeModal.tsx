"use client";

import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";

interface WelcomeModalProps {
  onClose: () => void;
  userName?: string;
}

export default function WelcomeModal({ onClose, userName }: WelcomeModalProps) {
  const router = useRouter();

  const handleCompleteProfile = () => {
    onClose();
    router.push("/account/personal-info");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-4xl">🎉</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-3">
          Welcome{userName ? `, ${userName}` : ""}!
        </h2>

        {/* Message */}
        <p className="text-center text-slate-600 dark:text-slate-400 mb-2">
          Your account has been created successfully
        </p>

        {/* Call to action */}
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
              <UserCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Complete Your Profile
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add your personal information, photo, and preferences to get personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-slate-600 dark:text-slate-400 font-semibold
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Skip for Now
          </button>
          <button
            onClick={handleCompleteProfile}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-700 hover:to-pink-700 text-white font-semibold
                       shadow-lg shadow-purple-500/30 transition-all active:scale-95"
          >
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}
