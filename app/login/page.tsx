"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Default test credentials
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
        // Create profile entry for new user
        const { error: profileError } = await supabase.from("users_profile").insert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
          alert(`Profile setup error: ${profileError.message}\n\nYou can still use the app - your profile will be created when you visit the profile page.`);
        }
        
        router.push("/profile");
      }
    } else {
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
    } else {
      setIsLoggedIn(false);
      router.push("/login");
    }
  };

  const handleQuickLogin = async () => {
    setEmail(DEFAULT_EMAIL);
    setPassword(DEFAULT_PASSWORD);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD
    });
    
    if (error) {
      alert(`Quick login error: ${error.message}\n\nPlease create the default user first:\n1. Go to Supabase Dashboard → Authentication → Users\n2. Add user: ${DEFAULT_EMAIL}\n3. Password: ${DEFAULT_PASSWORD}\n4. Auto Confirm: YES`);
    } else {
      // Reload user profile
      await checkUser();
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <Card>
        {isLoggedIn ? (
          <div className="space-y-4">
            <h1 className="text-lg font-semibold text-center">
              You are already logged in
            </h1>
            <div className="space-y-2">
              <Button 
                className="w-full bg-brandPurple text-white hover:bg-brandLavender" 
                onClick={() => router.push("/")}
              >
                Go to Home
              </Button>
              <Button 
                className="w-full bg-slate-500 text-white hover:bg-slate-600" 
                onClick={() => router.push("/profile")}
              >
                View Profile
              </Button>
              <Button 
                className="w-full bg-red-500 text-white hover:bg-red-600" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-center">
              {isSignup ? "Create Account" : "Login"}
            </h1>

            <div className="space-y-3 mt-4">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <Button className="w-full bg-brandPurple text-white" onClick={handleSubmit}>
                {isSignup ? "Sign Up" : "Login"}
              </Button>
            </div>

            <button
              className="text-xs mt-2 text-sky-500"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Already have an account?" : "Create an account"}
            </button>

            {/* Quick Login Button for Testing */}
            {!isSignup && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 text-center mb-2">
                  Quick Login (Test User)
                </p>
                <Button
                  className="w-full bg-slate-500 text-white text-xs py-2 hover:bg-slate-600"
                  onClick={handleQuickLogin}
                >
                  Login as test@example.com
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}