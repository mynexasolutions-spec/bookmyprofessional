"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/HowItWorks";
import { getSiteContent } from "@/lib/data/site-content";
import { ChevronRight, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function HowItWorksPage() {
  const [social, setSocial] = useState({});

  useEffect(() => {
    let active = true;
    getSiteContent().then((content) => {
      if (!active) return;
      setSocial(content.social);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-dark-800">
      <Navbar />

      {/* BREADCRUMB */}
      <div className="bg-surface border-b border-border py-3">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-dark-500 font-medium">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
            <span className="text-dark-900 font-semibold">How It Works</span>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <HowItWorks />
      </main>

      {/* FOOTER */}
      <footer className="bg-[#031726] text-white pt-12 pb-8 border-t border-[#0d2a44]">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            <div>
              <div className="flex flex-col">
                <Link href="/" className="font-heading text-xl font-bold tracking-tight text-white">
                  <span>Book</span>
                  <span className="text-[#0070F3]">My</span>
                  <span>Professional</span>
                </Link>
                <span className="text-[11px] text-white/70 mt-0.5">
                  Skilled People. Better Living.
                </span>
              </div>
              <p className="mt-3 text-xs text-white/70 max-w-xs leading-relaxed">
                Connecting you with verified professionals for high-quality, dependable services.
              </p>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/professionals" className="hover:text-white transition-colors">
                    Find Experts
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/vendor" className="hover:text-white transition-colors">
                    Vendor Portal
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold text-white mb-3">Legal & Safety</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Escrow Protection
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Verification Standard
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Terms & Privacy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold text-white mb-3">Support</h4>
              <p className="text-xs text-white/70 mb-2">
                Have a question or need assistance with a booking?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center text-xs font-semibold text-primary-400 hover:text-primary-300"
              >
                Contact Support Desk →
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-3">
            <p>© {new Date().getFullYear()} BookMyProfessional. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {[
                { key: "facebook", Icon: Facebook, label: "Facebook" },
                { key: "instagram", Icon: Instagram, label: "Instagram" },
                { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
                { key: "youtube", Icon: Youtube, label: "YouTube" },
              ]
                .filter(({ key }) => social[key])
                .map(({ key, Icon, label }) => (
                  <a
                    key={key}
                    href={social[key]}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="hover:text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
