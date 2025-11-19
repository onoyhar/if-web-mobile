"use client";

import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const DEFAULT_EMAIL = "test@example.com";
  const DEFAULT_PASSWORD = "Test123456";

  useEffect(() => {
    logger.debug("LoginPage mounted");
    
    // Check if redirected from /register with signup mode
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      logger.info("Redirected from /register, switching to signup mode");
      setIsSignup(true);
    }
    
    checkUser();
  }, [searchParams]);

  const checkUser = async () => {
    logger.debug("Checking current user session");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      logger.info("User already logged in", { userId: user.id, email: user.email });
      setIsLoggedIn(true);
    } else {
      logger.debug("No active user session");
      setIsLoggedIn(false);
    }
  };

  const handleSubmit = async () => {
    if (isSignup) {
      logger.group("User Signup");
      logger.info("Starting signup process", { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        logger.error("Signup failed", error);
        alert(`Signup error: ${error.message}`);
        logger.groupEnd();
        return;
      }

      if (data.user) {
        logger.info("Signup successful", { 
          userId: data.user.id, 
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at 
        });
        logger.debug("Redirecting to home with newUser flag");
        logger.groupEnd();
        
        // Trigger will auto-create profile, just redirect to home with new user flag
        router.push("/?newUser=true");
      }
    } 
    else {
      logger.group("User Login");
      logger.info("Starting login process", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error("Login failed", error);
        alert(`Login error: ${error.message}`);
        logger.groupEnd();
      } else {
        logger.info("Login successful", { 
          userId: data.user?.id,
          email: data.user?.email 
        });
        logger.debug("Redirecting to home");
        logger.groupEnd();
        router.push("/");
      }
    }
  };

  const handleLogout = async () => {
    logger.info("User logout initiated");
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Logout failed", error);
      alert(error.message);
      return;
    }

    logger.info("Logout successful");
    
    // Reset local state
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");

    // Redirect to home
    router.replace("/");
  };

  const handleQuickLogin = async () => {
    logger.info("Quick login initiated", { email: DEFAULT_EMAIL });
    setEmail(DEFAULT_EMAIL);
    setPassword(DEFAULT_PASSWORD);

    const { error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD
    });

    if (!error) {
      logger.info("Quick login successful");
      router.push("/");
    } else {
      logger.error("Quick login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">

      <div className="w-full max-w-sm bg-white dark:bg-slate-900 
                      rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">

        {/* Logo/Icon */}
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-3xl">⏱️</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isSignup ? "Sign up to start your journey" : "Login to continue your progress"}
          </p>
        </div>

        {/* FORM AREA */}
        {!isLoggedIn ? (
          <>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 
                             border border-slate-200 dark:border-slate-700 
                             text-slate-900 dark:text-white 
                             placeholder-slate-400 dark:placeholder-slate-500 
                             outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 
                             border border-slate-200 dark:border-slate-700 
                             text-slate-900 dark:text-white 
                             placeholder-slate-400 dark:placeholder-slate-500 
                             outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              {/* Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                           hover:from-purple-700 hover:to-pink-700
                           text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30
                           active:scale-95 transition-all"
              >
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </div>

            {/* Toggle Signup/Login */}
            <div className="text-center">
              <button
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
              </button>
            </div>

            {/* Quick Login */}
            {!isSignup && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                      Quick Login
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleQuickLogin}
                  className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 
                             text-slate-700 dark:text-slate-300 font-medium
                             border border-slate-200 dark:border-slate-700 
                             hover:bg-slate-200 dark:hover:bg-slate-700
                             active:scale-95 transition-all"
                >
                  <span className="text-sm">Login as</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">test@example.com</span>
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                You are already logged in
              </p>
            </div>

            <div className="space-y-3">
              <button
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
                onClick={() => router.push("/")}
              >
                Go to Home
              </button>

              <button
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                onClick={() => router.push("/account/personal-info")}
              >
                View Profile
              </button>

              <button
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-all"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}