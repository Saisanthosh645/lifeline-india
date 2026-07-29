"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Siren, ShieldAlert, Bell, ChevronDown, Activity, Phone, 
  MapPin, Compass, Droplet, ClipboardList, Settings
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

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [activeMapTab, setActiveMapTab] = useState("All");
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const navItems = [
    { label: "Dashboard", icon: Activity, href: "/" },
    { label: "Emergency SOS", icon: Siren, href: "/sos" },
    { label: "Live Map", icon: MapPin, href: "/" },
    { label: "Hospitals", icon: Compass, href: "/hospitals" },
    { label: "Ambulances", icon: Activity, href: "/ambulance" },
    { label: "Blood Banks", icon: Droplet, href: "/blood-banks" },
    { label: "Blood Matcher", icon: Droplet, href: "/blood-banks" },
    { label: "Care Records", icon: ClipboardList, href: "/health-records" },
    { label: "Helplines", icon: Phone, href: "/" },
    { label: "Reports", icon: ShieldAlert, href: "/" },
    { label: "Settings", icon: Settings, href: "/" },
  ];

  const topMetrics = [
    { label: "Incidents", value: "12", suffix: "Active", accent: "text-red-500" },
    { label: "Ambulances", value: "15", suffix: "On Duty", accent: "text-emerald-400" },
    { label: "Hospitals", value: "42", suffix: "Available", accent: "text-cyan-400" },
    { label: "Blood Banks", value: "18", suffix: "Open", accent: "text-red-400" },
  ];

  const serviceCards = [
    { title: "Hospital ICU Beds", subtitle: "Real-time ICU bed availability across hospitals", label: "LIVE BEDS", icon: Compass },
    { title: "Blood Matcher", subtitle: "Find matching donors and request blood", label: "MATCH", icon: Droplet },
    { title: "Ambulance Fleet", subtitle: "Track ambulances and estimated arrival", label: "TRACK", icon: Activity },
    { title: "Care Records", subtitle: "Securely store and access medical documents", label: "SECURE", icon: ClipboardList },
  ];

  const emergencyLines = [
    { title: "National Emergency", number: "112", detail: "All India Emergency Number" },
    { title: "Ambulance Service", number: "108", detail: "Medical Emergency Services" },
    { title: "Women Helpline", number: "1091", detail: "Women Safety & Support" },
    { title: "Fire Services", number: "101", detail: "Fire & Rescue Services" },
    { title: "Child Helpline", number: "1098", detail: "Child Care & Protection" },
    { title: "Disaster Management", number: "1070", detail: "Disaster Relief & Support" },
  ];

  const operationalOverview = [
    { value: "42", label: "Trauma Units" },
    { value: "87", label: "Ambulances Deployed" },
    { value: "640", label: "Districts Covered" },
    { value: "23", label: "Active Calls" },
  ];

  const recentIncidents = [
    { time: "10:24 AM", location: "Koramangala, Bangalore", type: "Medical Emergency", status: "Responding", eta: "4 mins" },
    { time: "10:18 AM", location: "Whitefield, Bangalore", type: "Accident", status: "On Site", eta: "--" },
    { time: "10:12 AM", location: "Yelahanka, Bangalore", type: "Cardiac Arrest", status: "Responding", eta: "6 mins" },
    { time: "10:05 AM", location: "HSR Layout, Bangalore", type: "Medical Emergency", status: "Completed", eta: "--" },
    { time: "09:58 AM", location: "Electronic City, Bangalore", type: "Accident", status: "On Site", eta: "--" },
  ];

  const mapTabs = ["All", "Hospitals", "Ambulances", "Blood Banks", "Incidents"];

  const announcements = [
    { title: "Heatwave Alert Issued", time: "2 hours ago", desc: "Stay hydrated and avoid direct sunlight." },
    { title: "Blood Donation Camp", time: "4 hours ago", desc: "Koramangala Stadium, 15th June." },
    { title: "System Maintenance", time: "1 day ago", desc: "Scheduled maintenance on 20th June, 2 AM - 4 AM." },
  ];

  const handleRestrictedAction = (targetUrl: string) => {
    if (currentUser && currentUser.isLoggedIn) {
      window.location.href = targetUrl;
    } else {
      setAuthMode("signup");
      setAuthOpen(true);
    }
  };

  const startHolding = (e: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
    if (e instanceof KeyboardEvent && e.code !== "Space") {
      return;
    }
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isHolding && activeSos.status !== "active") {
        startHolding(event);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space" && isHolding) {
        stopHolding();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHolding, activeSos.status]);

  return (
    <main className="min-h-screen selection:bg-red-600 selection:text-white bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.16),_transparent_28%),radial-gradient(circle_at_78%_6%,rgba(14,165,233,0.12),transparent_17%),linear-gradient(180deg,#020617_0%,#09090b_100%)] text-white">
      <SiteHeader />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

          <aside className="hidden lg:flex flex-col gap-5 rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400">Lifeline India</p>
                <h2 className="mt-2 text-lg font-black tracking-tight text-white">National Emergency Network</h2>
              </div>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-zinc-200 hover:bg-white/10 transition">
                <Bell size={18} />
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-emerald-300 font-black mb-4">
                <span>Network</span>
                <span>ONLINE</span>
              </div>
              <div className="space-y-2 text-[11px] text-zinc-400">
                <p><span className="text-white font-semibold">Signal:</span> 98.7% uptime</p>
                <p><span className="text-white font-semibold">Region:</span> Bangalore, Karnataka</p>
                <p><span className="text-white font-semibold">Last updated:</span> Just now</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/" && item.label === "Dashboard";
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-red-600/15 text-white border border-red-500/20" : "border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-red-400 group-hover:bg-red-500/10">
                      <Icon size={18} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-3">Quick Call</p>
              <div className="rounded-3xl bg-red-600/10 p-4 text-center">
                <p className="text-3xl font-black text-white">112</p>
                <p className="mt-2 text-xs text-zinc-400">Emergency Number</p>
              </div>
              <button
                onClick={() => window.location.href = "tel:112"}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                <Phone size={14} /> Call Now
              </button>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/30 p-3 lg:hidden">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-zinc-400 font-black">
                <span>Quick navigation</span>
                <span>Swipe</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {navItems.slice(0, 7).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="inline-flex flex-none items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-red-500 hover:text-white"
                    >
                      <Icon size={14} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">Network Status</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Emergency Response Dashboard</h1>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                    <MapPin size={14} className="text-red-400" />
                    Bangalore, Karnataka
                    <ChevronDown size={14} className="text-zinc-400" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {topMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">{metric.label}</p>
                      <p className={`mt-4 text-3xl font-black ${metric.accent}`}>{metric.value}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-400">{metric.suffix}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Critical Incident</p>
                    <h2 className="mt-2 text-xl font-black text-white">Response Time</h2>
                  </div>
                  <span className="rounded-full bg-red-600/15 px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-red-300">Live</span>
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-5xl font-black text-white">6.2 mins</p>
                    <p className="mt-2 text-sm text-zinc-400">Average dispatch time</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4 text-center">
                    <p className="text-sm font-black text-zinc-100">Network Uptime</p>
                    <p className="mt-2 text-3xl font-black text-emerald-400">99.98%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-red-300">
                      <ShieldAlert size={12} className="text-red-300" /> Emergency Console
                    </div>
                    <h2 className="mt-4 text-4xl font-black tracking-tight text-white">EMERGENCY?<br /> Press & Hold SOS</h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Instantly alert nearby hospitals, ambulance fleets, and emergency responders. Your location will be shared with emergency services immediately.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.35em] text-zinc-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" /> Active Mesh
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <div className="relative">
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

                    <button
                      onMouseDown={startHolding}
                      onMouseUp={stopHolding}
                      onMouseLeave={stopHolding}
                      onTouchStart={startHolding}
                      onTouchEnd={stopHolding}
                      className="relative flex h-52 w-52 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white shadow-[0_0_80px_rgba(220,38,38,0.35)] hover:shadow-[0_0_120px_rgba(220,38,38,0.5)] active:scale-95 transition-all cursor-pointer border border-red-400/30"
                      style={{ touchAction: "none" }}
                    >
                      <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none">
                        <circle cx="104" cy="104" r="98" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" />
                        <circle cx="104" cy="104" r="98" stroke="white" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 98} strokeDashoffset={2 * Math.PI * 98 * (1 - holdProgress / 100)} strokeLinecap="round" />
                      </svg>

                      <div className="relative z-10 text-center space-y-2 pointer-events-none">
                        <Siren size={44} className="mx-auto text-white animate-bounce" />
                        <p className="text-3xl font-black uppercase tracking-tighter">SOS</p>
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-red-200">
                          {isHolding ? `HOLDING… ${Math.ceil((3000 - (holdProgress / 100) * 3000) / 1000)}s` : "HOLD FOR 3 SECONDS"}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                  Your location will be shared with emergency services immediately.
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Live Incident Map</p>
                    <h2 className="mt-2 text-xl font-black text-white">View full map</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-zinc-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> Live
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 mb-4">
                  {mapTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMapTab(tab)}
                      className={`rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.35em] transition ${activeMapTab === tab ? "border-red-500 bg-red-500/15 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:border-red-500 hover:text-white"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <InteractiveMap activeTab={activeMapTab} />

                <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Active Map Filter</p>
                      <p className="mt-1 text-sm font-black uppercase tracking-[0.35em] text-white">{activeMapTab}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-zinc-300">Map state</span>
                  </div>
                  <div className="grid gap-3">
                    {recentIncidents.slice(0, 3).map((incident) => (
                      <div key={`${incident.time}-${incident.location}`} className="rounded-3xl border border-white/10 bg-black/40 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-black text-white">{incident.location}</p>
                            <p className="text-xs text-zinc-500">{incident.type}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-zinc-400">
                            <span>{incident.time}</span>
                            <span className="rounded-full bg-red-500/10 px-2 py-1 text-red-300">{incident.status}</span>
                            <span>ETA {incident.eta}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Response Time (Avg)</p>
                    <p className="mt-3 text-2xl font-black text-white">6.2 mins</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Emergency Units</p>
                    <p className="mt-3 text-2xl font-black text-emerald-400">87 Active</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Network Uptime</p>
                    <p className="mt-3 text-2xl font-black text-cyan-400">99.98%</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {serviceCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.title}
                        onClick={() => handleRestrictedAction(card.label === "SECURE" ? "/health-records" : card.title === "Ambulance Fleet" ? "/ambulance" : card.title === "Blood Matcher" ? "/blood-banks" : "/hospitals")}
                        className="group rounded-3xl border border-white/10 bg-black/30 p-5 text-left transition hover:border-red-500/40 hover:bg-white/5"
                      >
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-red-300 mb-4">
                          <Icon size={20} />
                        </div>
                        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{card.label}</p>
                        <h3 className="mt-3 text-lg font-black text-white">{card.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{card.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
              <div className="grid gap-6">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Official Emergency Helplines</p>
                    <Link href="/" className="text-xs font-black uppercase tracking-[0.35em] text-red-400 hover:text-red-200">View All</Link>
                  </div>
                  <div className="grid gap-3">
                    {emergencyLines.map((line) => (
                      <div key={line.number} className="rounded-3xl border border-white/10 bg-black/30 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-black text-white">{line.title}</p>
                            <p className="mt-1 text-xs text-zinc-500">{line.detail}</p>
                          </div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-600/10 px-3 py-2 text-sm font-black text-red-300">{line.number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Important Announcements</p>
                    <Link href="/" className="text-xs font-black uppercase tracking-[0.35em] text-red-400 hover:text-red-200">View All</Link>
                  </div>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.title} className="rounded-3xl border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-black text-white">{announcement.title}</p>
                          <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">{announcement.time}</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">{announcement.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Operational Overview</p>
                    <h2 className="mt-2 text-xl font-black text-white">System Health</h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-red-600/15 px-3 py-1 text-xs font-black uppercase tracking-[0.35em] text-red-300">93%</div>
                </div>
                <div className="relative overflow-hidden rounded-[2rem] bg-white/5 p-5">
                  <div className="h-56 rounded-full bg-white/5 p-6">
                    <div className="relative h-full w-full">
                      <div className="absolute inset-0 rounded-full border border-white/10"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-5xl font-black text-white">93%</p>
                          <p className="mt-2 text-sm text-zinc-400">System Uptime</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3">
                    {operationalOverview.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                        <span>{item.label}</span>
                        <span className="font-black text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </main>
  );
}
