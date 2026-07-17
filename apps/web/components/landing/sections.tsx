"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Building2,
  Droplet,
  Hospital,
  ShieldCheck,
  UserRoundPlus,
  Waves,
  Siren,
  MapPin,
  BellRing,
  Ambulance,
  HeartPulse,
  Phone,
  Clock,
  Globe,
  Lock,
  Zap,
  Radio,
  Mic,
  BarChart3,
  CloudLightning,
  Wifi,
  FileText,
  Star,
  ArrowRight,
  CheckCircle,
  Activity,
  Stethoscope,
  Users,
  MessageSquare,
} from "lucide-react";

/* ─── Feature cards ────────────────────────────────────────────── */
const coreFeatures = [
  {
    title: "Unified Emergency Graph",
    description:
      "Patients, responders, hospitals, blood banks, and authorities all linked in one real-time operational mesh.",
    icon: Building2,
    color: "text-brand-600",
    bg: "bg-brand-500/10",
  },
  {
    title: "Smart Priority Routing",
    description:
      "AI-assisted triage and routing delivers the right resource to the right patient in the shortest time window.",
    icon: Hospital,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Blood Access Network",
    description:
      "Real-time inventory aggregated across 920+ donor centers with one-tap bag reservation and courier dispatch.",
    icon: Droplet,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    title: "Verified Volunteer Mesh",
    description:
      "On-ground volunteers geofenced and activated within seconds based on proximity and skill level.",
    icon: UserRoundPlus,
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    title: "Government Control Plane",
    description:
      "District-level dashboards with live disaster overlays, fleet tracking, and surge capacity heatmaps.",
    icon: ShieldCheck,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    title: "Continuous Care Timeline",
    description:
      "Every event from SOS trigger to discharge is stitched into a tamper-proof longitudinal health record.",
    icon: Waves,
    color: "text-cyan-600",
    bg: "bg-cyan-500/10",
  },
];

/* ─── SOS Features ──────────────────────────────────────────────── */
const sosFeatures = [
  {
    icon: Mic,
    title: "Voice SOS Activation",
    description:
      'Say "LIFELINE SOS" hands-free to instantly broadcast your coordinates to every nearby responder in under 2 seconds.',
  },
  {
    icon: MapPin,
    title: "Precision GPS Broadcast",
    description:
      "Sub-3 metre GPS accuracy with indoor beacon fallback ensures responders reach the exact floor and room.",
  },
  {
    icon: Radio,
    title: "Multi-channel Escalation",
    description:
      "Alerts are simultaneously dispatched to district 108, volunteer mesh, hospital ERs, and family contacts.",
  },
  {
    icon: Wifi,
    title: "Offline-Resilient Mode",
    description:
      "When data drops, SOS transmits over SMS + low-power Bluetooth relay network to maintain the chain.",
  },
];

/* ─── Platform numbers ───────────────────────────────────────────── */
const numbers = [
  { label: "Hospitals Connected", value: "1,480+", icon: Building2 },
  { label: "Ambulance Fleet", value: "3,200+", icon: Ambulance },
  { label: "Blood Bank Partners", value: "920+", icon: Droplet },
  { label: "Districts Covered", value: "640+", icon: Globe },
  { label: "Avg SOS Response", value: "< 4 min", icon: Clock },
  { label: "Volunteer Responders", value: "18,000+", icon: Users },
];

/* ─── How it works steps ────────────────────────────────────────── */
const howItWorks = [
  {
    step: "01",
    title: "Tap SOS or Search",
    description:
      "Trigger emergency alert with one tap, voice command, or search for nearby hospitals and blood banks with zero login required.",
    icon: Siren,
  },
  {
    step: "02",
    title: "AI Matches Resources",
    description:
      "Our triage engine instantly scores ambulance proximity, hospital ER capacity, and blood inventory against your location.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Fleet Dispatched",
    description:
      "The optimal ambulance is dispatched with live turn-by-turn routing, and the target hospital is pre-notified with intake details.",
    icon: Ambulance,
  },
  {
    step: "04",
    title: "Care Continuity Logged",
    description:
      "Every event is recorded into a secure timeline accessible by your care team, ensuring zero information loss across handoffs.",
    icon: FileText,
  },
];

/* ─── Use cases ─────────────────────────────────────────────────── */
const useCases = [
  {
    role: "Citizen",
    emoji: "👤",
    color: "from-brand-600 to-cyan-500",
    points: [
      "One-tap SOS with voice activation",
      "Browse hospitals & blood banks nearby",
      "Book ER slot or doctor consultation",
      "Track ambulance en route in real time",
      "Access personal medical timeline",
    ],
  },
  {
    role: "Hospital Admin",
    emoji: "🏥",
    color: "from-emerald-600 to-teal-500",
    points: [
      "Manage live ER bed capacity",
      "Accept incoming SOS patient pre-notes",
      "Coordinate with ambulance dispatch",
      "Blood bank stock & order management",
      "Incident reporting and analytics",
    ],
  },
  {
    role: "Ambulance Driver",
    emoji: "🚑",
    color: "from-red-500 to-orange-500",
    points: [
      "Receive live dispatch alerts with GPS",
      "AI-optimized turn-by-turn routing",
      "Patient vitals pre-loaded on device",
      "Handoff confirmation to ER nurse",
      "Shift management and incident log",
    ],
  },
  {
    role: "Authority / Gov",
    emoji: "🏛️",
    color: "from-violet-600 to-indigo-500",
    points: [
      "City-level emergency heatmaps",
      "Surge capacity & fleet analytics",
      "District SOS pattern monitoring",
      "Flood, fire & mass-casualty overlays",
      "Policy dashboard and audit exports",
    ],
  },
];

/* ─── Testimonials ──────────────────────────────────────────────── */
const testimonials = [
  {
    name: "Dr. Meera Pillai",
    role: "Chief Emergency Officer, Fortis Hospital",
    quote:
      "LIFELINE INDIA reduced our average intake prep time by 73%. Patients arrive and we already know their blood type, allergies, and incident context.",
  },
  {
    name: "Inspector Rahul Desai",
    role: "District Emergency Manager, Bengaluru South",
    quote:
      "The government control plane lets my team see every SOS, every ambulance, and every ER status in one screen. This is what modern emergency ops should look like.",
  },
  {
    name: "Priya Suresh",
    role: "Citizen, Chennai",
    quote:
      "My father collapsed. I pressed the SOS button once. In under 5 minutes an ambulance was at our door and the hospital was ready. LIFELINE saved his life.",
  },
];

/* ─── Compact animated counter component ────────────────────────── */
function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-5 text-center"
    >
      <div className="mx-auto mb-3 inline-flex rounded-2xl bg-brand-500/10 p-3 text-brand-700 dark:text-cyan-300">
        <Icon size={22} />
      </div>
      <p className="text-2xl font-black md:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500 font-semibold">{label}</p>
    </motion.div>
  );
}

/* ─── Main export ───────────────────────────────────────────────── */
export function LandingSections() {
  return (
    <>
      {/* ── 1. Core Features Grid ────────────────────────────────── */}
      <section className="section-shell mt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-brand-700 dark:text-cyan-300">
            Platform Capabilities
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Everything Emergency Care Needs
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            From the moment an SOS is triggered to long-term care record continuity — every critical link in the emergency chain is covered.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coreFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                className="glass-card group rounded-3xl p-6"
              >
                <div className={`inline-flex rounded-2xl p-3 ${f.bg} ${f.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {f.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ── 2. Platform Numbers ──────────────────────────────────── */}
      <section className="section-shell mt-20">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <span className="inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Live Network Scale
            </span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">
              India&apos;s Largest Emergency Mesh
            </h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {numbers.map((n) => (
              <StatCard key={n.label} label={n.label} value={n.value} icon={n.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SOS Deep-Dive ─────────────────────────────────────── */}
      <section className="section-shell mt-20">
        <div className="glass-card overflow-hidden rounded-3xl">
          <div className="grid md:grid-cols-2">
            {/* Left text */}
            <div className="p-8 md:p-12">
              <span className="inline-block rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-600">
                Emergency Core
              </span>
              <h2 className="mt-4 text-3xl font-black md:text-4xl">
                One Tap. Full Rescue{" "}
                <span className="gradient-text">Chain Activated.</span>
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Our SOS engine is engineered for zero-margin scenarios — when every second of delay costs lives.
              </p>
              <div className="mt-8 space-y-5">
                {sosFeatures.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                        <Icon size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{f.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {f.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right animated graphic */}
            <div className="relative flex items-center justify-center bg-gradient-to-br from-red-500/5 via-transparent to-brand-500/5 p-8 md:p-12">
              {/* Pulse rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute rounded-full border border-red-400/25"
                    initial={{ width: 80, height: 80, opacity: 0.7 }}
                    animate={{ width: 80 + ring * 90, height: 80 + ring * 90, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: ring * 0.65, ease: "easeOut" }}
                  />
                ))}
              </div>

              <div className="relative z-10 w-full max-w-xs space-y-3">
                {/* SOS Button */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_50px_rgba(239,68,68,0.5)] text-white">
                  <Siren size={36} className="animate-pulse" />
                </div>

                {/* Timeline cards */}
                {[
                  { icon: MapPin, label: "GPS broadcast", time: "0.8s", done: true },
                  { icon: Radio, label: "Operator notified", time: "1.2s", done: true },
                  { icon: Ambulance, label: "ALI-203 dispatched", time: "3.4s", done: true },
                  { icon: HeartPulse, label: "Hospital pre-alert", time: "4.1s", done: false },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.12 }}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <Icon size={15} className={item.done ? "text-emerald-500" : "text-red-500 animate-pulse"} />
                      <span className="flex-1 text-xs font-semibold">{item.label}</span>
                      <span className={`text-[10px] font-bold ${item.done ? "text-emerald-500" : "text-red-500"}`}>
                        {item.time}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. How It Works ──────────────────────────────────────── */}
      <section className="section-shell mt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
            Workflow
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            How LIFELINE Works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">
            From citizen SOS to safe hospital admission — four precision steps, automated and audited.
          </p>
        </motion.div>

        <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {howItWorks.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card relative rounded-3xl p-6"
              >
                <span className="absolute -top-3.5 left-5 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-black text-white">
                  {step.step}
                </span>
                <div className="mt-3 inline-flex rounded-2xl bg-brand-500/10 p-3 text-brand-700 dark:text-cyan-300">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── 5. Use Cases by Stakeholder ──────────────────────────── */}
      <section className="section-shell mt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="inline-block rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
            Tailored For Everyone
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Built For Every Emergency Stakeholder
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Whether you are a panicked citizen, a hospital admin managing surge capacity, or a government official monitoring city-wide disasters — LIFELINE has a role-specific command layer for you.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.role}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09 }}
              className="glass-card overflow-hidden rounded-3xl"
            >
              <div className={`bg-gradient-to-r ${uc.color} px-6 py-5 text-white`}>
                <span className="text-3xl">{uc.emoji}</span>
                <h3 className="mt-2 text-lg font-black">{uc.role}</h3>
              </div>
              <ul className="space-y-2.5 p-5">
                {uc.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 6. Advanced Tech Features ────────────────────────────── */}
      <section className="section-shell mt-20">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <span className="inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              Technology
            </span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">
              Enterprise-Grade Infrastructure
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Lock, title: "JWT + Redis Auth", desc: "Rotating refresh tokens, role-based access control, and multi-device session revocation. Every API call is verified end-to-end." },
              { icon: CloudLightning, title: "Sub-100ms API Latency", desc: "FastAPI on uvicorn workers with PostgreSQL connection pooling ensures emergency queries never wait." },
              { icon: Activity, title: "Real-Time Event Bus", desc: "WebSocket-backed live feeds propagate SOS events, ambulance positions, and ER state changes to all connected clients instantly." },
              { icon: Stethoscope, title: "HIPAA-Aligned Records", desc: "Patient data is encrypted at rest and in transit with strict access audit logging for every read and write." },
              { icon: BarChart3, title: "Analytics & Heatmaps", desc: "District-level dashboards surface incident patterns, resource gaps, and surge predictions powered by historical data." },
              { icon: BellRing, title: "Multi-Channel Alerts", desc: "SMS, push notifications, in-app banners, and email alerts keep patients, families, and responders synchronized at all times." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-4 rounded-3xl border border-slate-100 bg-white/50 p-5 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700 dark:text-cyan-300">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. Testimonials ──────────────────────────────────────── */}
      <section className="section-shell mt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="inline-block rounded-full bg-slate-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Trusted on the Ground
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex flex-col justify-between rounded-3xl p-6"
            >
              <div>
                <div className="flex gap-0.5 text-amber-400">
                  {Array(5).fill(0).map((_, si) => <Star key={si} size={14} fill="currentColor" />)}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-200">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-700 text-sm font-black dark:text-cyan-300">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 8. CTA banner ────────────────────────────────────────── */}
      <section className="section-shell mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-800 to-slate-900 p-10 text-center text-white md:p-16"
        >
          {/* Decorative blobs */}
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

          <HeartPulse size={36} className="mx-auto text-red-400 animate-pulse" />
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Every Second Saves a Life.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Join 1.4 billion citizens on the platform that is rewriting how India responds to emergencies. Register in under 30 seconds.
          </p>
          <a
            href="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-brand-900 transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            Create Free Account <ArrowRight size={16} />
          </a>
        </motion.div>
      </section>
    </>
  );
}
