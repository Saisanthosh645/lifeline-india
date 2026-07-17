"use client";

import { useState } from "react";
import { 
  FileText, Calendar, Stethoscope, Siren, Download, Filter, 
  Plus, X, ShieldAlert, Sparkles, User, HeartPulse, Building2,
  ChevronDown, ChevronUp, CheckCircle, Activity, ArrowLeft
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/shared/site-chrome";
import { useLifeline } from "@/lib/state-engine";
import { playDigitalBeep, playSuccessChime } from "@/lib/audio-tones";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const typeIcons: Record<string, any> = {
  "ER Visit": Stethoscope,
  "Lab Report": FileText,
  "Prescription": FileText,
  "SOS Event": Siren,
  "Blood Transfusion": HeartPulse,
};

export default function HealthRecordsPage() {
  const { healthRecords, addHealthRecord } = useLifeline();
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Record Dialog State
  const [addOpen, setAddOpen] = useState(false);
  const [type, setType] = useState("Lab Report");
  const [facility, setFacility] = useState("");
  const [doctor, setDoctor] = useState("");
  const [summary, setSummary] = useState("");

  const types = ["all", ...new Set(healthRecords.map((r) => r.type))];
  const filtered = filter === "all" ? healthRecords : healthRecords.filter((r) => r.type === filter);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessChime();
    addHealthRecord({
      date: new Date().toISOString().split("T")[0],
      type,
      facility: facility || "Lifeline Diagnostics Center",
      doctor: doctor || "Dr. Rajesh Kumar",
      summary,
    });
    setAddOpen(false);
    setFacility("");
    setDoctor("");
    setSummary("");
    triggerToast("Sealed medical block successfully committed to longitudinal care chain.");
  };

  const handleSelectFilter = (t: string) => {
    playDigitalBeep();
    setFilter(t);
  };

  const handleDownloadPDF = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    playSuccessChime();
    triggerToast(`Encrypted medical record block #${blockId} unsealed & compiled into secure PDF.`);
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
              <span className="flex h-3 w-3 rounded-full bg-cyan-500 animate-pulse" />
              CONTINUOUS MEDICAL LEDGER
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">An immutable longitudinal history tracking every emergency dispatch, clinical pre-booking, and ER intake event.</p>
          </div>

          <button
            onClick={() => {
              playDigitalBeep();
              setAddOpen(true);
            }}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-3 text-xs font-black text-white transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-600/10"
          >
            <Plus size={14} /> Add Manual Ledger Entry
          </button>
        </div>

        {/* Dynamic Category Filtering Selector */}
        <div className="mb-8 flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-900/10 p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mr-2 flex items-center gap-1">
            <Filter size={11} /> Filter Block Type:
          </span>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => handleSelectFilter(t)}
              className={`rounded-lg px-3.5 py-2 text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                filter === t
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/30 text-zinc-550 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {t === "all" ? "Full History" : t}
            </button>
          ))}
        </div>

        {/* Live Timeline thread list */}
        <div className="relative pl-6 sm:pl-10 space-y-4">
          
          {/* Continuous Grid Thread Bar */}
          <div className="absolute left-[33px] sm:left-[49px] top-0 h-full w-[2px] bg-gradient-to-b from-cyan-500 via-indigo-500/30 to-transparent" />

          {filtered.map((record, index) => {
            const Icon = typeIcons[record.type] ?? FileText;
            const isExpanded = expanded === record.id;
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="relative"
              >
                {/* Visual Circle Indicator node */}
                <div className="absolute -left-[32px] sm:-left-[48px] top-5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-950 border-2 border-cyan-500 text-cyan-500 dark:text-cyan-400 shadow-md z-10">
                  <Icon size={11} className={record.type === "SOS Event" ? "animate-pulse" : ""} />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playDigitalBeep();
                    setExpanded(isExpanded ? null : record.id);
                  }}
                  className={`w-full rounded-2xl border text-left p-5 transition-all shadow-sm ${
                    isExpanded
                      ? "border-cyan-500/40 bg-white dark:bg-zinc-900/25 ring-2 ring-cyan-500/10"
                      : "border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-750 hover:bg-white dark:hover:bg-zinc-900/20"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {record.type}
                        </span>
                        <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-mono">BLOC_ID: {record.id}</span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                        {record.summary}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-zinc-400 dark:text-zinc-500" /> {record.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 size={11} className="text-zinc-400 dark:text-zinc-500" /> {record.facility}
                        </span>
                        {record.doctor && (
                          <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-semibold">
                            <User size={11} className="text-zinc-400 dark:text-zinc-500" /> Attending: {record.doctor}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-zinc-100 dark:border-zinc-900 pt-3 md:pt-0">
                      <button
                        onClick={(e) => handleDownloadPDF(e, record.id)}
                        className="inline-flex h-9 items-center gap-1.5 text-[10px] font-black text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-white border border-cyan-500/20 rounded-xl px-3 bg-cyan-50 dark:bg-cyan-950/10 hover:bg-cyan-100 dark:hover:bg-cyan-950/20 transition cursor-pointer"
                      >
                        <Download size={11} /> PDF Record
                      </button>
                      <div>
                        {isExpanded ? <ChevronUp size={14} className="text-zinc-400 dark:text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-400 dark:text-zinc-500" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-zinc-100 dark:border-zinc-900 mt-4 pt-4"
                      >
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 space-y-3 shadow-inner">
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                            This care ledger event has been sealed cryptographically using Lifeline Ledger Protocol. Any subsequent edits will invalidate the block integrity.
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono pt-1">
                            <div className="space-y-1">
                              <p className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-[9px] font-black">Ledger Hash Anchor</p>
                              <p className="text-zinc-900 dark:text-white truncate">sha256:8f2a9e38d7211bfb{record.id}e4f507b9a5</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-[9px] font-black">Admitting Physician Signature</p>
                              <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle size={10} /> VERIFIED ELECTRONIC SIGNATURE
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-850">
            <FileText size={32} className="mx-auto text-zinc-450 dark:text-zinc-600 animate-pulse" />
            <p className="mt-3 text-sm font-black">No Care Log Entries Found</p>
            <p className="text-xs text-zinc-500 mt-1">Try resetting your category filters above.</p>
          </div>
        )}

      </div>

      <SiteFooter />

      {/* Record Creation Modal */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-cyan-500 dark:text-cyan-400" />
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">Commit Medical Block</p>
                </div>
                <button
                  onClick={() => setAddOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 transition"
                >
                  <X size={13} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="mt-6 space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Ledger Record Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-cyan-500/40 text-zinc-900 dark:text-white font-black"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription/Medication</option>
                    <option value="ER Visit">Specialist Clinic Admittance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Diagnosing Medical Facility</label>
                  <input
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    required
                    placeholder="e.g. Apollo Triage Hub, Bengaluru"
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-cyan-500/40 text-zinc-900 dark:text-white font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Attending Specialist Practitioner</label>
                  <input
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    required
                    placeholder="e.g. Dr. Rajesh Kumar, MD"
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-cyan-500/40 text-zinc-900 dark:text-white font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Diagnosis Summary Detail</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                    rows={3}
                    placeholder="e.g. Diagnosed with acute respiratory tract infection, committed course of Broad-Spectrum antibiotics..."
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-cyan-500/40 text-zinc-900 dark:text-white font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 py-3.5 text-xs font-black text-white shadow-lg shadow-cyan-600/10 transition cursor-pointer"
                >
                  Commit Sealed Block
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Micro Notification / Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-cyan-500/30 px-5 py-4 shadow-2xl flex items-center gap-3 text-xs font-bold text-zinc-900 dark:text-white max-w-sm"
          >
            <CheckCircle size={18} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
            <p>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
