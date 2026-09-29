"use client";

import React, { createContext, useContext, useState } from "react";

const ComingSoonContext = createContext(null);

export function ComingSoonProvider({ children }) {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const openComingSoonModal = () => setIsComingSoonOpen(true);
  const closeComingSoonModal = () => setIsComingSoonOpen(false);

  return (
    <ComingSoonContext.Provider
      value={{ isComingSoonOpen, openComingSoonModal, closeComingSoonModal }}
    >
      {children}
    </ComingSoonContext.Provider>
  );
}

export function useComingSoon() {
  const context = useContext(ComingSoonContext);
  if (!context) {
    throw new Error("useComingSoon must be used within a ComingSoonProvider");
  }
  return context;
}
