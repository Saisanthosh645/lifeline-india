"use client";

import { useState } from "react";
import { 
  Hospital, Search, MapPin, Phone, Calendar, X, CheckCircle, 
  Clock, Building2, Star, ShieldAlert, Sparkles, Navigation,
  AlertTriangle, BedDouble, ChevronRight, Activity, ArrowLeft
} from "lucide-react";
import { AuthModal } from "@/components/shared/auth-modal";
import { SiteHeader, SiteFooter } from "@/components/shared/site-chrome";
import { useLifeline } from "@/lib/state-engine";
import { playDigitalBeep, playSuccessChime } from "@/lib/audio-tones";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function HospitalsPage() {
  const { hospitals, bookHospitalSlot, activeHospitalBooking, clearHospitalBooking, currentUser } = useLifeline();
  const [searchQuery, setSearchQuery] = useState("");
  const [directoryType, setDirectoryType] = useState<"all" | "hospitals" | "clinics">("all");
  const [selected, setSelected] = useState<any>(null);
  const [symptom, setSymptom] = useState("");
  const [urgency, setUrgency] = useState("emergency");
  const [ticket, setTicket] = useState<string | null>(null);

  // Auth gate state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const filtered = hospitals.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = directoryType === "all" || h.type === directoryType;
    return matchSearch && matchType;
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    playSuccessChime();
    const ticketId = bookHospitalSlot(selected.id, symptom, urgency);
    setTicket(ticketId);
  };

  const handleSelectHospital = (h: any) => {
    playDigitalBeep();
    if (!currentUser || !currentUser.isLoggedIn) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    setSelected(h);
    setTicket(null);
  };

  const handleSelectType = (type: "all" | "hospitals" | "clinics") => {
    playDigitalBeep();
    setDirectoryType(type);
  };

  return (
    <main className="min-h-screen selection:bg-red-600 selection:text-white">
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
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              ICU TRIAGE & ADMISSIONS
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Live trauma hubs and clinics monitoring ICU beds and coordinating real-time queue bypass routing.</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 px-3.5 py-2 rounded-xl shadow-sm dark:shadow-none">
            <Activity size={12} className="text-emerald-500" />
            <span>HEURISTICS FILTER ACTIVE</span>
          </div>
        </div>

        {/* Active Booking Banner Styled like a real Boarding Ticket */}
        <AnimatePresence>
          {activeHospitalBooking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mb-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 flex flex-col md:flex-row justify-between items-stretch gap-6 relative overflow-hidden"
            >
              {/* Ticket Left & Right punch design decorations */}
              <div className="absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-zinc-950 border-r border-emerald-500/20 -translate-y-1/2" />
              <div className="absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-zinc-950 border-l border-emerald-500/20 -translate-y-1/2" />
              
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center flex-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle size={24} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Admittance Ticket Confirmed</span>
                    <span className="text-zinc-500 text-[10px] font-mono">CODE: ER-{activeHospitalBooking.ticketId}</span>
                  </div>
                  <h3 className="text-sm font-black text-white">Emergency Room slot held for immediate triage.</h3>
                  <p className="text-[11px] text-zinc-400">
                    Symptom Profile: &quot;{activeHospitalBooking.symptom}&quot; · Estimated Queue Wait: <span className="text-white font-bold">{activeHospitalBooking.queueEta} mins</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={clearHospitalBooking}
                  className="w-full md:w-auto rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-950/10 hover:bg-red-950/20 px-5 py-3 text-xs font-black text-red-400 transition"
                >
                  Cancel Ticket & Release Bed
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Directory Search & Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by facility name, trauma levels, cardiac bypass..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 py-3.5 pl-11 pr-4 text-xs outline-none font-bold transition focus:border-zinc-350 dark:focus:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 shadow-sm dark:shadow-none"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {(["all", "hospitals", "clinics"] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleSelectType(t)}
                className={`rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                  directoryType === t
                    ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-white font-black shadow-md"
                    : "border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {t === "all" ? "All Facilities" : t === "hospitals" ? "Trauma Hospitals" : "Urgent Clinics"}
              </button>
            ))}
          </div>
        </div>

        {/* Hospital Cards Grid - Compact, Uber / Apple Maps Dashboard style */}
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((h, index) => (
            <motion.article
              key={h.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/10 p-5 hover:bg-white dark:hover:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm dark:shadow-none"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      <Sparkles size={10} /> {h.tag}
                    </span>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                      {h.name}
                    </h3>
                    <p className="text-[10px] text-zinc-550 dark:text-zinc-500 flex items-center gap-1 leading-none font-medium">
                      <MapPin size={11} className="text-zinc-400 shrink-0" /> {h.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 border border-amber-500/15 px-2 py-1 rounded-lg text-[10px] font-mono font-black text-amber-600 dark:text-amber-500">
                    <Star size={11} fill="currentColor" /> {h.rating}
                  </div>
                </div>

                {/* Beds & Distance Status row */}
                <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 p-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Proximity</p>
                    <p className="mt-1 text-[11px] font-black flex items-center gap-1 text-zinc-900 dark:text-white">
                      <Navigation size={10} className="text-emerald-500 animate-pulse" /> {h.distance}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">ICU Beds</p>
                    <p className="mt-1 text-[11px] font-black flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <BedDouble size={10} className="text-emerald-550 dark:text-emerald-400" /> {h.beds}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">ER Wait Time</p>
                    <p className="mt-1 text-[11px] font-black flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                      <Clock size={10} className="text-zinc-400 dark:text-zinc-500" /> {h.erWait}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2 pt-4 border-t border-zinc-150 dark:border-zinc-900">
                <a
                  href={`tel:${h.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/20 text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition shadow-sm dark:shadow-none"
                  title="Call Trauma Desk"
                >
                  <Phone size={13} />
                </a>
                <button
                  onClick={() => handleSelectHospital(h)}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-black text-white transition tracking-wide flex items-center justify-center gap-1.5"
                >
                  Book Priority Bed <ChevronRight size={14} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-800">
            <Building2 size={36} className="mx-auto text-zinc-600 animate-pulse" />
            <p className="mt-3 text-sm font-black">No Registered Medical Stations Found</p>
            <p className="text-xs text-zinc-500 mt-1">Try tweaking your search keywords or checking other filters.</p>
          </div>
        )}

      </div>

      <SiteFooter />

      {/* Booking Form Overlay Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-emerald-500" />
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">Priority Triage Slip</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition"
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
                    <p className="text-sm font-black text-zinc-900 dark:text-white">Bed Registration Secured!</p>
                    <p className="text-xs text-zinc-550 dark:text-zinc-400">Please present this secure barcode ticket at the ER triage counter.</p>
                  </div>
                  <div className="rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-4 relative overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Secure Crypt-Token</p>
                    <p className="font-mono text-2xl font-black text-zinc-900 dark:text-white mt-1.5 tracking-wider">{ticket}</p>
                    
                    {/* Simulated visual barcode stripes */}
                    <div className="flex justify-center gap-0.5 h-6 opacity-30 mt-3">
                      <div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-2 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-1.5 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" /><div className="w-1 bg-zinc-900 dark:bg-white" /><div className="w-0.5 bg-zinc-900 dark:bg-white" />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-black text-white transition"
                  >
                    Close & Track Progress
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBook} className="mt-6 space-y-4">
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-150 dark:border-zinc-900">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Destination Unit</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white mt-1 leading-none">{selected.name}</p>
                    <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-1.5">{selected.address}</p>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-bold">
                      <AlertTriangle size={11} className="text-amber-500" /> Patient Symptoms / Trauma Detail
                    </label>
                    <textarea
                      value={symptom}
                      onChange={(e) => setSymptom(e.target.value)}
                      required
                      rows={3}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-emerald-550 dark:focus:border-emerald-500/40 text-zinc-900 dark:text-white font-semibold placeholder-zinc-400 dark:placeholder-zinc-600"
                      placeholder="e.g. Sharp radiating chest pain, breathing struggles, accident trauma..."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400 font-bold">Emergency Priority Tier</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-emerald-550 dark:focus:border-emerald-500/40 text-zinc-900 dark:text-white font-black"
                    >
                      <option value="emergency">Critical - Immediate ICU/Bed (Siren Cleared)</option>
                      <option value="urgent">Urgent - Acute Medical Triage (Under 30m)</option>
                      <option value="routine">Elective - Specialist Consultation / OPD</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-600/10 transition"
                  >
                    <Calendar size={13} /> Confirm Bed Reservation
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
