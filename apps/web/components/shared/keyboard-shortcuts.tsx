"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLifeline } from "@/lib/state-engine";
import { playDigitalBeep, playSuccessChime, stopEmergencySiren } from "@/lib/audio-tones";
import { 
  Siren, ShieldAlert, X, Compass, Droplet, Activity, 
  ClipboardList, HelpCircle, AlertCircle, Info, Keyboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeSos, triggerSos, cancelSos } = useLifeline();

  // Dialog and holding state
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHoldingSpace, setIsHoldingSpace] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const holdTimerRef = useRef<any>(null);
  const startHoldingTimeRef = useRef<number>(0);
  const lastAnnouncedSecondRef = useRef<number>(-1);

  // Focus trap ref for the help dialog accessibility
  const dialogRef = useRef<HTMLDivElement>(null);

  // Sound enable reference (local toggle or simply stopping if active)
  const isTyping = () => {
    if (typeof document === "undefined") return false;
    const activeEl = document.activeElement;
    if (!activeEl) return false;
    const tagName = activeEl.tagName.toLowerCase();
    return (
      tagName === "input" ||
      tagName === "textarea" ||
      activeEl.getAttribute("contenteditable") === "true"
    );
  };

  // Setup Keydown and Keyup Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ignore shortcuts if user is typing in a form input
      if (isTyping()) return;

      const key = e.key.toLowerCase();

      // 2. Spacebar SOS holding trigger
      if (e.key === " " || e.code === "Space") {
        e.preventDefault(); // Prevent scrolling page when holding spacebar
        if (!isHoldingSpace && activeSos.status === "idle") {
          setIsHoldingSpace(true);
          setHoldProgress(0);
          playDigitalBeep();
          startHoldingTimeRef.current = Date.now();
          lastAnnouncedSecondRef.current = -1;
          setAnnouncement("Emergency SOS countdown initiated. Keep holding spacebar to dispatch.");

          holdTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startHoldingTimeRef.current;
            const progress = Math.min(100, (elapsed / 3000) * 100);
            setHoldProgress(progress);

            // Announce seconds remaining for screen readers
            const secondsRemaining = Math.ceil((3000 - elapsed) / 1000);
            if (secondsRemaining > 0 && secondsRemaining !== lastAnnouncedSecondRef.current) {
              lastAnnouncedSecondRef.current = secondsRemaining;
              setAnnouncement(`SOS Dispatching in ${secondsRemaining} seconds. Keep holding Spacebar.`);
              playDigitalBeep();
            }

            if (progress >= 100) {
              clearInterval(holdTimerRef.current);
              holdTimerRef.current = null;
              setIsHoldingSpace(false);
              setHoldProgress(0);
              triggerSos("HSR Layout Sector 4, Bengaluru");
              playSuccessChime();
              setAnnouncement("Emergency SOS broadcast activated! Ambulance dispatched and trauma station notified.");
              router.push("/sos");
            }
          }, 50);
        }
        return;
      }

      // 3. Escape key to Cancel active SOS or Close help modal
      if (e.key === "Escape" || e.key === "Esc") {
        if (isHelpOpen) {
          setIsHelpOpen(false);
          setAnnouncement("Help menu closed.");
          e.preventDefault();
          return;
        }
        if (activeSos.status === "countdown" || activeSos.status === "active") {
          cancelSos();
          stopEmergencySiren();
          playDigitalBeep();
          setAnnouncement("Emergency SOS Aborted. Reverting all dispatch systems.");
          e.preventDefault();
        }
        return;
      }

      // 4. Help Dialog shortcuts (? or K)
      if (key === "k" || e.key === "?") {
        e.preventDefault();
        setIsHelpOpen((prev) => {
          const next = !prev;
          setAnnouncement(next ? "Keyboard shortcuts help menu opened. Use Tab to navigate. Press Escape to close." : "Help menu closed.");
          return next;
        });
        playDigitalBeep();
        return;
      }

      // 5. Navigation Shortcuts (H, B, A, M)
      if (key === "h") {
        e.preventDefault();
        setAnnouncement("Navigating to Hospitals and ICU Beds.");
        playDigitalBeep();
        router.push("/hospitals");
        return;
      }
      if (key === "b") {
        e.preventDefault();
        setAnnouncement("Navigating to Blood Matcher registries.");
        playDigitalBeep();
        router.push("/blood-banks");
        return;
      }
      if (key === "a") {
        e.preventDefault();
        setAnnouncement("Navigating to Ambulance Fleet control.");
        playDigitalBeep();
        router.push("/ambulance");
        return;
      }
      if (key === "m") {
        e.preventDefault();
        setAnnouncement("Navigating to Continuous Medical Ledgers.");
        playDigitalBeep();
        router.push("/health-records");
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        if (isHoldingSpace) {
          setIsHoldingSpace(false);
          setHoldProgress(0);
          setAnnouncement("SOS dispatch canceled.");
          if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
          }
          playDigitalBeep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [isHoldingSpace, activeSos.status, isHelpOpen, triggerSos, cancelSos, router]);

  // Handle custom event to open keyboard shortcuts help
  useEffect(() => {
    const handleOpenHelp = () => {
      setIsHelpOpen(true);
      setAnnouncement("Keyboard shortcuts help menu opened. Use Tab to navigate. Press Escape to close.");
    };
    window.addEventListener("open-keyboard-shortcuts-help", handleOpenHelp);
    return () => window.removeEventListener("open-keyboard-shortcuts-help", handleOpenHelp);
  }, []);

  // Handle focus lock when help dialog is open
  useEffect(() => {
    if (isHelpOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isHelpOpen]);

  const shortcutsList = [
    { key: "SPACE (HOLD)", desc: "Trigger Emergency SOS countdown from any page", action: "Starts dispatch sequence" },
    { key: "ESCAPE (ESC)", desc: "Abort pending countdown or resolve active SOS", action: "Instantly aborts" },
    { key: "K or ?", desc: "Toggle keyboard shortcuts help dialog", action: "Opens / Closes Help" },
    { key: "H", desc: "Instantly navigate to Hospitals and ICU Beds page", action: "Reroutes to Hospitals" },
    { key: "B", desc: "Instantly navigate to Blood Matcher inventories", action: "Reroutes to Blood Banks" },
    { key: "A", desc: "Instantly navigate to Ambulance Fleet dispatcher", action: "Reroutes to Ambulance" },
    { key: "M", desc: "Instantly navigate to Continuous Medical Ledger Records", action: "Reroutes to Health Care" },
  ];

  return (
    <Fragment>
      {/* Screen Reader Announcements for Accessibility */}
      <div 
        role="status" 
        aria-live="assertive" 
        className="sr-only"
        style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }}
      >
        {announcement}
      </div>

      {/* Screen-reader documentation block injected on top of body */}
      <div className="sr-only">
        <h2>Emergency Keyboard Shortcuts</h2>
        <p>This application implements critical desktop keyboard shortcuts for zero-margin safety scenarios. Keyboard operations are disabled when typing in input boxes.</p>
        <ul>
          {shortcutsList.map((item) => (
            <li key={item.key}>
              Press <strong>{item.key}</strong> to {item.desc}. (Action: {item.action})
            </li>
          ))}
        </ul>
      </div>

      {/* Hold Spacebar Global Overlay HUD */}
      <AnimatePresence>
        {isHoldingSpace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md p-6 text-center select-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-hold-sos-title"
          >
            {/* Glowing Emergency Background elements */}
            <div className="absolute h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[100px] animate-pulse pointer-events-none" />
            
            <div className="relative max-w-lg space-y-8 z-10">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-500 relative">
                <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                <Siren size={48} className="animate-pulse" />
              </div>

              <div className="space-y-3">
                <h2 
                  id="global-hold-sos-title" 
                  className="text-4xl font-black tracking-tight text-white uppercase"
                >
                  TRANSMITTING EMERGENCY SOS
                </h2>
                <p className="text-sm font-black uppercase tracking-widest text-red-400">
                  Hold Spacebar for 3 seconds to activate dispatch
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Broadcasting encrypted geofence coordinates and launching tactical ambulance fleets. Release the Spacebar immediately to abort.
                </p>
              </div>

              {/* Progress visual feedback */}
              <div className="relative w-full max-w-xs mx-auto h-4 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                  style={{ width: `${holdProgress}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>

              {/* Remaining seconds visual text */}
              <p className="font-mono text-5xl font-black text-red-500 tracking-tighter">
                {Math.ceil((3000 - (holdProgress / 100) * 3000) / 1000)}s
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts interactive documentation Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4">
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl relative"
              role="dialog"
              aria-modal="true"
              aria-labelledby="shortcuts-dialog-title"
              aria-describedby="shortcuts-dialog-desc"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playDigitalBeep();
                  setIsHelpOpen(false);
                  setAnnouncement("Help menu closed.");
                }}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
                aria-label="Close shortcuts dialog"
              >
                <X size={14} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 border border-red-500/10">
                  <Keyboard size={20} />
                </div>
                <div>
                  <h2 
                    id="shortcuts-dialog-title" 
                    className="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white"
                  >
                    Emergency Keyboard Command shortcuts
                  </h2>
                  <p 
                    id="shortcuts-dialog-desc" 
                    className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5"
                  >
                    Zero-margin, high-accessibility keyboard shortcuts designed for rapid emergency access.
                  </p>
                </div>
              </div>

              {/* Shortcuts list table */}
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {shortcutsList.map((item) => (
                  <div 
                    key={item.key} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/30"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-block shrink-0 rounded-lg px-2 py-1 text-[9px] font-black font-mono uppercase border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 shadow-sm">
                        {item.key}
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick info footer */}
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 p-4 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
                <Info size={14} className="text-zinc-400 shrink-0" />
                <p>
                  To use, ensure you are not focused inside any text inputs, typing fields, or search boxes. Press <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[9px]">Esc</kbd> anytime to close this helper card.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
