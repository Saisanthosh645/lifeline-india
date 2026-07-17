"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Siren, ShieldAlert, Activity, ArrowRight, Phone, 
  MapPin, Compass, Droplet, ClipboardList, Clock, 
  Plus, Users, AlertCircle, Sparkles, Navigation 
} from "lucide-react";
import { AuthModal } from "@/components/shared/auth-modal";
import { SiteHeader, SiteFooter } from "@/components/shared/site-chrome";
import { InteractiveMap } from "@/components/shared/interactive-map";
import { useLifeline } from "@/lib/state-engine";
import { playDigitalBeep, playSuccessChime } from "@/lib/audio-tones";
import Link from "next/link";

export default function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const { currentUser, activeSos, triggerSos } = useLifeline();

  // Hold-to-activate SOS Button state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // Quick Action Gates
  const handleRestrictedAction = (targetUrl: string) => {
    if (currentUser && currentUser.isLoggedIn) {
      window.location.href = targetUrl;
    } else {
      setAuthMode("signup");
      setAuthOpen(true);
    }
  };

  // SOS Hold-to-activate loop (3 Seconds)
  const startHolding = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    setHoldProgress(0);
    playDigitalBeep();
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(100, (elapsed / 3000) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(timerRef.current);
        triggerSos("HSR Layout Sector 4, Bengaluru");
        playSuccessChime();
        window.location.href = "/sos";
      }
    }, 50);
  };

  const stopHolding = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen selection:bg-red-600 selection:text-white">
      {/* Centralized Glass Header */}
      <SiteHeader />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TOP STATUS BAR: Active network state */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 p-4 backdrop-blur-xl mb-12 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-300">
              <span>National Operations Network:</span>
              <span className="text-emerald-550 dark:text-emerald-400">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold text-zinc-500 dark:text-zinc-500 font-mono">
            <span>PING: 14ms</span>
            <span>NODES DETECTED: 5,621</span>
            <span>BEACON: ACTIVE</span>
          </div>
        </div>

        {/* HERO SECTION: Split layout with Massive SOS on Left, Map on Right */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch mb-16">
          
          {/* LEFT PANEL: Massive SOS Console (Occupies almost half the grid) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 p-8 relative overflow-hidden shadow-sm dark:shadow-none">
            {/* Dark radar sweep decoration */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.02)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-500">
                <ShieldAlert size={12} className="animate-pulse" />
                Critical Incident Dispatch
              </div>
              
              <h1 className="text-4xl font-black tracking-tight leading-[1.1] text-zinc-900 dark:text-white">
                EMERGENCY?<br />
                <span className="text-red-500">PRESS & HOLD SOS</span>
              </h1>
              
              <p className="text-xs text-zinc-650 dark:text-zinc-400 max-w-sm leading-relaxed">
                Will initiate a secure 3-second countdown buffer before instant satellite GPS broadcast, volunteer geofencing, and trauma center pre-alerts. <strong className="text-red-600 dark:text-red-400">Desktop users: hold down Spacebar on any page to activate.</strong>
              </p>
            </div>

            {/* THE MASSIVE SOS BUTTON CORE */}
            <div className="my-10 flex flex-col items-center justify-center">
              <div className="relative">
                {/* Outer holding rings */}
                <AnimatePresence>
                  {isHolding && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute inset-0 rounded-full border border-red-500/30 bg-red-600/10 blur-md pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Pulsing ring base */}
                <span className="absolute -inset-6 rounded-full bg-red-600/[0.04] dark:bg-red-600/[0.06] animate-pulse pointer-events-none" style={{ animationDuration: "3s" }} />

                {/* Main holding element */}
                <button
                  onMouseDown={startHolding}
                  onMouseUp={stopHolding}
                  onMouseLeave={stopHolding}
                  onTouchStart={startHolding}
                  onTouchEnd={stopHolding}
                  className="relative flex h-52 w-52 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white select-none shadow-[0_0_80px_rgba(220,38,38,0.35)] hover:shadow-[0_0_100px_rgba(220,38,38,0.5)] active:scale-95 transition-all cursor-pointer border border-red-400/30"
                  style={{ touchAction: "none" }}
                  id="major-sos-button"
                >
                  {/* SVG progress border */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none">
                    <circle
                      cx="104"
                      cy="104"
                      r="98"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="104"
                      cy="104"
                      r="98"
                      stroke="white"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 98}
                      strokeDashoffset={2 * Math.PI * 98 * (1 - holdProgress / 100)}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Button Labeling */}
                  <div className="text-center space-y-1 relative z-10 pointer-events-none">
                    <Siren size={44} className="mx-auto text-white animate-bounce" />
                    <p className="text-3xl font-black tracking-tighter uppercase">SOS</p>
                    <p className="text-[10px] font-bold text-red-200 tracking-wider">
                      {isHolding ? `HOLDING... ${Math.ceil((3000 - (holdProgress / 100) * 3000) / 1000)}s` : "HOLD 3 SECONDS"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Status / Help Link */}
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/80 pt-4 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 text-red-500">
                <AlertCircle size={12} className="animate-bounce" /> Always active on satellite backup
              </span>
              <Link href="/sos" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 underline transition">
                Live Dispatch Room <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* RIGHT PANEL: Live Interactive Map Console (Apple/Tesla dashboard aesthetic) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/10 p-6 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Live Incident Feed</h3>
                <p className="text-[11px] text-zinc-650 dark:text-zinc-400">Telemetry layers showing nearest hospital hubs, dispatch tracks, and emergency units.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-red-500 dark:text-red-400 border border-red-500/20">
                <Activity size={10} className="animate-pulse" /> Live HUD
              </span>
            </div>

            {/* Map Canvas */}
            <InteractiveMap />

            <div className="grid grid-cols-3 gap-4 mt-4 pt-2">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">TRAUMA EMERGENCY Bed Updates</p>
                <p className="text-lg font-black text-zinc-900 dark:text-white mt-1">42 Stations</p>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Connected Blood Reserves</p>
                <p className="text-lg font-black text-red-500 mt-1">920+ Bags</p>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Ambulance Fleet Status</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">Active / Live</p>
              </div>
            </div>
          </div>

        </div>

        {/* ACTION DECK: Apple Maps / Uber style tactile cards with absolutely zero tech larping */}
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500 mb-6 flex items-center gap-2">
          <Sparkles size={12} className="text-red-500" /> Essential Incident Services
        </h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          
          <button
            onClick={() => handleRestrictedAction("/hospitals")}
            className="group flex flex-col justify-between text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/20 p-6 hover:bg-white dark:hover:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 border border-red-500/10">
                <Compass size={18} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Live Beds</span>
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">Hospital ICU Beds</h3>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-400 mt-1 leading-relaxed">Map nearby trauma hospitals, lock emergency admission slots, and stream incoming vitals.</p>
            </div>
          </button>

          <button
            onClick={() => handleRestrictedAction("/blood-banks")}
            className="group flex flex-col justify-between text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/20 p-6 hover:bg-white dark:hover:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 border border-red-500/10">
                <Droplet size={18} className="fill-red-500/10" />
              </div>
              <span className="text-[10px] font-black text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">Courier</span>
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">Blood Matcher</h3>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-400 mt-1 leading-relaxed">Search real-time repository levels, secure bag matching, and initiate express cold-chain couriers.</p>
            </div>
          </button>

          <button
            onClick={() => handleRestrictedAction("/ambulance")}
            className="group flex flex-col justify-between text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/20 p-6 hover:bg-white dark:hover:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 border border-red-500/10">
                <Activity size={18} />
              </div>
              <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded uppercase">EMT</span>
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">Ambulance Fleet</h3>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-400 mt-1 leading-relaxed">Summon nearest critical-care support unit. Follow active routes with integrated turn-by-turn tracking.</p>
            </div>
          </button>

          <button
            onClick={() => handleRestrictedAction("/health-records")}
            className="group flex flex-col justify-between text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/20 p-6 hover:bg-white dark:hover:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 border border-red-500/10">
                <ClipboardList size={18} />
              </div>
              <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase">Secure</span>
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">Digital Care Passport</h3>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-400 mt-1 leading-relaxed">A stitchable medical records ledger sharing chronic diseases, allergy lists, and blood group data.</p>
            </div>
          </button>
        </div>

        {/* INDIAN EMERGENCY DIRECTORY: High contrast, humble labels */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          
          {/* Direct Calling Registry */}
          <div className="md:col-span-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/10 p-6 shadow-sm dark:shadow-none">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-550 dark:text-zinc-550 mb-4 flex items-center gap-1.5">
              <Phone size={12} className="text-red-500 animate-pulse" /> Official Indian Emergency Lines
            </h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "National General Hotline", num: "112", icon: ShieldAlert, desc: "Unified disaster, police and trauma line" },
                { name: "Direct Ambulance Emergency", num: "108", icon: Siren, desc: "Siren-cleared trauma fleet summon" },
                { name: "Central Police Station Support", num: "100", icon: Activity, desc: "District-level security response desk" },
                { name: "Fire & Rescue Control Rooms", num: "101", icon: Compass, desc: "Urban hazard and structural rescue coordination" },
                { name: "Maternal & Child Care", num: "102", icon: Droplet, desc: "National obstetric dispatch unit" },
                { name: "Women's Safety Helpdesk", num: "1091", icon: ClipboardList, desc: "Domestic and urban threat response" }
              ].map((hotline) => {
                const Icon = hotline.icon;
                return (
                  <a
                    key={hotline.num}
                    href={`tel:${hotline.num}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/30 p-4 hover:bg-white dark:hover:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition group shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-red-500/10 group-hover:text-red-500 transition">
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-800 dark:text-white leading-none">{hotline.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{hotline.desc}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 font-mono font-black text-sm text-red-500 bg-red-500/5 px-2.5 py-1 rounded-lg border border-red-500/15">
                      <Phone size={11} /> {hotline.num}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Regional coverage numbers */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/10 p-6 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-550 dark:text-zinc-500 flex items-center gap-1.5">
                <MapPin size={12} className="text-red-500" /> Operational Metrics
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Lifeline India maintains secondary geofenced mesh networks to route telemetry when cell systems are fully saturated. Satellite backup and SMS telemetry arrays operate on dual frequency.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-500 font-semibold">TRAUMA HUBS</span>
                  <span className="text-zinc-900 dark:text-white font-bold">1,480+ Stations</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-500 font-semibold">OPERATIONAL FLEET</span>
                  <span className="text-zinc-900 dark:text-white font-bold">3,200+ Units</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-500 font-semibold">DISTRICTS DEPLOYED</span>
                  <span className="text-zinc-900 dark:text-white font-bold">640 Districts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 mt-4">
              <Navigation size={11} className="text-red-500 animate-pulse" />
              <span>ACTIVE CELL: Bengaluru South</span>
            </div>
          </div>

        </div>

      </div>

      {/* Centralized Glass Footer */}
      <SiteFooter />

      {/* Single, powerful auth gateway */}
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </main>
  );
}
