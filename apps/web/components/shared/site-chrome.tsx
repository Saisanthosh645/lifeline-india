"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HeartPulse, Siren, Phone, LayoutDashboard, User, Shield, Compass, Droplet, Activity, ClipboardList, ShieldAlert, Keyboard } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useLifeline } from "@/lib/state-engine";
import { motion, AnimatePresence } from "framer-motion";

const citizenLinks = [
  { label: "Emergency SOS", href: "/sos", icon: Siren },
  { label: "Hospitals & ER", href: "/hospitals", icon: Compass },
  { label: "Blood Matcher", href: "/blood-banks", icon: Droplet },
  { label: "Ambulance Fleet", href: "/ambulance", icon: Activity },
  { label: "Care Records", href: "/health-records", icon: ClipboardList },
];

const platformLinks = [
  { label: "For Emergency Desks", href: "/for/hospitals" },
  { label: "For EMT Drivers", href: "/for/ambulances" },
  { label: "For Blood Banks", href: "/for/blood-banks" },
  { label: "For State Command", href: "/for/government" },
  { label: "For First Responders", href: "/for/volunteers" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { currentUser } = useLifeline();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 py-4">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 bg-white/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-xl shadow-lg dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-600/10 text-red-500 border border-red-500/20"
            >
              <HeartPulse size={16} className="animate-pulse" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-[0.25em] uppercase text-zinc-900 dark:text-white leading-none">
                LIFELINE INDIA
              </span>
              <span className="text-[8px] font-bold tracking-wider text-red-500 uppercase mt-0.5">
                National Resiliency Mesh
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1.5 text-xs font-semibold md:flex">
            {citizenLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-xl px-3.5 py-2 transition-all duration-200 ${
                    isActive
                      ? "text-red-500 bg-red-500/10 border border-red-500/25"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <link.icon size={13} className={isActive ? "text-red-500 animate-pulse" : "text-zinc-400"} />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {currentUser?.isLoggedIn ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/15"
              >
                <LayoutDashboard size={13} className="animate-spin-slow" />
                <span>My Profile</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 px-3.5 py-2 text-xs font-bold transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth"
                  className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-600/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-keyboard-shortcuts-help"))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              aria-label="Open keyboard shortcuts guide. Keyboard shortcut is letter K or question mark"
              title="Keyboard Shortcuts (K or ?)"
            >
              <Keyboard size={15} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 w-full border-t border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 py-16">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Logo and desc */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/10 text-red-500 border border-red-500/20">
                <HeartPulse size={18} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-[0.2em] uppercase text-zinc-900 dark:text-white">
                  LIFELINE INDIA
                </span>
                <span className="text-[8px] font-black tracking-wider text-red-500 uppercase">
                  National Response System
                </span>
              </div>
            </div>
            <p className="text-xs leading-6 text-zinc-600 dark:text-zinc-400 max-w-sm">
              India&apos;s unified operational layer for emergency coordination. Connecting 1.4 billion citizens securely with on-ground responders, critical blood banks, and verified hospital ICU triage systems.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-red-500 bg-red-500/5 px-3 py-1.5 rounded-xl border border-red-500/10 uppercase tracking-widest">
              <ShieldAlert size={12} className="animate-pulse text-red-500" />
              24×7 Operational Mesh Active
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Citizen Services</p>
            <ul className="mt-4 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              {citizenLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-zinc-900 dark:hover:text-white flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-red-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Clinical Platform</p>
            <ul className="mt-4 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-zinc-900 dark:hover:text-white flex items-center gap-2">
                    <span className="h-1 w-1 bg-zinc-400 dark:bg-zinc-700 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency contacts */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Indian Emergency Hotlines</p>
            <ul className="space-y-2">
              {[
                { label: "National Emergency", num: "112" },
                { label: "Ambulance Dispatch", num: "108" },
                { label: "Police Central", num: "100" },
                { label: "Fire & Rescue Control", num: "101" },
              ].map((e) => (
                <li key={e.label} className="flex items-center justify-between text-xs border-b border-zinc-200 dark:border-zinc-900 pb-2">
                  <span className="text-zinc-650 dark:text-zinc-400">{e.label}</span>
                  <a
                    href={`tel:${e.num}`}
                    className="flex items-center gap-1.5 font-black text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Phone size={10} /> {e.num}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/auth"
              className="block w-full rounded-xl bg-red-600 hover:bg-red-700 py-3 text-center text-xs font-black text-white shadow-lg shadow-red-600/10 transition-all"
            >
              Register Citizen ID →
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-900 pt-8 md:flex-row text-[10px] text-zinc-500">
          <p>© 2026 LIFELINE INDIA. Engineered for absolute zero-margin scenarios. Government Registered.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition">Terms of Service</Link>
            <Link href="/api-docs" className="hover:text-zinc-900 dark:hover:text-white transition">Core Registry API</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { citizenLinks, platformLinks };
