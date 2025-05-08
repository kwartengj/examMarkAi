"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "./api";
import { supabase } from "../lib/supabaseClient";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in using Supabase session
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // For development purposes, set a default user
        setUser({
          id: "dummy-user-id",
          username: "Test User",
          email: "test@example.com",
          role: "examiner",
        });

        // Check if supabase is initialized
        if (!supabase) {
          console.error("Supabase client is not initialized");
          setLoading(false);
          return;
        }

        // Get current session from Supabase
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData?.session) {
          // User is logged in, get user data
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            setUser(response.user);
          }
        }
      } catch (err) {
        console.log("User not authenticated", err);
        // Still set loading to false even if there's an error
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Set up auth state change listener only if supabase is initialized
    let authListener = { subscription: { unsubscribe: () => {} } };

    if (supabase) {
      authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            setUser(response.user);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      });
    }

    // Clean up subscription
    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // For dummy login with test credentials, bypass API call
      if (email === "test@example.com" && password === "password") {
        // Create a mock user
        setUser({
          id: "dummy-user-id",
          username: "Test User",
          email: "test@example.com",
          role: "examiner",
        });
        setLoading(false);
        return;
      }

      const response = await authAPI.login({ email, password });
      console.log("Login response:", response);

      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error in AuthContext:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register({ username, email, password });
      if (response.success) {
        // Auto login after registration
        setUser(response.user);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await authAPI.logout();
      if (response.success) {
        setUser(null);
      } else {
        setError(response.message || "Logout failed");
      }
    } catch (err: any) {
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
