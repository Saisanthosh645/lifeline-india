"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  hospitals as initialHospitals,
  bloodBanks as initialBloodBanks,
  ambulances as initialAmbulances,
  healthRecords as initialHealthRecords,
  activeSosIncidents as initialIncidents,
  Hospital,
  BloodBank,
  Ambulance,
  HealthRecord,
  SosIncident,
  generateTicket,
} from "./demo-data";

export type { Hospital, BloodBank, Ambulance, HealthRecord, SosIncident };

export interface ActiveSosState {
  id: string | null;
  status: "idle" | "countdown" | "active" | "resolved";
  countdown: number;
  step: number; // 0: transmitted, 1: notified, 2: en-route, 3: pre-alert, 4: admitted
  eta: string;
  ambulanceId: string | null;
  pickupLocation: string;
  destinationHospital: string;
}

export interface ActiveBloodReservation {
  ticketId: string;
  bankId: number;
  bloodGroup: string;
  patientName: string;
  hospitalName: string;
  status: "dispatched" | "en-route" | "out-for-delivery" | "delivered";
  elapsedSeconds: number;
}

export interface ActiveHospitalBooking {
  ticketId: string;
  hospitalId: number;
  symptom: string;
  urgency: string;
  status: "queued" | "accepted" | "checked-in";
  queueEta: number; // in minutes
}

export interface UserSession {
  full_name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  isLoggedIn: boolean;
}

interface LifelineContextType {
  hospitals: Hospital[];
  bloodBanks: BloodBank[];
  ambulances: Ambulance[];
  healthRecords: HealthRecord[];
  incidents: SosIncident[];
  activeSos: ActiveSosState;
  activeBloodReservation: ActiveBloodReservation | null;
  activeHospitalBooking: ActiveHospitalBooking | null;
  currentUser: UserSession | null;
  simulationMode: "normal" | "surge" | "drill";
  
  // Actions
  login: (name: string, email: string, phone: string, photo?: string) => void;
  logout: () => void;
  updateProfile: (name: string, phone: string) => void;
  
  triggerSos: (pickup: string, destination?: string) => void;
  cancelSos: () => void;
  advanceSosStep: () => void;
  resolveSos: () => void;
  
  bookAmbulance: (ambulanceId: string, pickup: string, destination: string) => string;
  reserveBlood: (bankId: number, group: string, patient: string, hospital: string) => string;
  updateBloodReservationTime: () => void;
  clearBloodReservation: () => void;
  
  bookHospitalSlot: (hospitalId: number, symptom: string, urgency: string) => string;
  clearHospitalBooking: () => void;
  
  addHealthRecord: (record: Omit<HealthRecord, "id">) => void;
  updateHospitalBeds: (hospitalId: number, action: "increment" | "decrement") => void;
  acceptSosIncident: (incidentId: string, hospitalId: number) => void;
  setSimulation: (mode: "normal" | "surge" | "drill") => void;
  addIncident: (type: string, location: string) => void;
  resetDatabase: () => void;
}

const LifelineContext = createContext<LifelineContextType | undefined>(undefined);

export function LifelineProvider({ children }: { children: ReactNode }) {
  // Database States
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [incidents, setIncidents] = useState<SosIncident[]>([]);
  
  // App States
  const [activeSos, setActiveSos] = useState<ActiveSosState>({
    id: null,
    status: "idle",
    countdown: 3,
    step: 0,
    eta: "6 min",
    ambulanceId: null,
    pickupLocation: "HSR Layout, Bengaluru",
    destinationHospital: "Fortis Emergency Hospital",
  });
  
  const [activeBloodReservation, setActiveBloodReservation] = useState<ActiveBloodReservation | null>(null);
  const [activeHospitalBooking, setActiveHospitalBooking] = useState<ActiveHospitalBooking | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [simulationMode, setSimulationMode] = useState<"normal" | "surge" | "drill">("normal");

  // Load Initial DB from localStorage or default
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const localHospitals = localStorage.getItem("ll_hospitals");
    const localBloodBanks = localStorage.getItem("ll_blood_banks");
    const localAmbulances = localStorage.getItem("ll_ambulances");
    const localRecords = localStorage.getItem("ll_records");
    const localIncidents = localStorage.getItem("ll_incidents");
    const localUser = localStorage.getItem("lifeline_user");
    const localActiveSos = localStorage.getItem("ll_active_sos");
    const localBloodRes = localStorage.getItem("ll_blood_res");
    const localHospBook = localStorage.getItem("ll_hosp_book");
    const localSim = localStorage.getItem("ll_sim");

    setHospitals(localHospitals ? JSON.parse(localHospitals) : initialHospitals);
    setBloodBanks(localBloodBanks ? JSON.parse(localBloodBanks) : initialBloodBanks);
    setAmbulances(localAmbulances ? JSON.parse(localAmbulances) : initialAmbulances);
    setHealthRecords(localRecords ? JSON.parse(localRecords) : initialHealthRecords);
    setIncidents(localIncidents ? JSON.parse(localIncidents) : initialIncidents);
    setSimulationMode((localSim as any) || "normal");

    if (localUser) {
      setCurrentUser(JSON.parse(localUser));
    } else {
      setCurrentUser(null);
    }

    if (localActiveSos) {
      setActiveSos(JSON.parse(localActiveSos));
    }
    if (localBloodRes) {
      setActiveBloodReservation(JSON.parse(localBloodRes));
    }
    if (localHospBook) {
      setActiveHospitalBooking(JSON.parse(localHospBook));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync to localStorage
  const saveState = (key: string, data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const updateHospitals = (newHosp: Hospital[]) => {
    setHospitals(newHosp);
    saveState("ll_hospitals", newHosp);
  };

  const updateBloodBanks = (newBlood: BloodBank[]) => {
    setBloodBanks(newBlood);
    saveState("ll_blood_banks", newBlood);
  };

  const updateAmbulances = (newAmbs: Ambulance[]) => {
    setAmbulances(newAmbs);
    saveState("ll_ambulances", newAmbs);
  };

  const updateHealthRecords = (newRecs: HealthRecord[]) => {
    setHealthRecords(newRecs);
    saveState("ll_records", newRecs);
  };

  const updateIncidentsList = (newInc: SosIncident[]) => {
    setIncidents(newInc);
    saveState("ll_incidents", newInc);
  };

  // Auth Operations
  const login = (name: string, email: string, phone: string, photo?: string) => {
    const session: UserSession = { full_name: name, email, phone, photoUrl: photo, isLoggedIn: true };
    setCurrentUser(session);
    saveState("lifeline_user", session);
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lifeline_user");
    }
  };

  const updateProfile = (name: string, phone: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, full_name: name, phone };
    setCurrentUser(updated);
    saveState("lifeline_user", updated);
  };

  // SOS Simulation Lifecycle
  const triggerSos = (pickup: string, destination: string = "") => {
    const id = generateTicket("SOS");
    const newState: ActiveSosState = {
      id,
      status: "countdown",
      countdown: 3,
      step: 0,
      eta: simulationMode === "surge" ? "14 min" : "6 min",
      ambulanceId: "ALI-203",
      pickupLocation: pickup || "Current Coordinates",
      destinationHospital: destination || "Nearest Trauma Center (Fortis Hospital)",
    };
    setActiveSos(newState);
    saveState("ll_active_sos", newState);
  };

  const cancelSos = () => {
    const newState: ActiveSosState = {
      ...activeSos,
      id: null,
      status: "idle",
      countdown: 3,
      step: 0,
    };
    setActiveSos(newState);
    saveState("ll_active_sos", newState);
  };

  const advanceSosStep = () => {
    if (activeSos.status !== "active") return;
    const nextStep = activeSos.step + 1;
    let nextStatus = activeSos.status;
    
    const updatedSos = { ...activeSos, step: nextStep };
    
    // Auto add timeline logs to Health Records upon completion milestones
    if (nextStep === 3) {
      // Pre-alert sent to destination hospital
      const match = hospitals.find(h => h.name.toLowerCase().includes("fortis"));
      if (match) {
        updateHospitalBeds(match.id, "decrement");
      }
    }
    
    if (nextStep === 4) {
      // Admitted
      addHealthRecord({
        date: new Date().toISOString().split("T")[0],
        type: "SOS Event",
        facility: activeSos.destinationHospital || "Fortis Emergency Hospital",
        summary: `Emergency SOS fully coordinated. Admitted via dispatched ambulance ALI-203 from ${activeSos.pickupLocation}. Evaluated and stabilized.`,
        doctor: "Dr. Meera Pillai (ER Triage Captain)",
      });
      
      // Update in active incident list
      if (activeSos.id) {
        const updatedList = incidents.map(inc => 
          inc.id === activeSos.id ? { ...inc, status: "resolved" as const } : inc
        );
        updateIncidentsList(updatedList);
      }
    }

    setActiveSos(updatedSos);
    saveState("ll_active_sos", updatedSos);
  };

  const resolveSos = () => {
    const newState: ActiveSosState = {
      ...activeSos,
      status: "resolved",
      id: null,
      step: 0,
    };
    setActiveSos(newState);
    saveState("ll_active_sos", newState);
  };

  // SOS Countdown countdown tick handler
  useEffect(() => {
    if (activeSos.status !== "countdown") return;
    
    if (activeSos.countdown === 0) {
      // Active dispatch
      const id = activeSos.id || generateTicket("SOS");
      const activated: ActiveSosState = {
        ...activeSos,
        id,
        status: "active",
        step: 0,
      };
      setActiveSos(activated);
      saveState("ll_active_sos", activated);
      
      // Dispatch ambulance
      const updatedAmbs = ambulances.map(a => 
        a.id === "ALI-203" ? { ...a, status: "en-route" as const } : a
      );
      updateAmbulances(updatedAmbs);

      // Add to live Incident registry
      const newInc: SosIncident = {
        id,
        location: activeSos.pickupLocation,
        time: "Just now",
        status: "active",
        type: "Critical Cardiac Support",
      };
      updateIncidentsList([newInc, ...incidents]);
      return;
    }

    const timer = setTimeout(() => {
      const ticked = { ...activeSos, countdown: activeSos.countdown - 1 };
      setActiveSos(ticked);
      saveState("ll_active_sos", ticked);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSos.status, activeSos.countdown]);

  // Simulated auto-advancement of Active SOS
  useEffect(() => {
    if (activeSos.status !== "active" || activeSos.step >= 4) return;
    
    const interval = setTimeout(() => {
      advanceSosStep();
    }, 8000); // advance milestone every 8s for live demo feel
    
    return () => clearTimeout(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSos.status, activeSos.step]);

  // Ambulance Booking Action
  const bookAmbulance = (ambulanceId: string, pickup: string, destination: string) => {
    const ticketId = generateTicket("LL-AMB");
    
    // Set ambulance to busy
    const updated = ambulances.map(a => 
      a.id === ambulanceId ? { ...a, status: "busy" as const } : a
    );
    updateAmbulances(updated);

    // Create a health timeline event
    addHealthRecord({
      date: new Date().toISOString().split("T")[0],
      type: "ER Visit",
      facility: destination || "Trauma Center",
      summary: `Ambulance unit ${ambulanceId} booked manually for transfer from ${pickup} to ${destination}. Transfer complete.`,
      doctor: "Emergency Operator",
    });

    return ticketId;
  };

  // Blood Reservation
  const reserveBlood = (bankId: number, group: string, patient: string, hospital: string) => {
    const ticketId = generateTicket("LL-BLD");
    
    // Decrement inventory by 1
    const updatedBanks = bloodBanks.map(bank => {
      if (bank.id === bankId) {
        const currentStock = bank.stock[group] || 0;
        return {
          ...bank,
          stock: {
            ...bank.stock,
            [group]: Math.max(0, currentStock - 1),
          }
        };
      }
      return bank;
    });
    updateBloodBanks(updatedBanks);

    // Start a active courier progress
    const res: ActiveBloodReservation = {
      ticketId,
      bankId,
      bloodGroup: group,
      patientName: patient,
      hospitalName: hospital,
      status: "dispatched",
      elapsedSeconds: 0,
    };
    setActiveBloodReservation(res);
    saveState("ll_blood_res", res);

    // Timeline event
    addHealthRecord({
      date: new Date().toISOString().split("T")[0],
      type: "Blood Transfusion",
      facility: hospital,
      summary: `Blood pack (${group}) requested from ${bloodBanks.find(b => b.id === bankId)?.name}. Dispatched via secure motorcycle courier, cold-chain verification secured.`,
      doctor: "Blood Bank Officer",
    });

    return ticketId;
  };

  // Courier Progress simulation
  useEffect(() => {
    if (!activeBloodReservation) return;
    
    if (activeBloodReservation.elapsedSeconds >= 40) {
      // Completed delivery!
      return;
    }

    const timer = setInterval(() => {
      const nextSec = activeBloodReservation.elapsedSeconds + 1;
      let nextStatus = activeBloodReservation.status;

      if (nextSec >= 30) {
        nextStatus = "delivered";
      } else if (nextSec >= 20) {
        nextStatus = "out-for-delivery";
      } else if (nextSec >= 10) {
        nextStatus = "en-route";
      }

      const updated = {
        ...activeBloodReservation,
        elapsedSeconds: nextSec,
        status: nextStatus,
      };
      setActiveBloodReservation(updated);
      saveState("ll_blood_res", updated);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBloodReservation]);

  const updateBloodReservationTime = () => {
    // Manually push courier forward if desired
  };

  const clearBloodReservation = () => {
    setActiveBloodReservation(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ll_blood_res");
    }
  };

  // Hospital ER booking
  const bookHospitalSlot = (hospitalId: number, symptom: string, urgency: string) => {
    const ticketId = generateTicket("LL-ER");

    // Book bed
    updateHospitalBeds(hospitalId, "decrement");

    const booking: ActiveHospitalBooking = {
      ticketId,
      hospitalId,
      symptom,
      urgency,
      status: "queued",
      queueEta: urgency === "emergency" ? 4 : urgency === "urgent" ? 15 : 45,
    };
    setActiveHospitalBooking(booking);
    saveState("ll_hosp_book", booking);

    // Health Record
    const hospName = hospitals.find(h => h.id === hospitalId)?.name || "Emergency Hospital";
    addHealthRecord({
      date: new Date().toISOString().split("T")[0],
      type: "ER Visit",
      facility: hospName,
      summary: `Pre-booked ER emergency consultation slot for symptom: "${symptom}". Pre-registration ticket issued: ${ticketId}.`,
      doctor: "ER Admissions Officer",
    });

    return ticketId;
  };

  const clearHospitalBooking = () => {
    setActiveHospitalBooking(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ll_hosp_book");
    }
  };

  // General Record Insertion
  const addHealthRecord = (record: Omit<HealthRecord, "id">) => {
    const newRecord: HealthRecord = {
      ...record,
      id: generateTicket("HR").split("-")[1], // Simple ID format
    };
    const updated = [newRecord, ...healthRecords];
    updateHealthRecords(updated);
  };

  const updateHospitalBeds = (hospitalId: number, action: "increment" | "decrement") => {
    const updated = hospitals.map(h => {
      if (h.id === hospitalId) {
        const bedsMatch = h.beds.match(/\d+/);
        if (bedsMatch) {
          const currentBeds = parseInt(bedsMatch[0]);
          const newBedsCount = action === "decrement" ? Math.max(0, currentBeds - 1) : currentBeds + 1;
          return {
            ...h,
            beds: `${newBedsCount} available`,
          };
        }
      }
      return h;
    });
    updateHospitals(updated);
  };

  const acceptSosIncident = (incidentId: string, hospitalId: number) => {
    // Set incident status to resolved
    const updatedInc = incidents.map(inc => 
      inc.id === incidentId ? { ...inc, status: "resolved" as const } : inc
    );
    updateIncidentsList(updatedInc);

    // Update hospital beds
    updateHospitalBeds(hospitalId, "decrement");

    // Force active SOS (if it matches) to resolve / update its status
    if (activeSos.id === incidentId) {
      const finalSos: ActiveSosState = {
        ...activeSos,
        step: 4, // Patient Admitted
      };
      setActiveSos(finalSos);
      saveState("ll_active_sos", finalSos);
    }
  };

  // Platform simulation controller
  const setSimulation = (mode: "normal" | "surge" | "drill") => {
    setSimulationMode(mode);
    saveState("ll_sim", mode);
    
    if (mode === "surge") {
      // Modify ambulance ETAs to be longer and blood banks to have scarcer stocks
      const longerETAs = ambulances.map(a => ({
        ...a,
        eta: a.eta !== "—" ? `${parseInt(a.eta) + 8} min` : "—",
      }));
      updateAmbulances(longerETAs);
    } else if (mode === "drill") {
      // Create 3 simulated active incident pre-notes immediately
      const newDrillIncidents: SosIncident[] = [
        { id: generateTicket("SOS"), location: "Indiranagar Flat A", time: "Just now", status: "active", type: "Respiratory Arrest Drill" },
        { id: generateTicket("SOS"), location: "Madiwala Junction", time: "1 min ago", status: "active", type: "Mass Casualty Drill" },
        { id: generateTicket("SOS"), location: "Whitefield Sec 2", time: "2 min ago", status: "active", type: "Anaphylaxis Drill" },
      ];
      updateIncidentsList([...newDrillIncidents, ...incidents]);
    } else {
      // Back to original
      updateAmbulances(initialAmbulances);
    }
  };

  const addIncident = (type: string, location: string) => {
    const id = generateTicket("SOS");
    const newInc: SosIncident = {
      id,
      location,
      time: "Just now",
      status: "active",
      type,
    };
    updateIncidentsList([newInc, ...incidents]);
  };

  const resetDatabase = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <LifelineContext.Provider
      value={{
        hospitals,
        bloodBanks,
        ambulances,
        healthRecords,
        incidents,
        activeSos,
        activeBloodReservation,
        activeHospitalBooking,
        currentUser,
        simulationMode,
        login,
        logout,
        updateProfile,
        triggerSos,
        cancelSos,
        advanceSosStep,
        resolveSos,
        bookAmbulance,
        reserveBlood,
        updateBloodReservationTime,
        clearBloodReservation,
        bookHospitalSlot,
        clearHospitalBooking,
        addHealthRecord,
        updateHospitalBeds,
        acceptSosIncident,
        setSimulation,
        addIncident,
        resetDatabase,
      }}
    >
      {children}
    </LifelineContext.Provider>
  );
}

export function useLifeline() {
  const context = useContext(LifelineContext);
  if (!context) {
    throw new Error("useLifeline must be used within a LifelineProvider");
  }
  return context;
}
