"use client";

import { useState } from "react";
import { 
  Droplet, MapPin, Phone, X, CheckCircle, Truck, Heart, 
  ArrowRight, ShieldAlert, Sparkles, Navigation, AlertCircle, ArrowLeft
} from "lucide-react";
import { AuthModal } from "@/components/shared/auth-modal";
import { SiteHeader, SiteFooter } from "@/components/shared/site-chrome";
import { useLifeline } from "@/lib/state-engine";
import { playDigitalBeep, playSuccessChime } from "@/lib/audio-tones";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function BloodBanksPage() {
  const { bloodBanks, reserveBlood, activeBloodReservation, clearBloodReservation, currentUser } = useLifeline();
  const [selectedGroup, setSelectedGroup] = useState<string>("O-");
  const [reserving, setReserving] = useState<any>(null);
  const [patientName, setPatientName] = useState("");
  const [reqHospital, setReqHospital] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);

  // Auth gate state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserving) return;
    playSuccessChime();
    const ticketId = reserveBlood(reserving.id, selectedGroup, patientName, reqHospital);
    setTicket(ticketId);
  };

  const selectGroup = (group: string) => {
    playDigitalBeep();
    setSelectedGroup(group);
  };

  const handleOpenReserve = (bank: any) => {
    playDigitalBeep();
    if (!currentUser || !currentUser.isLoggedIn) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    setReserving(bank);
    setTicket(null);
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
              NATIONAL BLOOD ALLOCATION
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cross-correlating real-time blood bank inventory with secure cold-chain logistics in transit.</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/30 px-3.5 py-2 rounded-xl shadow-sm">
            <Truck size={12} className="text-red-500" />
            <span>COLD-CHAIN SECURED</span>
          </div>
        </div>

        {/* Active Courier Delivery Banner Styled like a real tracking pass */}
        <AnimatePresence>
          {activeBloodReservation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mb-8 rounded-2xl border border-red-500/30 bg-gradient-to-r from-zinc-100 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 flex flex-col md:flex-row justify-between items-stretch gap-6 relative overflow-hidden shadow-lg border-zinc-200/50 dark:border-zinc-800/50"
            >
              <div className="absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-zinc-50 dark:bg-zinc-950 border-r border-red-500/20 -translate-y-1/2" />
              <div className="absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-zinc-50 dark:bg-zinc-950 border-l border-red-500/20 -translate-y-1/2" />

              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center flex-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-500 border border-red-500/25">
                  <Truck size={24} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Active Express Courier</span>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-mono">CODE: BLD-{activeBloodReservation.ticketId}</span>
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">Cold-Chain logistics in progress.</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Recipient: <span className="text-zinc-900 dark:text-white font-bold">{activeBloodReservation.patientName}</span> · Hospital: <span className="text-zinc-900 dark:text-white font-bold">{activeBloodReservation.hospitalName}</span> · Courier Transit Status: <span className="text-red-600 dark:text-red-400 font-bold uppercase">{activeBloodReservation.status}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800/80 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={clearBloodReservation}
                  className="w-full md:w-auto rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-5 py-3 text-xs font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition"
                >
                  Dismiss Ticket
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select Blood Group Panel */}
        <div className="mb-8 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-555 dark:text-zinc-500 mb-4 flex items-center gap-2">
            <Heart size={12} className="text-red-500 animate-pulse" /> Filter Real-time Inventory By Blood Group
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {bloodGroups.map((g) => (
              <button
                key={g}
                onClick={() => selectGroup(g)}
                className={`rounded-xl py-3 text-xs font-black transition-all border ${
                  selectedGroup === g
                    ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/25 scale-102"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List - compact, Uber-style cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {bloodBanks.map((bank) => {
            const stock = bank.stock[selectedGroup] ?? 0;
            const available = stock > 0;
            return (
              <motion.article
                key={bank.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/10 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">{bank.name}</h3>
                      <p className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                        <MapPin size={12} className="text-zinc-400 dark:text-zinc-500 shrink-0" /> {bank.address}
                      </p>
                    </div>
                    <span className="rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 px-3 py-1.5 text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                      {bank.distance}
                    </span>
                  </div>

                  {/* Units visual display styled like inventory tubes */}
                  <div className="mt-5 flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-900">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Available Reserve Units ({selectedGroup})</p>
                      <p className={`mt-1 text-2xl font-black tracking-tight ${available ? "text-red-500" : "text-zinc-400 dark:text-zinc-600"}`}>
                        {stock} Bags
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${available ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        {available ? "Verified Stock" : "Depleted"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex gap-2 pt-4 border-t border-zinc-150 dark:border-zinc-900">
                  <a
                    href={`tel:${bank.phone.replace(/\s/g, "")}`}
                    className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                    title="Call Blood Registry Desk"
                  >
                    <Phone size={13} />
                  </a>
                  <button
                    disabled={!available}
                    onClick={() => handleOpenReserve(bank)}
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:hover:bg-red-600 px-4 py-2.5 text-xs font-black text-white transition shadow-lg shadow-red-600/10 flex items-center justify-center gap-1"
                  >
                    Reserve Unit Bags <ArrowRight size={13} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {bloodBanks.length === 0 && (
          <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-850">
            <Droplet size={36} className="mx-auto text-zinc-400 dark:text-zinc-600 animate-pulse" />
            <p className="mt-3 text-sm font-black">No Registered Blood Registries Found</p>
            <p className="text-xs text-zinc-500 mt-1">Check database sync values or network node configurations.</p>
          </div>
        )}

      </div>

      <SiteFooter />

      {/* Reservation Form Modal */}
      <AnimatePresence>
        {reserving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <Droplet size={15} className="text-red-500 animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">Reserve {selectedGroup} Stock</p>
                </div>
                <button
                  onClick={() => setReserving(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 transition"
                >
                  <X size={13} />
                </button>
              </div>

              {ticket ? (
                <div className="mt-6 text-center space-y-5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle size={30} className="animate-bounce text-emerald-550 dark:text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-zinc-900 dark:text-white">Blood Stock Reserved & Locked!</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Courier coordinates have been geofenced and assigned.</p>
                  </div>
                  <div className="rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-4 relative overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-500 dark:text-red-400">Logistics Token</p>
                    <p className="font-mono text-2xl font-black text-zinc-900 dark:text-white mt-1.5 tracking-wider">{ticket}</p>
                    
                    {/* Simulated visual barcode stripes */}
                    <div className="flex justify-center gap-0.5 h-6 opacity-30 mt-3">
                      <div className="w-1.5 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-1.5 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-2 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-1.5 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" />
                    </div>
                  </div>
                  <button
                    onClick={() => setReserving(null)}
                    className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-3.5 text-xs font-black text-white transition"
                  >
                    Close & Track Progress
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReserve} className="mt-6 space-y-4">
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-150 dark:border-zinc-900">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Registry Source</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white mt-1 leading-none">{reserving.name}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1.5">{reserving.address}</p>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <AlertCircle size={11} className="text-red-500" /> Recipient Patient Full Name
                    </label>
                    <input
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-red-500/40 text-zinc-900 dark:text-white font-semibold placeholder-zinc-400 dark:placeholder-zinc-600"
                      placeholder="e.g. Aditi Sharma"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Requesting Trauma Station / Hospital</label>
                    <input
                      value={reqHospital}
                      onChange={(e) => setReqHospital(e.target.value)}
                      required
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-red-500/40 text-zinc-900 dark:text-white font-semibold placeholder-zinc-400 dark:placeholder-zinc-600"
                      placeholder="e.g. Fortis Emergency Hospital"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 py-3.5 text-xs font-black text-white shadow-lg shadow-red-600/10 transition"
                  >
                    <Droplet size={13} className="fill-white animate-pulse" /> Confirm Reservation Ticket
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </main>
  );
}
