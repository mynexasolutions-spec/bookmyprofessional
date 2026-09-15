"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // "login" | "signup"
  const [authRole, setAuthRole] = useState("customer"); // "customer" | "professional"
  const [user, setUser] = useState(null); // { name, email, role, avatar }
  const [toastMessage, setToastMessage] = useState(null);

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
    closeAuthModal();
    showToast(`Welcome back, ${userData.name || "User"}! You are now logged in.`);
  };

  const signup = (userData) => {
    setUser(userData);
    closeAuthModal();
    showToast(`Welcome to BookMyProfessional, ${userData.name}! Your account was created successfully.`);
  };

  const logout = () => {
    setUser(null);
    showToast("You have been signed out successfully.", "info");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthModalOpen,
        authModalTab,
        authRole,
        user,
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
