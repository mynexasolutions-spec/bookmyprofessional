"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Button from "./Button";
import {
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  Settings,
  Calendar,
  ChevronDown,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, openAuthModal, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Exact navigation links from header
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Find a Professional", href: "#find" },
    { label: "Categories", href: "#categories" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1300px] items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-18">
        {/* Brand Logo */}
        <Link href="/" className="flex flex-col group py-1">
          <div className="flex items-baseline font-heading text-xl sm:text-2xl font-bold tracking-tight text-dark-900 leading-none">
            <span>Book</span>
            <span className="text-primary-500">My</span>
            <span>Professional</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-normal text-dark-500 tracking-normal mt-1 leading-tight font-sans">
            Skilled People. Better Living.
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-dark-700 transition-colors hover:text-primary-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons / Authenticated User Profile */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-border bg-surface hover:bg-dark-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-primary-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-dark-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-primary-600 font-medium capitalize">
                    {user.role || "Member"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-dark-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-dark-900">{user.name}</p>
                    <p className="text-[11px] text-dark-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <a
                      href="#bookings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Calendar className="h-4 w-4 text-dark-400" />
                      <span>My Bookings</span>
                    </a>
                    <a
                      href="#profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-dark-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-dark-400" />
                      <span>Account Settings</span>
                    </a>
                  </div>

                  <div className="pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAuthModal("login", "customer")}
                className="px-5 py-2 rounded-[5px] outline-none text-primary-600 border-primary-500 hover:bg-primary-50 font-semibold"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuthModal("signup", "customer")}
                className="px-5 py-2 rounded-[5px] outline-none font-semibold shadow-button"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Actions */}
        <div className="flex lg:hidden items-center gap-2">
          {!user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAuthModal("login", "customer")}
              className="sm:hidden px-2 py-1.5 text-xs text-primary-600 border-primary-500"
            >
              Login
            </Button>
          )}

          {user && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden flex items-center gap-1.5 p-1 rounded-full border border-border"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-button p-2 text-dark-600 hover:bg-dark-50 hover:text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-4 pt-3 pb-6 shadow-soft animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-1.5 rounded-button text-sm font-medium text-dark-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            ))}

            <div className="pt-4 mt-2 border-t border-border flex flex-col gap-2.5">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-dark-900">{user.name}</p>
                      <p className="text-xs text-dark-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-primary-600 border-primary-500"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("login", "customer");
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("signup", "customer");
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
