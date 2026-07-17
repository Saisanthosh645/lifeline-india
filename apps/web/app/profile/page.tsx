"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HeartPulse, Activity, Shield, Search, Building2, Droplet,
  Settings, User, Clock, MapPin, AlertCircle, Siren, Phone,
  ArrowRight, Lock, X, CheckCircle, Sparkles, RefreshCw,
  Volume2, VolumeX, Plus, FileText, Truck, AlertTriangle,
  ChevronRight, BadgeInfo, Download, ShieldCheck, Heart, Navigation
} from "lucide-react";
import { useLifeline } from "@/lib/state-engine";
import { InteractiveMap } from "@/components/shared/interactive-map";
import { playEmergencySiren, stopEmergencySiren, playSuccessChime, playDigitalBeep } from "@/lib/audio-tones";
import { demoLogout } from "@/lib/auth/demo-auth";
import { SiteHeader, SiteFooter } from "@/components/shared/site-chrome";

type Tab = "overview" | "sos" | "directory" | "blood" | "timeline" | "settings";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const {
    hospitals,
    bloodBanks,
    ambulances,
    healthRecords,
    activeSos,
    activeBloodReservation,
    activeHospitalBooking,
    currentUser,
    simulationMode,
    logout,
    updateProfile,
    triggerSos,
    cancelSos,
    resolveSos,
    reserveBlood,
    clearBloodReservation,
    bookHospitalSlot,
    clearHospitalBooking,
    addHealthRecord,
    setSimulation,
    resetDatabase,
  } = useLifeline();

  // Profile forms state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Directory filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [directoryType, setDirectoryType] = useState<"all" | "hospitals" | "clinics">("all");
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [bookingSymptom, setBookingSymptom] = useState("");
  const [bookingUrgency, setBookingUrgency] = useState("emergency");

  // Blood bank state
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("O-");
  const [reservingBlood, setReservingBlood] = useState<any>(null);
  const [patientName, setPatientName] = useState("");
  const [reqHospital, setReqHospital] = useState("");

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom Timeline Record Modal
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [customRecordType, setCustomRecordType] = useState("Lab Report");
  const [customFacility, setCustomFacility] = useState("");
  const [customDoctor, setCustomDoctor] = useState("");
  const [customSummary, setCustomSummary] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name);
      setPhone(currentUser.phone || "");
    }
  }, [currentUser]);

  // Audio Siren synchronization with active SOS
  useEffect(() => {
    if (activeSos.status === "active" && soundEnabled) {
      playEmergencySiren();
    } else {
      stopEmergencySiren();
    }
    return () => stopEmergencySiren();
  }, [activeSos.status, soundEnabled]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(fullName, phone);
    playSuccessChime();
    setSettingsMessage("Profile updated successfully!");
    setTimeout(() => setSettingsMessage(""), 3000);
  };

  const handleCustomRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHealthRecord({
      date: new Date().toISOString().split("T")[0],
      type: customRecordType,
      facility: customFacility || "Lifeline Health Center",
      summary: customSummary,
      doctor: customDoctor || "Self Registered",
    });
    setAddRecordOpen(false);
    setCustomFacility("");
    setCustomDoctor("");
    setCustomSummary("");
    playSuccessChime();
    triggerToast("Sealed medical block successfully committed to longitudinal care chain.");
  };

  const handleMapNodeClick = (type: "hospital" | "blood-bank", id: any) => {
    playDigitalBeep();
    if (type === "hospital") {
      setActiveTab("directory");
      const matched = hospitals.find(h => h.id === id);
      if (matched) {
        setSelectedHospital(matched);
      }
    } else if (type === "blood-bank") {
      setActiveTab("blood");
      const matched = bloodBanks.find(b => b.id === id);
      if (matched) {
        setReservingBlood(matched);
      }
    }
  };

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = directoryType === "all" || h.type === directoryType;
    return matchesSearch && matchesType;
  });

  const handleDownloadPDF = (blockId: string) => {
    playSuccessChime();
    triggerToast(`Encrypted care record block #${blockId} compiled & downloaded as secure PDF.`);
  };

  if (!currentUser || !currentUser.isLoggedIn) {
    return (
      <main className="min-h-screen grid place-items-center bg-zinc-950 p-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center max-w-md w-full space-y-6 shadow-2xl backdrop-blur-md">
          <div className="mx-auto inline-flex rounded-xl bg-red-600/10 p-4 text-red-500 border border-red-500/25 animate-pulse">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">COMMAND SECURITY GATED</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You must be registered in the Indian National Health Grid to access the active Lifeline Medical Command Center.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Link href="/auth" className="block w-full rounded-xl bg-red-600 py-3.5 text-xs font-black text-white hover:bg-red-700 transition">
              Establish Grid Connection / Sign In
            </Link>
            <Link href="/" className="block w-full rounded-xl border border-zinc-800 py-3.5 text-xs font-bold text-zinc-500 hover:text-zinc-350 transition">
              Return To Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-red-600 selection:text-white">
      <SiteHeader />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Command Dashboard Header */}
        <header className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-600/10 text-red-500 border border-red-500/20">
              <User size={30} />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">National Healthcare Registry</p>
              <h1 className="text-xl font-black text-white leading-tight mt-0.5">{currentUser?.full_name || "LIFELINE CITIZEN"}</h1>
              <p className="text-[10px] text-zinc-400 font-mono mt-1 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-500" /> STATUS: IMMUTABLE IDENTITY VERIFIED
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playDigitalBeep();
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold border transition ${
                soundEnabled 
                  ? "bg-red-600/10 border-red-500/30 text-red-400" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
              }`}
            >
              {soundEnabled ? <Volume2 size={13} className="animate-bounce" /> : <VolumeX size={13} />}
              <span>Siren Sound: {soundEnabled ? "ON" : "MUTED"}</span>
            </button>

            <button
              onClick={async () => {
                try {
                  await demoLogout();
                } catch (e) {
                  console.error("Logout error: ", e);
                }
                logout();
                window.location.href = "/auth";
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition"
            >
              Log Out Station
            </button>
          </div>
        </header>

        {/* Two Column Layout: Command Sidebar & Workspace */}
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          
          {/* LEFT: Complete Medical Profile & Sidebar Toggles */}
          <aside className="space-y-6">
            
            {/* Command Navigation Panel */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-4 space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 px-3.5 mb-2 flex items-center gap-1.5">
                <Activity size={10} /> System Workspaces
              </p>
              {[
                { id: "overview", label: "Dashboard Overview", icon: Activity },
                { id: "sos", label: "SOS Dispatch Console", icon: Siren, badge: activeSos.status === "active" ? "Live" : undefined },
                { id: "directory", label: "Hospitals & Triage", icon: Building2, badge: activeHospitalBooking ? "Active" : undefined },
                { id: "blood", label: "Blood Matcher Network", icon: Droplet, badge: activeBloodReservation ? "Courier" : undefined },
                { id: "timeline", label: "My Medical Timeline", icon: FileText },
                { id: "settings", label: "Command Profile", icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { playDigitalBeep(); setActiveTab(tab.id as Tab); }}
                    className={`relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-200 w-full text-left ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950 font-black border-white shadow-xl scale-[1.02]"
                        : "text-zinc-400 hover:bg-zinc-900/40 hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={tab.id === "sos" && activeSos.status === "active" ? "animate-pulse text-red-500" : ""} />
                    <span>{tab.label}</span>
                    {tab.badge ? (
                      <span className="absolute right-3 rounded-full bg-red-600 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white animate-pulse">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Medical Profile Summary Card (Apple / Nothing OS styling) */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Health Profile</p>
                <HeartPulse size={12} className="text-red-500 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-900 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">BLOOD GROUP</p>
                  <p className="text-xl font-black text-red-500 tracking-tight mt-1">O-Negative</p>
                </div>
                <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-900 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">GENDER / AGE</p>
                  <p className="text-base font-black text-white mt-1.5">Male / 28</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">NATIONAL HEALTH INSURANCE</p>
                  <p className="text-xs font-black text-white mt-0.5">Apollo Munis #INS-9082-DL</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">REGISTERED ALLERGIES</p>
                  <p className="text-xs font-black text-red-400 mt-0.5 leading-snug">Penicillin, Peanuts, Acute Latex</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">CRITICAL MEDICATIONS</p>
                  <p className="text-xs font-bold text-zinc-300 mt-0.5">Levothyroxine 50mcg</p>
                </div>
              </div>

              {/* Emergency Contacts Module */}
              <div className="border-t border-zinc-900 pt-3.5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2.5">Emergency Contacts</p>
                <div className="rounded-xl bg-zinc-950 border border-zinc-900 p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">Priya Suresh</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Spouse / Primary Contact</p>
                  </div>
                  <a href="tel:+919900012345" className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-red-500">
                    <Phone size={12} />
                  </a>
                </div>
              </div>
            </div>

          </aside>

          {/* RIGHT: Main Command Workspace Tab Contents */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              
              {/* TAB: OVERVIEW */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* Alert Bar if Active SOS */}
                  {activeSos.status === "active" ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-red-600/10 border border-red-500/25 p-5 text-red-400 gap-4">
                      <div className="flex items-center gap-3">
                        <Siren size={20} className="animate-spin text-red-500 shrink-0" />
                        <div>
                          <p className="font-black text-xs uppercase tracking-wider">Critical SOS Rescue Broadcast Active</p>
                          <p className="text-xs text-zinc-400 mt-0.5">Ambulance {activeSos.ambulanceId} en route to {activeSos.pickupLocation}. ETA: {activeSos.eta}.</p>
                        </div>
                      </div>
                      <button onClick={() => { playDigitalBeep(); setActiveTab("sos"); }} className="flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-black text-white transition shrink-0">
                        View Live Tracker <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-zinc-900 bg-gradient-to-r from-zinc-950 to-zinc-900 p-6 md:p-8 relative overflow-hidden">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">Medical Command OS</p>
                      <h2 className="text-2xl font-black text-white tracking-tight mt-2 max-w-md leading-tight">National Emergency Operating Network</h2>
                      <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">Your secure credentials are integrated with nearby trauma hubs, clinical ER queues, and verified motorcycle cold-chain networks.</p>
                      
                      <button onClick={() => { playDigitalBeep(); setActiveTab("sos"); }} className="mt-5 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-3 text-xs font-black text-white transition tracking-wide">
                        Trigger SOS Live Channel
                      </button>
                    </div>
                  )}

                  {/* Active Booking Grid Checks */}
                  {(activeHospitalBooking || activeBloodReservation) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {activeHospitalBooking && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building2 size={18} className="text-emerald-400 animate-pulse" />
                            <div>
                              <p className="text-xs font-black text-white">ER Priority Bed Slot</p>
                              <p className="text-[10px] text-zinc-400">Queue ETA: {activeHospitalBooking.queueEta} mins · ID: {activeHospitalBooking.ticketId}</p>
                            </div>
                          </div>
                          <button onClick={clearHospitalBooking} className="text-[10px] font-black text-zinc-500 hover:text-red-400 uppercase tracking-widest">Release</button>
                        </div>
                      )}
                      {activeBloodReservation && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Truck size={18} className="text-red-400 animate-bounce" />
                            <div>
                              <p className="text-xs font-black text-white">Cold-Chain Dispatch</p>
                              <p className="text-[10px] text-zinc-400">Status: {activeBloodReservation.status} · ID: {activeBloodReservation.ticketId}</p>
                            </div>
                          </div>
                          <button onClick={clearBloodReservation} className="text-[10px] font-black text-zinc-500 hover:text-red-400 uppercase tracking-widest">Dismiss</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Map Coordinates Grid */}
                  <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Trauma Grid Network</span>
                      <span className="text-[9px] font-mono text-zinc-500">LAT: 12.9716° N · LNG: 77.5946° E</span>
                    </div>
                    <InteractiveMap onNodeClick={handleMapNodeClick} />
                  </div>

                  {/* Sandbox State Simulator */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sandbox Controls</p>
                      <p className="text-[11px] text-zinc-400 mt-1">Simulate district level surge spikes or emergency training drill protocols.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setSimulation("normal"); playDigitalBeep(); }}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold transition border ${simulationMode === "normal" ? "bg-white text-zinc-950 font-black border-white" : "border-zinc-800 text-zinc-400"}`}
                      >
                        Normal Grid
                      </button>
                      <button
                        onClick={() => { setSimulation("surge"); playDigitalBeep(); }}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold transition border ${simulationMode === "surge" ? "bg-amber-600 text-white border-amber-500" : "border-zinc-800 text-zinc-400"}`}
                      >
                        Surge Spike Mode
                      </button>
                      <button
                        onClick={() => { setSimulation("drill"); playDigitalBeep(); }}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold transition border ${simulationMode === "drill" ? "bg-red-600 text-white border-red-500 animate-pulse" : "border-zinc-800 text-zinc-400"}`}
                      >
                        Drill Mode
                      </button>
                      <button
                        onClick={() => { resetDatabase(); }}
                        className="rounded-xl border border-red-500/30 hover:border-red-500 px-4 py-2.5 text-xs font-bold text-red-400 transition ml-auto"
                      >
                        Factory reset DB
                      </button>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* TAB: SOS DISPATCH */}
              {activeTab === "sos" && (
                <motion.div key="sos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 md:p-8">
                    <h2 className="text-xl font-black text-white">Emergency Dispatch Console</h2>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xl">A holding sequence registers encrypted geofence handshakes instantly. Maintain full communication status.</p>
                    
                    <div className="mt-8 flex flex-col items-center justify-center text-center">
                      {activeSos.status === "active" ? (
                        <div className="space-y-6 w-full max-w-lg">
                          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                            <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                            <Siren size={36} className="animate-spin text-white" />
                          </div>
                          
                          <div>
                            <span className="rounded-lg bg-red-600/10 border border-red-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-400 animate-pulse">SIREN DISPATCH BROADCAST LIVE</span>
                            <h3 className="text-base font-black text-white mt-4">Broadcasting GPS Coordinates</h3>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center justify-center gap-1"><MapPin size={11} /> 12.9141° N · 77.6413° E · Radius: ±3m</p>
                          </div>

                          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 text-left space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Live Milepost Timeline</p>
                            <div className="relative border-l-2 border-zinc-900 ml-2 pl-6 space-y-5">
                              {[
                                { step: 0, text: "SOS coordinate handshakes locked", time: "Just now" },
                                { step: 1, text: "Bengaluru 108 Emergency bypass established", time: "30s" },
                                { step: 2, text: `Ambulance ALS unit ${activeSos.ambulanceId} dispatched`, time: "1m" },
                                { step: 3, text: "Pre-registration bed locked at Fortis ER", time: "Simulated" },
                                { step: 4, text: "Fully admitted & record block sealed", time: "Admit" }
                              ].map((milestone) => {
                                const isDone = activeSos.step >= milestone.step;
                                const isCurrent = activeSos.step === milestone.step;
                                return (
                                  <div key={milestone.step} className="relative text-xs flex justify-between items-center">
                                    <span className={`absolute -left-[30px] flex h-4.5 w-4.5 items-center justify-center rounded-full border ${
                                      isDone
                                        ? "bg-emerald-500 border-emerald-400 text-white"
                                        : isCurrent
                                        ? "bg-red-500 border-red-400 text-white animate-pulse"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-600"
                                    }`}>
                                      {isDone && <CheckCircle size={10} />}
                                    </span>
                                    <span className={isDone ? "text-white font-bold" : isCurrent ? "text-red-400 font-black animate-pulse" : "text-zinc-500"}>
                                      {milestone.text}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-500">{milestone.time}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => { resolveSos(); playDigitalBeep(); }} className="flex-1 rounded-xl bg-zinc-900 border border-zinc-850 py-3.5 text-xs font-black text-white hover:bg-zinc-800 transition">
                              Abort / Resolve Mission
                            </button>
                          </div>
                        </div>
                      ) : activeSos.status === "countdown" ? (
                        <div className="space-y-5 text-center">
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-3xl font-black animate-pulse mx-auto">
                            {activeSos.countdown}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-red-500 uppercase tracking-wider">Establishing Beacon Buffer</h3>
                            <p className="text-xs text-zinc-400 mt-1">Transmitting medical telemetry packets...</p>
                          </div>
                          <button onClick={() => { cancelSos(); playDigitalBeep(); }} className="rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-3 text-xs font-black text-zinc-400 hover:text-white transition">Abort Protocol</button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <button onClick={() => { triggerSos("HSR Layout Sector 4"); playDigitalBeep(); }} className="relative flex h-32 w-32 items-center justify-center rounded-full bg-red-600 text-white shadow-xl hover:scale-105 active:scale-95 transition">
                            <Siren size={36} className="animate-pulse text-white" />
                          </button>
                          <div>
                            <h3 className="text-base font-black text-white">READY FOR DISPATCH</h3>
                            <p className="text-xs text-zinc-500 max-w-sm mt-1">Initiating will trigger a 3-second buffer to transmit coordinates safely.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: DIRECTORY */}
              {activeTab === "directory" && (
                <motion.div key="directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-black text-white">Admissions & Clinical Beds</h2>
                        <p className="text-xs text-zinc-500 mt-1">Search live medical registries to lock priority bed tickets.</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {["all", "hospitals", "clinics"].map((type) => (
                          <button key={type} type="button" onClick={() => setDirectoryType(type as any)} className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${directoryType === type ? "bg-white text-zinc-950 font-black border-white" : "border-zinc-800 bg-zinc-900/30 text-zinc-400"}`}>{type}</button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredHospitals.map((hospital) => (
                        <div key={hospital.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">{hospital.tag}</span>
                              <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1"><MapPin size={11} /> {hospital.distance}</span>
                            </div>
                            <h3 className="text-sm font-black text-white">{hospital.name}</h3>
                            <p className="text-xs text-zinc-400">Available Beds: <span className="text-emerald-400 font-bold">{hospital.beds}</span> · Queue: <span className="font-semibold text-zinc-300">{hospital.erWait}</span></p>
                          </div>
                          <div className="mt-5 flex gap-2 border-t border-zinc-900 pt-3">
                            <button onClick={() => { setSelectedHospital(hospital); }} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-black text-white transition">Book Bed Reservation</button>
                            <a href={`tel:${hospital.phone.replace(/\s/g, "")}`} className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-400 hover:text-white transition"><Phone size={13} /></a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedHospital && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/80 backdrop-blur-sm p-4">
                      <div className="rounded-2xl bg-zinc-900 border border-zinc-850 p-6 w-full max-w-md relative">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">Pre-Register consultation</h3>
                          <button onClick={() => setSelectedHospital(null)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
                        </div>
                        
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          bookHospitalSlot(selectedHospital.id, bookingSymptom, bookingUrgency);
                          setSelectedHospital(null);
                          setBookingSymptom("");
                        }} className="mt-5 space-y-4">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Patient Symptoms / Trauma</span>
                            <textarea required value={bookingSymptom} onChange={(e) => setBookingSymptom(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs outline-none focus:border-red-500/40 text-white font-semibold min-h-[80px]" placeholder="e.g. Chest tightness, acute breathing struggle..." />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Emergency Priority</span>
                            <select value={bookingUrgency} onChange={(e) => setBookingUrgency(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs outline-none focus:border-red-500/40 text-white font-black">
                              <option value="emergency">Critical - Ambulance Admittance</option>
                              <option value="urgent">Urgent Triage (Within 30m)</option>
                              <option value="routine">Routine Check / OPD</option>
                            </select>
                          </div>
                          <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white transition">Book Admittance Ticket</button>
                        </form>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB: BLOOD */}
              {activeTab === "blood" && (
                <motion.div key="blood" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6">
                    <h2 className="text-xl font-black text-white">Allocation Networks</h2>
                    <p className="text-xs text-zinc-500 mt-1">Filter matching stocks below and call cold-chain couriers.</p>
                    
                    <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                        <button key={group} type="button" onClick={() => { setSelectedBloodGroup(group); }} className={`rounded-lg py-2.5 text-[10px] font-black transition ${selectedBloodGroup === group ? "bg-red-600 text-white shadow" : "text-zinc-500 hover:text-white"}`}>{group}</button>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {bloodBanks.map((bank) => {
                        const stockCount = bank.stock[selectedBloodGroup] ?? 0;
                        const isAvailable = stockCount > 0;
                        return (
                          <div key={bank.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${isAvailable ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{isAvailable ? "AVAILABLE" : "DEPLETED"}</span>
                              <h4 className="text-sm font-black text-white pt-2">{bank.name}</h4>
                              <p className="text-xs text-zinc-500 leading-none flex items-center gap-1"><MapPin size={11} /> {bank.address}</p>
                              <p className="text-xs text-zinc-300 font-bold pt-1.5">Matched Reserve: <span className="text-red-500">{stockCount} Bags</span></p>
                            </div>
                            <div className="mt-5 flex gap-2 border-t border-zinc-900 pt-3">
                              <button disabled={!isAvailable} onClick={() => { setReservingBlood(bank); }} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-30 py-2.5 text-xs font-black text-white transition">Reserve Bag</button>
                              <a href={`tel:${bank.phone.replace(/\s/g, "")}`} className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-400 hover:text-white transition"><Phone size={13} /></a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {reservingBlood && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/80 backdrop-blur-sm p-4">
                      <div className="rounded-2xl bg-zinc-900 border border-zinc-850 p-6 w-full max-w-md relative">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">Reserve Blood Pack</h3>
                          <button onClick={() => setReservingBlood(null)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
                        </div>
                        
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          reserveBlood(reservingBlood.id, selectedBloodGroup, patientName, reqHospital);
                          setReservingBlood(null);
                        }} className="mt-5 space-y-4">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Patient Full Name</span>
                            <input required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none focus:border-red-500/40" placeholder="e.g. Aditi Sharma" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Target Hospital</span>
                            <input required value={reqHospital} onChange={(e) => setReqHospital(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none focus:border-red-500/40" placeholder="e.g. Apollo Trauma Center" />
                          </div>
                          <button type="submit" className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-3 text-xs font-black text-white transition">Secure Cold-Chain Dispatch</button>
                        </form>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB: TIMELINE */}
              {activeTab === "timeline" && (
                <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 space-y-5">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                      <div>
                        <h2 className="text-xl font-black text-white">Longitudinal Medical History Ledger</h2>
                        <p className="text-xs text-zinc-500 mt-1">Cryptographically sealed Care Timeline entries tracking your medical records history.</p>
                      </div>
                      <button onClick={() => { playDigitalBeep(); setAddRecordOpen(true); }} className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-4 py-2.5 text-xs font-black text-white transition flex items-center gap-1">
                        <Plus size={14} /> Commit Sealed Record
                      </button>
                    </div>

                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-[9px] top-0 h-full w-[2px] bg-gradient-to-b from-cyan-500 to-transparent" />
                      
                      {healthRecords.map((record) => (
                        <div key={record.id} className="relative bg-zinc-950 p-5 rounded-xl border border-zinc-900">
                          <span className="absolute -left-[23px] top-6 h-3.5 w-3.5 rounded-full bg-zinc-950 border-2 border-cyan-500" />
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-cyan-400">{record.type}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">ID: {record.id}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white leading-snug">{record.summary}</h4>
                              <p className="text-[10px] text-zinc-400 font-mono">Date: {record.date} · Center: {record.facility} · Physician: {record.doctor}</p>
                            </div>
                            <button onClick={() => handleDownloadPDF(record.id)} className="shrink-0 h-9 rounded-xl border border-cyan-500/20 hover:bg-cyan-950/20 text-cyan-400 hover:text-white px-3.5 text-[10px] font-black uppercase flex items-center gap-1 transition">
                              <Download size={11} /> Unseal PDF
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add record form overlay */}
                  {addRecordOpen && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/80 backdrop-blur-sm p-4">
                      <div className="rounded-2xl bg-zinc-900 border border-zinc-850 p-6 w-full max-w-md relative">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">Commit Sealed Care Record</h3>
                          <button onClick={() => setAddRecordOpen(false)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
                        </div>
                        
                        <form onSubmit={handleCustomRecordSubmit} className="mt-5 space-y-4">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Record Classification</span>
                            <select value={customRecordType} onChange={(e) => setCustomRecordType(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none focus:border-cyan-500/40 font-black">
                              <option value="Lab Report">Lab Report</option>
                              <option value="Prescription">Prescription/Medication</option>
                              <option value="ER Visit">Specialist Consultation</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Medical Facility</span>
                            <input required value={customFacility} onChange={(e) => setCustomFacility(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none focus:border-cyan-500/40" placeholder="e.g. Fortis Hospital, Bengaluru" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Practitioner Name</span>
                            <input required value={customDoctor} onChange={(e) => setCustomDoctor(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none focus:border-cyan-500/40" placeholder="e.g. Dr. Kavitha Rao, MD" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Summary Detail</span>
                            <textarea required value={customSummary} onChange={(e) => setCustomSummary(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none focus:border-cyan-500/40 min-h-[80px]" placeholder="e.g. Diagnosed normal sinus rhythm..." />
                          </div>
                          <button type="submit" className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 py-3 text-xs font-black text-white transition">Commit Block</button>
                        </form>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 md:p-8">
                    <h2 className="text-xl font-black text-white">Account & System Profile Parameters</h2>
                    <p className="text-xs text-zinc-500 mt-1">Edit on-grid citizen values.</p>

                    <form onSubmit={handleSaveProfile} className="mt-8 space-y-4 max-w-md">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Citizen Full Name</span>
                        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs text-white outline-none focus:border-red-500/45 font-bold" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Registered Phone Number (On-Grid Format)</span>
                        <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs text-white outline-none focus:border-red-500/45 font-mono" />
                      </div>
                      
                      {settingsMessage && (
                        <p className="text-xs text-emerald-400 font-black">{settingsMessage}</p>
                      )}

                      <button type="submit" className="w-full rounded-xl bg-zinc-100 text-zinc-950 font-black py-3.5 text-xs transition border border-white uppercase tracking-wider">
                        Commit Profile Settings
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

      <SiteFooter />

      {/* Micro Verification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl bg-zinc-900 border border-cyan-500/30 px-5 py-4 shadow-2xl flex items-center gap-3 text-xs font-bold text-white max-w-sm"
          >
            <CheckCircle size={18} className="text-cyan-400 shrink-0" />
            <p>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
