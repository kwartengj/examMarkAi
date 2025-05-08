"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "./api";

interface User {
  _id: string;
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

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success) {
          setUser(response.user);
        }
      } catch (err) {
        // User is not logged in, that's okay
        console.log("User not authenticated");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // For dummy login with test credentials, bypass API call
      if (email === "test@example.com" && password === "password") {
        // Create a mock user
        setUser({
          _id: "dummy-user-id",
          username: "Test User",
          email: "test@example.com",
          role: "Examiner",
        });
        setLoading(false);
        return;
      }

      const response = await authAPI.login({ email, password });
      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
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
        await login(email, password);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed");
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
