"use client";

import { Building2, Bed, Siren, Droplet, BarChart3, CheckCircle } from "lucide-react";
import { FeaturePageLayout } from "@/components/shared/feature-page-layout";
import { useLifeline } from "@/lib/state-engine";
import { playDigitalBeep } from "@/lib/audio-tones";

export default function HospitalPortalPage() {
  const {
    hospitals,
    incidents,
    acceptSosIncident,
    updateHospitalBeds,
    activeBloodReservation,
    simulationMode
  } = useLifeline();

  // We map the Hospital Portal to Fortis Emergency Hospital (id: 1)
  const fortisHospital = hospitals.find(h => h.id === 1) || { name: "Fortis Emergency Hospital", beds: "12 available" };
  const bedsMatch = fortisHospital.beds.match(/\d+/);
  const bedsCount = bedsMatch ? parseInt(bedsMatch[0]) : 12;

  // Active incoming alerts are those that are not resolved
  const incomingAlerts = incidents.filter(inc => inc.status !== "resolved");

  const handleIncrementBeds = () => {
    playDigitalBeep();
    updateHospitalBeds(1, "increment");
  };

  const handleDecrementBeds = () => {
    playDigitalBeep();
    updateHospitalBeds(1, "decrement");
  };

  const handleAcceptPatient = (incidentId: string) => {
    playDigitalBeep();
    acceptSosIncident(incidentId, 1);
  };

  return (
    <FeaturePageLayout
      title="Hospital Admin Portal"
      subtitle="Manage ER bed capacity, accept incoming SOS pre-notes, coordinate ambulance dispatch, and track incident analytics."
      icon={Building2}
      iconColor="text-emerald-600"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "ER Beds Available", value: bedsCount, icon: Bed },
          { label: "Active Incoming SOS", value: incomingAlerts.length, icon: Siren, isAlert: incomingAlerts.length > 0 },
          { label: "Active Blood Deliveries", value: activeBloodReservation ? 1 : 0, icon: Droplet },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border p-5 transition-all ${s.isAlert ? "border-red-200 bg-red-500/5 dark:border-red-950 dark:bg-red-950/20" : "border-slate-100 bg-white/60 dark:border-slate-800 dark:bg-slate-900/50"}`}>
              <Icon size={20} className={s.isAlert ? "text-red-500 animate-pulse" : "text-emerald-600"} />
              <p className="mt-2 text-2xl font-black">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500">ER Bed Capacity Monitor</h3>
          <div className="rounded-2xl border border-slate-100 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{fortisHospital.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Beds: <span className="font-bold text-emerald-600">{bedsCount}</span></span>
                <div className="flex gap-1.5">
                  <button onClick={handleDecrementBeds} className="rounded-lg border px-3 py-1.5 text-xs font-black bg-white dark:bg-slate-900 shadow-sm">−</button>
                  <button onClick={handleIncrementBeds} className="rounded-lg border px-3 py-1.5 text-xs font-black bg-white dark:bg-slate-900 shadow-sm">+</button>
                </div>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (bedsCount / 40) * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Official registered maximum trauma capacity: 40 beds</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            Incoming SOS Alerts & Pre-Alerts 
            {incomingAlerts.length > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
          </h3>
          <div className="space-y-3">
            {incomingAlerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
                No active SOS alarms reported in this sector.
              </div>
            ) : (
              incomingAlerts.map((s) => (
                <div key={s.id} className="rounded-2xl border border-red-100 bg-red-500/5 p-4 dark:border-red-950 dark:bg-red-950/10 animate-pulse-slow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-red-600 dark:text-red-400">{s.id} — {s.type}</p>
                      <p className="text-xs text-slate-500 font-semibold">{s.location} · {s.time}</p>
                    </div>
                    <button onClick={() => handleAcceptPatient(s.id)} className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-sm transition shrink-0">
                      Accept & Lock Bed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500">
          <BarChart3 size={16} /> District Operations Analytics (Simulated)
        </h3>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Emergency Responses Today", value: "34" },
            { label: "Avg Rescue Cycle Time", value: simulationMode === "surge" ? "12.8 min" : "4.2 min" },
            { label: "Grid Resource Saturation", value: simulationMode === "surge" ? "92%" : "68%" },
            { label: "Cross-District Mobilizations", value: "8" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-100 p-4 text-center dark:border-slate-800">
              <p className="text-lg font-black">{s.value}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </FeaturePageLayout>
  );
}
