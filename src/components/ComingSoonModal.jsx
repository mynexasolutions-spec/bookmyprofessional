"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useComingSoon } from "@/context/ComingSoonContext";

const STORES = [
  {
    name: "App Store",
    logo: "/images/top_categories/apple-logo.svg",
    alt: "Apple logo",
  },
  {
    name: "Google Play",
    logo: "/images/top_categories/playstore.webp",
    alt: "Google Play logo",
  },
];

export default function ComingSoonModal() {
  const { isComingSoonOpen, closeComingSoonModal } = useComingSoon();

  useEffect(() => {
    if (!isComingSoonOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeComingSoonModal();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isComingSoonOpen, closeComingSoonModal]);

  if (!isComingSoonOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Coming soon"
    >
      {/* Backdrop: dimmed + blurred */}
      <div
        className="absolute inset-0 bg-dark-900/60 backdrop-blur-md animate-[comingSoonFade_150ms_ease-out]"
        onClick={closeComingSoonModal}
        aria-hidden="true"
      />

      {/* Popup */}
      <div className="relative z-10 w-full max-w-[600px] max-h-[90vh] overflow-y-auto bg-white rounded-[24px] sm:rounded-[28px] shadow-2xl px-6 py-8 sm:px-10 sm:py-10 text-center animate-[comingSoonIn_180ms_ease-out]">
        <button
          type="button"
          onClick={closeComingSoonModal}
          aria-label="Close modal"
          autoFocus
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-dark-50 text-dark-500 hover:bg-dark-100 hover:text-dark-700 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        <img
          src="/images/coming%20soon.png"
          alt="BookMyProfessional mobile app coming soon"
          className="mx-auto w-[200px] sm:w-[260px] h-auto"
        />

        <h3 className="font-heading text-3xl sm:text-[40px] font-extrabold text-dark-900 tracking-tight mt-4 sm:mt-5">
          Coming <span className="text-primary-500">Soon!</span>
        </h3>

        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-dark-500 leading-relaxed max-w-[440px] mx-auto">
          Our mobile app is on the way! You'll soon be able to book, manage and
          connect with professionals directly from your phone.
        </p>

        <div className="mt-7 sm:mt-9 bg-primary-50 rounded-2xl px-4 sm:px-6 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-primary-200">
          {STORES.map((store) => (
            <div
              key={store.name}
              className="flex items-center justify-center gap-3 flex-1 py-4 sm:py-5 sm:px-4 min-w-0"
            >
              <img
                src={store.logo}
                alt={store.alt}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
              />
              <div className="text-left leading-tight">
                <span className="block text-[11px] sm:text-xs text-dark-500">
                  Available on
                </span>
                <span className="block font-heading text-sm sm:text-lg font-bold text-dark-900">
                  {store.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
