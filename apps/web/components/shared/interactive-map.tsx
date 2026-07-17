"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Building2, Droplet, Navigation, Car, AlertTriangle, Activity } from "lucide-react";
import { useLifeline } from "@/lib/state-engine";
import { useTheme } from "next-themes";

interface NodePosition {
  id: string | number;
  type: "hospital" | "blood-bank" | "ambulance" | "patient" | "courier";
  name: string;
  x: number; // percentage coordinate 0-100 for SVG fallback
  y: number; // percentage coordinate 0-100 for SVG fallback
  status?: string;
  details?: string;
}

interface MapProps {
  onNodeClick?: (type: "hospital" | "blood-bank", id: any) => void;
  selectedNodeId?: any;
}

export function InteractiveMap({ onNodeClick, selectedNodeId }: MapProps) {
  const { hospitals, bloodBanks, activeSos, activeBloodReservation, activeHospitalBooking } = useLifeline();
  const { resolvedTheme } = useTheme();
  
  const [hoveredNode, setHoveredNode] = useState<NodePosition | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9120, lng: 77.6380 }); // Default Bengaluru South
  const [locationName, setLocationName] = useState<string>("Bengaluru South (Default)");
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(false);

  const mapContainerId = "real-leaflet-map-canvas";
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Static list for hospital and blood bank locations relative to patient (lat, lng)
  const mapNodes: NodePosition[] = [
    // Hospitals
    { id: 1, type: "hospital", name: "Fortis Emergency Hospital", x: 25, y: 35, details: "Level 1 Trauma • 1.2 km" },
    { id: 2, type: "hospital", name: "Apollo Cardiac Specialty", x: 72, y: 22, details: "Cardiac Emergency • 2.8 km" },
    { id: 3, type: "hospital", name: "St. John's General Emergency", x: 45, y: 65, details: "General ER • 3.5 km" },
    { id: 4, type: "hospital", name: "HSR Emergency Clinic", x: 62, y: 78, details: "Triage & Urgent Care • 1.5 km" },
    { id: 5, type: "hospital", name: "Manipal Hospital Hal Road", x: 80, y: 55, details: "Multi-specialty • 5.1 km" },
    { id: 6, type: "hospital", name: "Narayana Health City", x: 15, y: 85, details: "Pediatric Emergency • 8.4 km" },

    // Blood Banks
    { id: 101, type: "blood-bank", name: "Lifeline Central Blood Bank", x: 38, y: 48, details: "Sector 3 • 2.1 km" },
    { id: 102, type: "blood-bank", name: "Red Cross Donor Station", x: 55, y: 15, details: "Koramangala • 3.7 km" },
    { id: 103, type: "blood-bank", name: "St. John's Hospital Blood Bank", x: 48, y: 65, details: "Sarjapur Rd • 3.5 km" },
    { id: 104, type: "blood-bank", name: "Rotary TTK Blood Center", x: 88, y: 42, details: "Indiranagar • 6.2 km" },
  ];

  // Citizen center point for SVG fallback
  const patientPos = { x: 50, y: 50 };

  // 1. Get real coordinates of the user via Browser Geolocation API
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setIsLoadingLocation(false);
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setCoords({ lat, lng });
      setIsLoadingLocation(false);

      // Simple reverse-geocoding via openstreetmap public API to extract custom location info
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.suburb || "My Location";
            const road = data.address.road || "";
            setLocationName(road ? `${road}, ${city}` : city);
          } else {
            setLocationName(`${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
          }
        })
        .catch(() => {
          setLocationName(`${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
        });
    };

    const errorHandler = () => {
      setIsLoadingLocation(false);
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, []);

  // 2. Load Leaflet script & stylesheet from CDN programmatically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setLeafletLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).L) {
        setLeafletLoaded(true);
      }
    }
  }, []);

  // 3. Initialize & Sync Leaflet Map Instance
  useEffect(() => {
    if (!leafletLoaded || typeof window === "undefined" || !(window as any).L) return;
    const L = (window as any).L;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    // Initialize map if not loaded
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerId, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
    } else {
      // Pan to new coordinate when user updates position
      mapRef.current.setView([coords.lat, coords.lng], 14);
    }

    // Draw Map Markers and Overlays
    // Clear old markers
    markersRef.current.forEach((marker) => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Create dynamic node positions relative to the current center coordinates
    const scaleFactorLat = 0.0004; // scaling factor to distribute nearby hospitals around citizen
    const scaleFactorLng = 0.0006;

    // Add Patient Marker
    const userMarkerIcon = L.divIcon({
      className: "custom-leaflet-marker-user-icon",
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute h-10 w-10 rounded-full bg-red-500/25 dark:bg-red-500/35 animate-ping"></span>
          <span class="absolute h-6 w-6 rounded-full bg-red-500/40 animate-pulse"></span>
          <div class="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 border-2 border-white shadow-lg">
            <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const userMarker = L.marker([coords.lat, coords.lng], { icon: userMarkerIcon }).addTo(mapRef.current);
    markersRef.current.push(userMarker);

    // Add Hospitals and Blood banks relative to Center Coords
    mapNodes.forEach((node) => {
      // Calculate real offsets relative to coordinates
      const nodeLat = coords.lat + (node.y - 50) * scaleFactorLat;
      const nodeLng = coords.lng + (node.x - 50) * scaleFactorLng;
      const isSelected = selectedNodeId === node.id;

      const markerHtml = node.type === "hospital"
        ? `
          <div class="relative flex items-center justify-center h-8 w-8 rounded-2xl border shadow-md transition-all duration-300 ${
            isSelected 
              ? "bg-emerald-600 text-white border-white scale-110 shadow-emerald-500/30" 
              : "bg-white text-emerald-600 border-slate-200 dark:bg-zinc-900 dark:text-emerald-400 dark:border-zinc-800"
          }">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center h-8 w-8 rounded-2xl border shadow-md transition-all duration-300 ${
            isSelected 
              ? "bg-red-600 text-white border-white scale-110 shadow-red-500/30" 
              : "bg-white text-red-500 border-slate-200 dark:bg-zinc-900 dark:text-red-500 dark:border-zinc-800"
          }">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fill-current"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
          </div>
        `;

      const nodeIcon = L.divIcon({
        className: `custom-leaflet-node-${node.id}`,
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([nodeLat, nodeLng], { icon: nodeIcon }).addTo(mapRef.current);
      
      marker.on("mouseover", () => {
        setHoveredNode(node);
      });
      marker.on("mouseout", () => {
        setHoveredNode(null);
      });
      marker.on("click", () => {
        onNodeClick?.(node.type as any, node.id);
      });

      markersRef.current.push(marker);
    });

    // Draw active SOS Ambulance dispatch on streets
    if (activeSos.status === "active") {
      const ambulanceIcon = L.divIcon({
        className: "custom-leaflet-marker-ambulance",
        html: `
          <div class="relative flex items-center justify-center h-8 w-8 rounded-full border-2 border-white bg-red-600 text-white shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const startLat = coords.lat - 0.012;
      const startLng = coords.lng - 0.015;
      const progressFactor = Math.min(1, activeSos.step / 4);
      const ambLat = startLat + (coords.lat - startLat) * progressFactor;
      const ambLng = startLng + (coords.lng - startLng) * progressFactor;

      const ambMarker = L.marker([ambLat, ambLng], { icon: ambulanceIcon }).addTo(mapRef.current);
      markersRef.current.push(ambMarker);

      const routeLine = L.polyline([
        [startLat, startLng],
        [coords.lat, coords.lng]
      ], {
        color: "#ef4444",
        weight: 3,
        dashArray: "5, 8",
        opacity: 0.8,
      }).addTo(mapRef.current);
      markersRef.current.push(routeLine);
    }

    // Draw active blood courier path
    if (activeBloodReservation && activeBloodReservation.status !== "delivered") {
      const courierIcon = L.divIcon({
        className: "custom-leaflet-marker-courier",
        html: `
          <div class="relative flex items-center justify-center h-7 w-7 rounded-full border-2 border-white bg-cyan-600 text-white shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="fill-current"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const originBank = mapNodes.find((n) => n.id === activeBloodReservation.bankId);
      if (originBank) {
        const bankLat = coords.lat + (originBank.y - 50) * scaleFactorLat;
        const bankLng = coords.lng + (originBank.x - 50) * scaleFactorLng;
        const pct = Math.min(1, activeBloodReservation.elapsedSeconds / 30);
        const courierLat = bankLat + (coords.lat - bankLat) * pct;
        const courierLng = bankLng + (coords.lng - bankLng) * pct;

        const courierMarker = L.marker([courierLat, courierLng], { icon: courierIcon }).addTo(mapRef.current);
        markersRef.current.push(courierMarker);

        const courierRouteLine = L.polyline([
          [bankLat, bankLng],
          [coords.lat, coords.lng]
        ], {
          color: "#06b6d4",
          weight: 3,
          dashArray: "4, 6",
          opacity: 0.7,
        }).addTo(mapRef.current);
        markersRef.current.push(courierRouteLine);
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLoaded, coords.lat, coords.lng, selectedNodeId, activeSos.status, activeSos.step, activeBloodReservation?.elapsedSeconds]);

  // 4. Update Tilelayer on resolvedTheme changes (dark mode tiles vs light mode tiles)
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !(window as any).L) return;
    const L = (window as any).L;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = resolvedTheme === "light"
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    const attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);
  }, [resolvedTheme, leafletLoaded]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-inner">
      
      {/* ── REAL LEAFLET MAP ELEMENT (Renders if leafletLoaded is true) ── */}
      <div 
        id={mapContainerId} 
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          leafletLoaded ? "opacity-100 z-10" : "opacity-0 -z-10"
        }`} 
      />

      {/* ── VECTOR SVG FALLBACK (Renders while leaflet CDN is loading) ── */}
      {!leafletLoaded && (
        <div className="absolute inset-0 w-full h-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M -20,250 C 40,230 110,290 150,300 C 180,310 240,240 280,260 C 320,280 340,320 380,310 C 420,300 480,250 520,280 C 560,310 610,340 680,330 L 700,500 L -50,500 Z" 
                  className="fill-cyan-500/5 dark:fill-cyan-500/10 transition-colors" />
            <path d="M 550,20 C 600,10 650,40 690,60 C 720,70 780,50 820,70 L 900,0 L 500,0 Z" 
                  className="fill-emerald-500/5 dark:fill-emerald-500/10 transition-colors" />

            <g stroke="rgba(148,163,184,0.15)" strokeWidth="6" strokeLinecap="round" className="dark:stroke-zinc-800/60">
              <line x1="50%" y1="0" x2="50%" y2="100%" />
              <line x1="0" y1="50%" x2="100%" y2="50%" />
              <line x1="0" y1="10%" x2="100%" y2="90%" strokeDasharray="10 15" strokeWidth="4" />
              <line x1="10%" y1="90%" x2="90%" y2="10%" strokeDasharray="10 15" strokeWidth="4" />
            </g>
          </svg>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <Activity className="h-8 w-8 text-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Locking GPS Satellite Link...</span>
          </div>
        </div>
      )}

      {/* ── MAP LEGEND HUD & TELEMETRY CONTROLS ───────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-black tracking-wide text-zinc-800 bg-white/90 dark:text-zinc-200 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-lg pointer-events-auto backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Map: {locationName}</span>
          </div>
          {activeSos.status === "active" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide bg-red-600 text-white animate-pulse shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>SOS LIVE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-full text-[10px] font-bold text-zinc-600 bg-white/90 dark:text-zinc-300 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-lg backdrop-blur">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Bed Hub</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Blood</span>
        </div>
      </div>

      {/* ── Vector Nodes (Only when Leaflet fallback is active) ────── */}
      {!leafletLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute" style={{ left: `${patientPos.x}%`, top: `${patientPos.y}%`, transform: "translate(-50%, -50%)" }}>
            <span className="absolute h-8 w-8 rounded-full bg-red-500/20 animate-pulse" />
            <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Tooltip on node hover ─────────────────── */}
      {hoveredNode && (
        <div className="absolute z-30 pointer-events-none p-3.5 max-w-xs rounded-2xl bg-zinc-950/95 text-white border border-zinc-800 shadow-2xl backdrop-blur-md"
             style={{ 
               left: `${hoveredNode.x}%`, 
               top: `${Math.max(15, hoveredNode.y - 15)}%`, 
               transform: "translate(-50%, -100%)" 
             }}>
          <p className="text-xs font-black tracking-tight">{hoveredNode.name}</p>
          <p className="mt-0.5 text-[10px] text-zinc-400 font-semibold">{hoveredNode.details}</p>
          <div className="mt-1.5 flex items-center gap-1 font-black text-[8px] uppercase tracking-wider text-emerald-400">
            <span>Tap node to coordinate routing</span>
          </div>
        </div>
      )}

      {/* ── Leaflet Custom Overrides ── */}
      <style jsx global>{`
        .leaflet-container {
          background: transparent !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 2 !important;
        }
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-marker-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
