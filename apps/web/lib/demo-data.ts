export type Hospital = {
  id: number;
  name: string;
  distance: string;
  type: "hospitals" | "clinics";
  beds: string;
  rating: string;
  phone: string;
  tag: string;
  address: string;
  erWait: string;
};

export type BloodBank = {
  id: number;
  name: string;
  distance: string;
  address: string;
  stock: Record<string, number>;
  phone: string;
};

export type Ambulance = {
  id: string;
  unit: string;
  driver: string;
  status: "available" | "en-route" | "busy";
  eta: string;
  distance: string;
  type: string;
};

export type HealthRecord = {
  id: string;
  date: string;
  type: string;
  facility: string;
  summary: string;
  doctor: string;
};

export type Volunteer = {
  id: number;
  name: string;
  skill: string;
  distance: string;
  status: "active" | "standby" | "offline";
  missions: number;
};

export type SosIncident = {
  id: string;
  location: string;
  time: string;
  status: "active" | "resolved" | "dispatched";
  type: string;
};

export const hospitals: Hospital[] = [
  { id: 1, name: "Fortis Emergency Hospital", distance: "1.2 km", type: "hospitals", beds: "12 available", rating: "4.9", phone: "+91 80 4111 6000", tag: "Level 1 Trauma", address: "154/9, Bannerghatta Road", erWait: "8 min" },
  { id: 2, name: "Apollo Cardiac Specialty", distance: "2.8 km", type: "hospitals", beds: "3 available", rating: "4.8", phone: "+91 80 2630 4050", tag: "Cardiac Emergency", address: "154/11, Bannerghatta Road", erWait: "15 min" },
  { id: 3, name: "St. John's General Emergency", distance: "3.5 km", type: "hospitals", beds: "24 available", rating: "4.6", phone: "+91 80 2206 5000", tag: "General ER", address: "Sarjapur Road, Koramangala", erWait: "5 min" },
  { id: 4, name: "HSR Emergency Clinic", distance: "1.5 km", type: "clinics", beds: "5 available", rating: "4.7", phone: "+91 80 4321 0987", tag: "Triage & Urgent Care", address: "HSR Layout Sector 2", erWait: "3 min" },
  { id: 5, name: "Manipal Hospital Hal Road", distance: "5.1 km", type: "hospitals", beds: "15 available", rating: "4.9", phone: "+91 80 2502 4444", tag: "Multi-specialty", address: "98, HAL Airport Road", erWait: "12 min" },
  { id: 6, name: "Narayana Health City", distance: "8.4 km", type: "hospitals", beds: "32 available", rating: "4.8", phone: "+91 80 7122 2222", tag: "Pediatric Emergency", address: "258/A, Bommasandra", erWait: "6 min" },
];

export const bloodBanks: BloodBank[] = [
  { id: 101, name: "Lifeline Central Blood Bank", distance: "2.1 km", address: "HSR Layout Sector 3", stock: { "O-": 8, "O+": 24, "A+": 12, "AB-": 2, "A-": 6, "B+": 18, "B-": 4, "AB+": 3 }, phone: "+91 99000 12345" },
  { id: 102, name: "Red Cross Donor Station", distance: "3.7 km", address: "Koramangala 5th Block", stock: { "O-": 4, "O+": 15, "A-": 8, "B+": 9, "A+": 10, "B-": 3, "AB+": 1, "AB-": 0 }, phone: "+91 99000 54321" },
  { id: 103, name: "St. John's Hospital Blood Bank", distance: "3.5 km", address: "Sarjapur Road", stock: { "O-": 11, "O+": 42, "AB+": 6, "B-": 5, "A+": 20, "A-": 7, "B+": 14, "AB-": 2 }, phone: "+91 80 2206 5120" },
  { id: 104, name: "Rotary TTK Blood Center", distance: "6.2 km", address: "Indiranagar", stock: { "O-": 0, "O+": 28, "B+": 19, "A+": 14, "A-": 5, "B-": 2, "AB+": 4, "AB-": 1 }, phone: "+91 80 2528 7903" },
];

export const ambulances: Ambulance[] = [
  { id: "ALI-203", unit: "ALI-203", driver: "Rajesh Kumar", status: "available", eta: "6 min", distance: "1.8 km", type: "Advanced Life Support" },
  { id: "BLR-891", unit: "BLR-891", driver: "Suresh Nair", status: "available", eta: "9 min", distance: "3.2 km", type: "Basic Life Support" },
  { id: "KAR-445", unit: "KAR-445", driver: "Anita Devi", status: "en-route", eta: "—", distance: "—", type: "Neonatal Transport" },
  { id: "IND-112", unit: "IND-112", driver: "Mohammed Ali", status: "available", eta: "11 min", distance: "4.5 km", type: "Cardiac Unit" },
];

export const bloodGroups = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;

export const healthRecords: HealthRecord[] = [
  { id: "HR-001", date: "2026-06-28", type: "ER Visit", facility: "Fortis Emergency Hospital", summary: "Chest pain evaluation — ECG normal, discharged stable", doctor: "Dr. Meera Pillai" },
  { id: "HR-002", date: "2026-05-14", type: "Lab Report", facility: "Apollo Diagnostics", summary: "Complete blood count — all values within normal range", doctor: "Dr. Arjun Reddy" },
  { id: "HR-003", date: "2026-04-02", type: "Prescription", facility: "HSR Emergency Clinic", summary: "Antibiotics course for respiratory infection — 7 days", doctor: "Dr. Kavitha Rao" },
  { id: "HR-004", date: "2026-02-18", type: "SOS Event", facility: "LIFELINE Network", summary: "SOS triggered — ambulance ALI-203 dispatched, resolved in 12 min", doctor: "System Log" },
  { id: "HR-005", date: "2025-12-10", type: "Blood Transfusion", facility: "St. John's Hospital", summary: "2 units O+ administered — post-surgery recovery", doctor: "Dr. Sanjay Menon" },
];

export const volunteers: Volunteer[] = [
  { id: 1, name: "Priya Suresh", skill: "First Aid Certified", distance: "0.4 km", status: "active", missions: 47 },
  { id: 2, name: "Arun Patel", skill: "CPR + AED", distance: "0.8 km", status: "standby", missions: 23 },
  { id: 3, name: "Lakshmi Iyer", skill: "Nurse (Retired)", distance: "1.1 km", status: "active", missions: 89 },
  { id: 4, name: "Vikram Singh", skill: "Disaster Response", distance: "2.3 km", status: "offline", missions: 156 },
];

export const activeSosIncidents: SosIncident[] = [
  { id: "SOS-7821", location: "Koramangala 4th Block", time: "2 min ago", status: "dispatched", type: "Cardiac" },
  { id: "SOS-7820", location: "Indiranagar 100ft Road", time: "8 min ago", status: "active", type: "Road Accident" },
  { id: "SOS-7819", location: "HSR Layout Sector 7", time: "14 min ago", status: "resolved", type: "Fall Injury" },
];

export const featurePages = {
  "emergency-graph": {
    title: "Unified Emergency Graph",
    description: "Patients, responders, hospitals, blood banks, and authorities linked in one real-time operational mesh.",
    stats: [
      { label: "Connected Nodes", value: "24,680+" },
      { label: "Live Events/min", value: "340" },
      { label: "Avg Sync Latency", value: "82ms" },
    ],
    demoEvents: [
      { time: "08:42:01", event: "SOS-7821 triggered in Koramangala", type: "sos" },
      { time: "08:42:02", event: "3 hospitals notified within 1.2km radius", type: "hospital" },
      { time: "08:42:03", event: "Ambulance ALI-203 assigned to incident", type: "ambulance" },
      { time: "08:42:04", event: "Blood bank pre-alert sent (O+ stock confirmed)", type: "blood" },
      { time: "08:42:05", event: "District authority dashboard updated", type: "gov" },
    ],
  },
  "smart-routing": {
    title: "Smart Priority Routing",
    description: "AI-assisted triage and routing delivers the right resource to the right patient in the shortest time window.",
    stats: [
      { label: "Routing Accuracy", value: "96.4%" },
      { label: "Avg Decision Time", value: "1.8s" },
      { label: "Lives Saved (est.)", value: "12,400+" },
    ],
    routes: [
      { patient: "Cardiac arrest — Koramangala", ambulance: "IND-112 (Cardiac Unit)", hospital: "Apollo Cardiac", score: 98 },
      { patient: "Pediatric fall — HSR Layout", ambulance: "ALI-203 (ALS)", hospital: "Narayana Health", score: 94 },
      { patient: "Road accident — Indiranagar", ambulance: "BLR-891 (BLS)", hospital: "Fortis Emergency", score: 91 },
    ],
  },
  "blood-network": {
    title: "Blood Access Network",
    description: "Real-time inventory across 920+ donor centers with one-tap bag reservation and courier dispatch.",
    stats: [
      { label: "Partner Centers", value: "920+" },
      { label: "Units Available", value: "48,200" },
      { label: "Avg Dispatch Time", value: "22 min" },
    ],
  },
  "volunteer-mesh": {
    title: "Verified Volunteer Mesh",
    description: "On-ground volunteers geofenced and activated within seconds based on proximity and skill level.",
    stats: [
      { label: "Active Volunteers", value: "18,000+" },
      { label: "Avg Activation", value: "38s" },
      { label: "Missions Completed", value: "2.1M+" },
    ],
  },
  "government-control": {
    title: "Government Control Plane",
    description: "District-level dashboards with live disaster overlays, fleet tracking, and surge capacity heatmaps.",
    stats: [
      { label: "Districts Covered", value: "640+" },
      { label: "Live Dashboards", value: "312" },
      { label: "Incident Reports/day", value: "4,800" },
    ],
  },
  "care-timeline": {
    title: "Continuous Care Timeline",
    description: "Every event from SOS trigger to discharge stitched into a tamper-proof longitudinal health record.",
    stats: [
      { label: "Records Secured", value: "8.2M+" },
      { label: "Audit Events/day", value: "1.2M" },
      { label: "Data Integrity", value: "100%" },
    ],
  },
} as const;

export type FeatureSlug = keyof typeof featurePages;

export function generateTicket(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}
