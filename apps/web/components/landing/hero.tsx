"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Ambulance, Siren, Search, HeartPulse, ShieldAlert, ArrowRight, Activity, Compass, Droplet } from "lucide-react";

type Props = {
  onRestrictedAction: () => void;
};

const stats = [
  { label: "Active Trauma Hospitals", value: "1,480+", icon: Compass, color: "text-emerald-500 bg-emerald-500/10" },
  { label: "Ambulance Average Response", value: "08 Min", icon: Ambulance, color: "text-red-500 bg-red-500/10" },
  { label: "Connected Blood Repositories", value: "920+", icon: Droplet, color: "text-rose-500 bg-rose-500/10" }
];

export function Hero({ onRestrictedAction }: Props) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-12">
      {/* Aurora visual glow background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] left-[20%] w-[600px] h-[600px] rounded-full bg-red-500/10 dark:bg-red-500/15 blur-[120px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-[130px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          {/* Left Hero Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/5 px-4 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-red-600 dark:text-red-400"
            >
              <ShieldAlert size={14} className="animate-pulse" />
              National Emergency Operating Mesh
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-black tracking-tight leading-[1.1] md:text-7xl">
                Emergency Help. <br />
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                  Instantly.
                </span>
              </h1>
              <p className="max-w-xl text-base md:text-lg text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
                Find hospitals. Request blood. Call ambulances. Share medical records. One tap can save lives. India&apos;s most advanced real-time emergency layer.
              </p>
            </motion.div>

            {/* Huge Pulse SOS CTA and Secondary Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
            >
              <Link href="/sos" className="relative group flex items-center justify-center">
                {/* Ripple glow backing rings */}
                <span className="absolute inset-0 rounded-2xl bg-red-600/30 blur-xl group-hover:bg-red-600/40 transition-all duration-500" />
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 20px rgba(239, 68, 68, 0.4)",
                      "0 0 40px rgba(239, 68, 68, 0.7)",
                      "0 0 20px rgba(239, 68, 68, 0.4)",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative z-10 w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-red-600 px-10 py-5 text-base font-black text-white shadow-lg transition-transform cursor-pointer"
                >
                  <Siren size={20} className="animate-spin-slow" />
                  🔴 EMERGENCY SOS
                </motion.div>
              </Link>

              <button
                onClick={onRestrictedAction}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/50 px-6 py-5 text-sm font-bold dark:border-slate-800 dark:bg-slate-900/40 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-slate-700 dark:text-slate-200"
              >
                Get Started <ArrowRight size={15} />
              </button>
            </motion.div>

            {/* Quick Directory actions inline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-400"
            >
              <span className="text-slate-500 dark:text-slate-400">Quick Access:</span>
              <Link href="/hospitals" className="hover:text-red-500 transition underline decoration-dotted">Find ER Beds</Link>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-800" />
              <Link href="/blood-banks" className="hover:text-red-500 transition underline decoration-dotted">Match Blood Stock</Link>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-800" />
              <Link href="/ambulance" className="hover:text-red-500 transition underline decoration-dotted">Book Fleet</Link>
            </motion.div>
          </div>

          {/* Right Hero Graphic: Live Interactive Map HUD element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[2.2rem] border border-white/20 bg-gradient-to-b from-slate-900/40 to-slate-950/70 p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800/65">
              <div className="absolute top-0 right-0 p-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-red-500 border border-red-500/20">
                  <Activity size={10} className="animate-pulse" /> Live Tracker
                </span>
              </div>

              {/* Floating notification element */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="flex items-center gap-3.5 rounded-2xl border border-red-500/20 bg-red-950/55 p-4 text-white shadow-xl max-w-sm mx-auto"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600">
                  <Ambulance size={18} className="animate-pulse text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Dispatched</p>
                  <p className="text-xs font-black truncate">Ambulance BLR-108 en-route</p>
                  <p className="text-[9px] text-slate-400">ETA: 4 Mins · HSR Sector 2</p>
                </div>
              </motion.div>

              {/* Glowing Stats Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 dark:bg-slate-950/40">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trauma Centers Active</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">42 Stations</p>
                  <p className="mt-1 text-[9px] text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Bed updates synced
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 dark:bg-slate-950/40">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Operational Lines</p>
                  <p className="mt-1 text-2xl font-black text-red-500">112 / 108</p>
                  <p className="mt-1 text-[9px] text-slate-400">Priority bypass active</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Row */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                className="relative flex items-center gap-4 rounded-[1.75rem] border border-slate-200/50 bg-white/40 p-5 dark:border-slate-800/50 dark:bg-slate-900/40 backdrop-blur-md shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="text-xl font-black">{item.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
