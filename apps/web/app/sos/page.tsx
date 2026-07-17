"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Siren, MapPin, Radio, Ambulance, HeartPulse, Mic, Wifi, Phone, 
  CheckCircle, Volume2, VolumeX, ShieldAlert, Activity, ArrowLeft,
  Navigation, Trash, Settings, Keyboard 
} from "lucide-react";
import { useLifeline } from "@/lib/state-engine";
import { playEmergencySiren, stopEmergencySiren, playDigitalBeep, playSuccessChime } from "@/lib/audio-tones";
import { SiteHeader, SiteFooter } from "@/components/shared/site-chrome";
import { InteractiveMap } from "@/components/shared/interactive-map";
import Link from "next/link";

const timelineSteps = [
  { icon: MapPin, label: "GPS broadcast verified", time: "0.8s", desc: "Sub-3m coordinates locked" },
  { icon: Radio, label: "108 dispatch operator notified", time: "1.2s", desc: "Emergency bypass routing" },
  { icon: Ambulance, label: "Ambulance BLR-108 dispatched", time: "3.4s", desc: "EMT crew active" },
  { icon: HeartPulse, label: "Fortis Hospital ER Bed Pre-Alert", time: "4.1s", desc: "ICU triage prepared" },
];

export default function SosPage() {
  const { activeSos, triggerSos, cancelSos, resolveSos } = useLifeline();
  const [voiceActive, setVoiceActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Synchronize Audio Siren with active SOS status
  useEffect(() => {
    if (activeSos.status === "active" && soundEnabled) {
      playEmergencySiren();
    } else {
      stopEmergencySiren();
    }
    return () => stopEmergencySiren();
  }, [activeSos.status, soundEnabled]);

  const handleTrigger = () => {
    playDigitalBeep();
    triggerSos("HSR Layout Sector 4, Bengaluru");
  };

  const handleCancel = () => {
    playDigitalBeep();
    cancelSos();
  };

  const handleResolve = () => {
    playSuccessChime();
    resolveSos();
  };

  const simulateVoice = () => {
    setVoiceActive(true);
    playDigitalBeep();
    setTimeout(() => {
      setVoiceActive(false);
      handleTrigger();
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-red-600 selection:text-white transition-colors duration-300">
      {/* Centralized Glass Header */}
      <SiteHeader />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Breadcrumb & Page title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-500 hover:text-red-500 transition mb-2 uppercase tracking-widest"
            >
              <ArrowLeft size={12} /> Back To Dashboard
            </Link>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-red-600 animate-pulse" />
              SOS CONTROL STATION
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">One-tap critical response console connecting GPS, 108 operators, and ICU desks.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-keyboard-shortcuts-help"))}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition"
              aria-label="Open emergency keyboard shortcuts. Keyboard shortcut is K"
              title="Keyboard Shortcuts (K)"
            >
              <Keyboard size={13} />
              <span>Keyboard Binds</span>
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition ${
                soundEnabled 
                  ? "bg-red-600/10 border-red-500/30 text-red-600 dark:text-red-400" 
                  : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {soundEnabled ? <Volume2 size={13} className="animate-bounce" /> : <VolumeX size={13} />}
              <span>Siren Audio: {soundEnabled ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* MAIN SPLIT GRID: Dispatch controller on Left, Live Tracking on Right */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: Dispatch Controller State Machine */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/20 p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none backdrop-blur-md">
              {/* Radar network glow backing */}
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

              <AnimatePresence mode="wait">
                {activeSos.status === "countdown" ? (
                  <motion.div
                    key="countdown"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-6 py-12"
                  >
                    <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-red-600/10 border border-red-500/20">
                      <span className="absolute inset-0 rounded-full bg-red-500/15 animate-ping" />
                      <p className="text-6xl font-black text-red-500 tracking-tighter">{activeSos.countdown}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-400">SOS Trigger Pending</p>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                        Broadcasting encrypted GPS coordinates and launching emergency fleet in seconds.
                      </p>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-8 py-3 text-xs font-black text-red-400 transition-all uppercase tracking-widest"
                    >
                      Cancel Alert
                    </button>
                  </motion.div>
                ) : activeSos.status === "active" ? (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-[10px] font-black tracking-widest text-red-400 uppercase">DISPATCH STATE ACTIVE · #L{activeSos.id}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono font-black text-zinc-500">
                        <span>LAT: 12.9141° N</span>
                        <span>LNG: 77.6413° E</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center py-6">
                      <div className="relative flex items-center justify-center">
                        <span className="absolute h-28 w-28 rounded-full bg-red-500/20 animate-ping" />
                        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 border border-red-400/30 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                          <Siren size={36} className="animate-spin-slow text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="space-y-3">
                      {timelineSteps.map((s, i) => {
                        const Icon = s.icon;
                        const done = activeSos.step >= i;
                        return (
                          <div
                            key={s.label}
                            className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
                              done
                                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                                : "border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${done ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
                              <Icon size={14} className={done ? "" : "animate-pulse"} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-black">{s.label}</p>
                                <span className={`text-[9px] font-mono font-bold ${done ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`}>
                                  {done ? s.time : "PENDING"}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">{s.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleCancel}
                        className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition"
                      >
                        Abort Protocol
                      </button>
                      {activeSos.step >= 4 && (
                        <button
                          onClick={handleResolve}
                          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition"
                        >
                          Mark Resolved & Save Log
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : activeSos.status === "resolved" ? (
                  <motion.div
                    key="resolved"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-6 py-12"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle size={36} className="animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-black text-emerald-400">SOS Emergency Resolved</p>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        All dispatch nodes closed safely. Timeline data has been stitched to your secure profile care ledger.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <Link
                        href="/profile"
                        className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 text-xs font-black text-zinc-300 transition"
                      >
                        View Profile Ledger
                      </Link>
                      <button
                        onClick={handleTrigger}
                        className="rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 text-xs font-black text-white transition"
                      >
                        Test SOS Trigger Again
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-6 py-12"
                  >
                    <div className="flex justify-center">
                      <button
                        onClick={handleTrigger}
                        className="relative flex h-40 w-40 items-center justify-center rounded-full cursor-pointer bg-gradient-to-br from-red-600 to-red-800 text-white shadow-[0_0_60px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95 transition border border-red-500/30"
                      >
                        <span className="absolute inset-0 rounded-full bg-red-600/25 blur-md animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="relative z-10 flex flex-col items-center">
                          <Siren size={36} className="text-white animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-wider mt-2">TAP TO SOS</span>
                        </div>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">READY FOR DISPATCH</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        Tapping will trigger a 3-second alert buffer. Tap or hold button to instantly mobilize local paramedics.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick telemetry toggle cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={simulateVoice}
                disabled={voiceActive || activeSos.status !== "idle"}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/30 p-5 text-left transition hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 disabled:opacity-50 shadow-sm"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${voiceActive ? "bg-red-500/10 text-red-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
                  <Mic size={16} className={voiceActive ? "animate-pulse" : ""} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Voice Keyphrase</p>
                  <p className="text-xs font-bold text-zinc-800 dark:text-white mt-0.5">{voiceActive ? "Listening..." : "Say 'LIFELINE SOS'"}</p>
                </div>
              </button>

              <button
                onClick={() => playDigitalBeep()}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/30 p-5 text-left transition hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <Wifi size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Resilient Node</p>
                  <p className="text-xs font-bold text-zinc-800 dark:text-white mt-0.5">Dual-link SMS/Bluetooth</p>
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT: Live Tracking Map + Dialing Backup Directory */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Live Interactive Map representation */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/10 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Live Satellite Beacon</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                  <Navigation size={10} className="text-red-500 animate-pulse" />
                  ACCURACY: ±3m
                </span>
              </div>
              <InteractiveMap />
            </div>

            {/* Direct Dialing emergency backup */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/10 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
                <Phone size={12} className="text-red-500" /> Dial Backup Hotlines
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { name: "General Helpdesk", num: "112" },
                  { name: "Medical Dispatch", num: "108" },
                  { name: "Police Control Room", num: "100" },
                  { name: "Fire & Rescue Desk", num: "101" },
                ].map((e) => (
                  <a
                    key={e.num}
                    href={`tel:${e.num}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40 p-3.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-800 transition"
                  >
                    <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">{e.name}</span>
                    <span className="flex items-center gap-1.5 font-mono font-black text-xs text-red-500">
                      <Phone size={10} /> {e.num}
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Centralized Glass Footer */}
      <SiteFooter />
    </main>
  );
}
