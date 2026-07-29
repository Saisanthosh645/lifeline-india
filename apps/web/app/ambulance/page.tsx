"use client";

import { useState } from "react";
import { 
  Ambulance, MapPin, Clock, CheckCircle, Navigation, Phone, 
  ArrowRight, ShieldAlert, Check, ArrowLeft, Activity, User, Eye 
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/shared/site-chrome";
import { useLifeline } from "@/lib/state-engine";
import { playDigitalBeep, playSuccessChime } from "@/lib/audio-tones";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AmbulancePage() {
  const { ambulances, bookAmbulance } = useLifeline();
  const [pickup, setPickup] = useState("HSR Layout Sector 4, Bengaluru");
  const [destination, setDestination] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [bookedTicket, setBookedTicket] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);

  const available = ambulances.filter((a) => a.status === "available");

  const handleBook = () => {
    if (!selected) return;
    playSuccessChime();
    const ticket = bookAmbulance(selected, pickup, destination || "Nearest Trauma Center (Fortis Hospital)");
    setBookedTicket(ticket);
    setTracking(true);
  };

  const selectUnit = (id: string) => {
    playDigitalBeep();
    setSelected(id);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-red-600 selection:text-white transition-colors duration-300">
      <SiteHeader />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Sleek Minimal Command Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-black text-zinc-500 hover:text-red-500 transition mb-2 uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={10} /> Exit To Dashboard
            </Link>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              AMBULANCE DISPATCH GATEWAY
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">Mobilize nearest high-capacity Advanced Life Support (ALS) emergency fleets with encrypted GPS handshakes.</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/30 px-3.5 py-2 rounded-xl shadow-sm">
            <Activity size={12} className="text-red-500 animate-pulse" />
            <span>SIREN-BYPASS CHANNEL ACTIVE</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!bookedTicket ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Route Input Module */}
              <div className="grid gap-4 sm:grid-cols-2 bg-white dark:bg-zinc-900/10 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin size={11} className="text-red-500" /> GPS Pickup Coordinates
                  </label>
                  <input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 text-xs outline-none focus:border-red-500/40 text-zinc-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Navigation size={11} className="text-emerald-500" /> Admittance Destination Trauma Center
                  </label>
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Fortis Emergency Hospital (Nearest)"
                    className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 text-xs outline-none focus:border-red-500/40 text-zinc-900 dark:text-white font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                </div>
              </div>

              {/* Units Panel */}
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-1.5">
                  <Ambulance size={13} className="text-red-500" /> Available Regional Units Nearby ({available.length})
                </p>
                {available.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-850 p-8 text-center text-xs text-zinc-500">
                    All emergency fleet responders are currently on critical transit missions in this sector.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {available.map((a) => {
                      const isSelected = selected === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => selectUnit(a.id)}
                          className={`group relative rounded-2xl border p-5 text-left transition-all shadow-sm ${
                            isSelected
                              ? "border-red-500/40 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 ring-2 ring-red-500/20"
                              : "border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/30"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-900 pb-3 mb-3">
                            <div>
                              <h3 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">
                                Unit {a.unit}
                              </h3>
                              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 font-mono">PLATE: {a.id}</span>
                            </div>
                            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                              Ready
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-bold flex items-center gap-1.5">
                              <Activity size={12} className="text-red-500 shrink-0" /> {a.type}
                            </p>
                            <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 leading-none">
                              <User size={12} className="text-zinc-400 dark:text-zinc-600 shrink-0" /> EMT Captain: {a.driver}
                            </p>
                          </div>

                          <div className="mt-4 flex gap-4 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono border-t border-zinc-150 dark:border-zinc-900 pt-3">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-zinc-400" /> {a.distance}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-zinc-800 dark:text-white">
                              <Clock size={11} className="text-red-500 animate-pulse" /> ETA {a.eta}
                            </span>
                          </div>

                          {/* Top-Right Tick indicators */}
                          {isSelected && (
                            <span className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white border border-red-500 shadow-md">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                disabled={!selected}
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-30 px-6 py-4 text-xs font-black text-white shadow-lg shadow-red-600/15 transition tracking-wider uppercase"
              >
                Confirm Emergency Fleet Booking
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="booking-success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Dispatch Ticket resembling ticket invoice */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-zinc-100 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 text-center relative overflow-hidden shadow-lg border-zinc-200/50 dark:border-zinc-800/50">
                <div className="absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-zinc-50 dark:bg-zinc-950 border-r border-emerald-500/20 -translate-y-1/2" />
                <div className="absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-zinc-50 dark:bg-zinc-950 border-l border-emerald-500/20 -translate-y-1/2" />
                
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <CheckCircle size={30} className="animate-pulse" />
                </div>
                <h3 className="mt-4 text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Fleet Booking Confirmed</h3>
                <p className="mt-2 font-mono text-2xl font-black text-zinc-900 dark:text-white tracking-widest">{bookedTicket}</p>
                <p className="mt-3 text-xs text-zinc-550 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Unit <span className="font-bold text-zinc-900 dark:text-white">{selected}</span> has been mobilized and dispatched to <span className="font-bold text-zinc-900 dark:text-white">{pickup}</span> under siren authorization bypass.
                </p>
              </div>

              {tracking && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/10 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-900 pb-4 mb-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-500">
                      <Navigation size={15} className="animate-pulse" />
                      Live Fleet Dispatch Telemetry Tracker
                    </div>
                    <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 uppercase animate-pulse">SIREN LIVE</span>
                  </div>

                  <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 pl-6 space-y-6">
                    {[
                      { label: "ALS Crew assigned and pre-briefed", time: "Just now", done: true, desc: "EMT pre-stabilisation diagnostics active" },
                      { label: "En route to GPS coordinates", time: "ETA 6 min", done: true, desc: "Siren clear channel established with Google Maps API override" },
                      { label: "Patient pickup complete", time: "Pending", done: false, desc: "GPS handshake verification at target" },
                      { label: "Admitted at trauma center", time: "Pending", done: false, desc: "Priority ICU admittance bed allocated" },
                    ].map((s, i) => (
                      <div key={s.label} className="relative text-xs">
                        {/* Circle indicator on line */}
                        <span className={`absolute -left-[35px] flex h-5 w-5 items-center justify-center rounded-full border ${
                          s.done
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500"
                        }`}>
                          {s.done ? <Check size={11} strokeWidth={3} /> : <span className="text-[8px] font-black">{i + 1}</span>}
                        </span>
                        
                        <div className="flex items-center justify-between gap-4">
                          <span className={`font-black uppercase tracking-wider ${s.done ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"}`}>
                            {s.label}
                          </span>
                          <span className={`text-[10px] font-mono ${s.done ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-450 dark:text-zinc-650"}`}>
                            {s.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setBookedTicket(null);
                  setSelected(null);
                  setTracking(false);
                }}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 py-3 text-xs font-black transition tracking-wider uppercase shadow-sm"
              >
                Book Another Ambulance Unit
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SiteFooter />
    </main>
  );
}
