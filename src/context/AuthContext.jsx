"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/lib/data/profiles";

const AuthContext = createContext(null);

// Demo mode: skip Supabase Auth entirely and keep a fake session in localStorage.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_STORAGE_KEY = "bmp_demo_user";

function mapUser(authUser, profile) {
  const meta = authUser?.user_metadata || {};
  const email = profile?.email || authUser?.email || "";

  return {
    id: authUser?.id,
    name: profile?.full_name || meta.full_name || email.split("@")[0] || "User",
    email,
    role: profile?.role || meta.role || "customer",
    avatar: profile?.avatar_url || null,
  };
}

function readDemoUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDemoUser(user) {
  if (typeof window === "undefined") return;
  try {
    if (user) window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // ignore quota / privacy-mode errors
  }
}

function makeDemoUser({ name, email, role } = {}) {
  const r = role === "professional" ? "professional" : "customer";
  const mail = (email || "").trim() || `${r}@demo.com`;
  return {
    id: `demo-${r}`,
    name: (name || "").trim() || mail.split("@")[0] || "Demo User",
    email: mail,
    role: r,
    avatar: null,
    demo: true,
  };
}

export function AuthProvider({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // "login" | "signup"
  const [authRole, setAuthRole] = useState("customer"); // "customer" | "professional"
  const [user, setUser] = useState(null); // { id, name, email, role, avatar }
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

  // Restore the session (demo: localStorage; otherwise Supabase) and stay in sync
  useEffect(() => {
    if (DEMO_MODE) {
      setUser(readDemoUser());
      return;
    }

    const supabase = createClient();
    let active = true;

    const hydrate = async (authUser) => {
      const profile = await getProfile(authUser.id);
      if (active) setUser(mapUser(authUser, profile));
    };

    supabase.auth.getSession().then(({ data }) => {
      if (active && data?.session?.user) hydrate(data.session.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) hydrate(session.user);
      else setUser(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const login = async ({ identifier, email, password, role } = {}) => {
    const mail = (identifier || email || "").trim();

    if (!mail || !password) {
      const error = new Error("Please enter your email and password.");
      showToast(error.message, "error");
      throw error;
    }

    if (DEMO_MODE) {
      const demoUser = makeDemoUser({ email: mail, role });
      writeDemoUser(demoUser);
      setUser(demoUser);
      closeAuthModal();
      showToast(`Welcome back, ${demoUser.name}! You are now logged in.`);
      return demoUser;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: mail,
      password,
    });

    if (error) {
      showToast(error.message, "error");
      throw error;
    }

    closeAuthModal();
    showToast(
      `Welcome back, ${data.user?.user_metadata?.full_name || mail.split("@")[0]}! You are now logged in.`
    );
    return data.user;
  };

  const signup = async ({
    fullName,
    name,
    email,
    phone,
    password,
    role,
    category,
    city,
  } = {}) => {
    const displayName = (fullName || name || "").trim();

    if (DEMO_MODE) {
      const demoUser = makeDemoUser({ name: displayName, email, role });
      writeDemoUser(demoUser);
      setUser(demoUser);
      closeAuthModal();
      showToast(`Welcome to BookMyProfessional, ${demoUser.name}! Your account was created.`);
      return { user: demoUser };
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName, role, phone, city },
      },
    });

    if (error) {
      showToast(error.message, "error");
      throw error;
    }

    if (role === "professional" && data?.user) {
      try {
        const { error: proError } = await supabase.from("professionals").insert({
          id: data.user.id,
          name: displayName,
          category,
          city,
          verification_status: "pending",
        });
        if (proError) throw proError;
      } catch {
        // ponytail: professionals row is best-effort — the table may not exist yet, and with
        // email confirmation on there is no session so RLS blocks the insert. Move this into a
        // DB trigger on profiles when the schema is applied.
      }
    }

    closeAuthModal();

    if (!data?.session) {
      showToast("Account created. Check your email to confirm it, then sign in.", "info");
      return { needsEmailConfirmation: true };
    }

    showToast(
      `Welcome to BookMyProfessional, ${displayName}! Your account was created successfully.`
    );
    return { user: data.user };
  };

  const logout = async () => {
    if (DEMO_MODE) {
      writeDemoUser(null);
      setUser(null);
      showToast("You have been signed out successfully.", "info");
      return;
    }

    try {
      await createClient().auth.signOut();
    } catch {
      // ignore — local state is cleared below regardless
    }
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
