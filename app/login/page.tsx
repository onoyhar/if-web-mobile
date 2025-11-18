"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const DEFAULT_EMAIL = "test@example.com";
  const DEFAULT_PASSWORD = "Test123456";

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const handleSubmit = async () => {
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        alert(`Signup error: ${error.message}`);
        return;
      }

      if (data.user) {
        await supabase.from("users_profile").upsert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        router.push("/account/personal-info");
      }
    } 
    else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert(`Login error: ${error.message}`);
      } else {
        router.push("/");
      }
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    // Reset local state
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");

    // Redirect to home
    router.replace("/");
  };

  const handleQuickLogin = async () => {
    setEmail(DEFAULT_EMAIL);
    setPassword(DEFAULT_PASSWORD);

    const { error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD
    });

    if (!error) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">

      <div className="w-full max-w-sm bg-white/5 dark:bg-black/40 backdrop-blur-xl
                      rounded-3xl p-6 shadow-xl border border-white/10 space-y-5">

        {/* Title */}
        <h1 className="text-center text-2xl font-bold text-white">
          {isSignup ? "Create Account" : "Login"}
        </h1>

        {/* FORM AREA */}
        {!isLoggedIn ? (
          <>
            <div className="space-y-3">
              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 
                           text-white placeholder-white/40 outline-none focus:border-purple-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 
                           text-white placeholder-white/40 outline-none focus:border-purple-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              {/* Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold shadow active:scale-95"
              >
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </div>

            {/* Toggle Signup/Login */}
            <button
              className="text-xs text-purple-300 underline text-center w-full"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Already have an account?" : "Create an account"}
            </button>

            {/* Quick Login */}
            {!isSignup && (
              <>
                <div className="my-3 border-t border-white/10" />
                <p className="text-[11px] text-white/50 text-center">Quick Login (Test User)</p>

                <button
                  onClick={handleQuickLogin}
                  className="w-full py-2.5 rounded-xl bg-white/10 text-white font-medium
                             border border-white/20 active:scale-95"
                >
                  Login as test@example.com
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-center text-white mb-4">You are already logged in.</p>

            <button
              className="w-full py-3 bg-purple-600 text-white rounded-xl mb-2"
              onClick={() => router.push("/")}
            >
              Go to Home
            </button>

            <button
              className="w-full py-3 bg-slate-500 text-white rounded-xl mb-2"
              onClick={() => router.push("/account/personal-info")}
            >
              View Profile
            </button>

            <button
              className="w-full py-3 bg-red-500 text-white rounded-xl"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}