"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPhoneOTP: (phone: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("ramya-user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Create a persistent Guest / Anonymous session
        const guestUser: User = {
          id: `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
          isAnonymous: true,
          displayName: "Guest User",
        };
        localStorage.setItem("ramya-user", JSON.stringify(guestUser));
        setUser(guestUser);
      }
    } catch (err) {
      console.error("Error loading user session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Future Google Login Integration
  const loginWithGoogle = async () => {
    console.log("Future Auth Integration: Initializing Google Login Flow");
    // Placeholders for future OAuth client flow
    // Example:
    // const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  // Future Phone OTP Login Integration
  const loginWithPhoneOTP = async (phone: string) => {
    console.log(`Future Auth Integration: Sending OTP Code to phone: ${phone}`);
    // Placeholders for future OTP flow
    // Example:
    // const { data, error } = await supabase.auth.signInWithOtp({ phone });
  };

  // Future Email Password/MagicLink Login Integration
  const loginWithEmail = async (email: string) => {
    console.log(`Future Auth Integration: Sending Magic Link or password challenge to email: ${email}`);
    // Placeholders for future Email flow
    // Example:
    // const { data, error } = await supabase.auth.signInWithOtp({ email });
  };

  const logout = async () => {
    try {
      localStorage.removeItem("ramya-user");
      // Reset back to a fresh guest session
      const freshGuest: User = {
        id: `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
        isAnonymous: true,
        displayName: "Guest User",
      };
      localStorage.setItem("ramya-user", JSON.stringify(freshGuest));
      setUser(freshGuest);
    } catch (err) {
      console.error("Error during logout session reset:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithPhoneOTP,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
