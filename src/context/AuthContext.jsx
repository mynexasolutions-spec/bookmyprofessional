"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // "login" | "signup"
  const [authRole, setAuthRole] = useState("customer"); // "customer" | "professional"
  const [user, setUser] = useState(null); // { name, email, role, avatar }
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Restore user session from localStorage on initial load
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("bookmypro_auth_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error("Failed to restore user session:", error);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
  };

  const openAuthModal = (tab = "login", role = "customer") => {
    setAuthModalTab(tab);
    setAuthRole(role);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (userData) => {
    setUser(userData);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("bookmypro_auth_user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to persist user session:", error);
    }
    closeAuthModal();
    showToast(`Welcome back, ${userData.name || "User"}! You are now logged in.`);
  };

  const signup = (userData) => {
    setUser(userData);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("bookmypro_auth_user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to persist user session:", error);
    }
    closeAuthModal();
    showToast(`Welcome to BookMyProfessional, ${userData.name}! Your account was created successfully.`);
  };

  const logout = () => {
    setUser(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("bookmypro_auth_user");
      }
    } catch (error) {
      console.error("Failed to clear user session:", error);
    }
    showToast("You have been signed out successfully.", "info");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthModalOpen,
        authModalTab,
        authRole,
        user,
        isAuthLoading,
        toastMessage,
        setAuthModalTab,
        setAuthRole,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
