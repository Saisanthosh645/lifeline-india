"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Sparkles, X, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { demoSignup, demoLogin, demoGoogleLogin, demoForgotPassword } from "@/lib/auth/demo-auth";
import { firebaseResolveRedirectLogin } from "@/lib/auth/firebase-auth";
import { useLifeline } from "@/lib/state-engine";

type Props = {
  open: boolean;
  mode: "login" | "signup";
  onClose: () => void;
  onModeChange: (mode: "login" | "signup") => void;
};

export function AuthModal({ open, onClose, mode, onModeChange }: Props) {
  const { login: engineLogin } = useLifeline();
  const [localMode, setLocalMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalMode(mode);
      setError("");
      setSuccess("");
    }
  }, [mode, open]);

  useEffect(() => {
    const finishRedirectLogin = async () => {
      if (!open) return;

      try {
        const user = await firebaseResolveRedirectLogin();
        if (!user) return;

        engineLogin(user.full_name, user.email, user.phone || "", user.photoUrl);
        onClose();

        if (typeof window !== "undefined" && window.location.pathname === "/auth") {
          window.location.href = "/profile";
        }
      } catch (err: any) {
        setError(err?.message || "Google sign-in could not be completed");
      }
    };

    void finishRedirectLogin();
  }, [engineLogin, onClose, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      if (localMode === "forgot") {
        if (!email) {
          setError("Enter your email address");
          setLoading(false);
          return;
        }
        await demoForgotPassword(email);
        setSuccess("A password reset email has been dispatched by Firebase! Check your inbox.");
      } else {
        let user;
        if (localMode === "signup") {
          if (!name || name.length < 2) {
            setError("Enter your full name");
            setLoading(false);
            return;
          }
          user = await demoSignup(name, email, password);
        } else {
          user = await demoLogin(email, password);
        }
        
        // Update state engine context instantly
        engineLogin(user.full_name, user.email, user.phone || "", user.photoUrl);
        
        onClose();
        
        // Redirect if on dedicated auth page
        if (typeof window !== "undefined" && window.location.pathname === "/auth") {
          window.location.href = "/profile";
        }
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const user = await demoGoogleLogin();
      // Update state engine context
      engineLogin(user.full_name, user.email, user.phone || "", user.photoUrl);
      
      onClose();
      
      if (typeof window !== "undefined" && window.location.pathname === "/auth") {
        window.location.href = "/profile";
      }
    } catch (err: any) {
      setError(err?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 15, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[2.5rem] bg-white p-6 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {localMode === "signup" ? "Create Care Account" : localMode === "login" ? "Security Sign In" : "Reset Care Credentials"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {localMode === "forgot"
                ? "Enter your registered email address and we will dispatch a secure password reset link to restore your account."
                : "Register or authenticate to unlock Continuous Care timelines, track active SOS fleets, and secure blood bank reservations."}
            </p>

            {localMode !== "forgot" && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-950/40 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
                  <span className="relative z-10 bg-white dark:bg-slate-900 px-3 text-[10px] font-black uppercase text-slate-400">or use secure credentials</span>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {localMode === "signup" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950/40 px-3 py-3">
                    <User size={14} className="text-slate-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-xs outline-none font-semibold"
                      placeholder="e.g. Ramesh Kumar"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Secure Email</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950/40 px-3 py-3">
                  <Mail size={14} className="text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full bg-transparent text-xs outline-none font-semibold"
                    placeholder="you@domain.com"
                    required
                  />
                </div>
              </div>

              {localMode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Password</label>
                    {localMode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocalMode("forgot");
                          setError("");
                          setSuccess("");
                        }}
                        className="text-[10px] font-black text-cyan-500 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950/40 px-3 py-3">
                    <Lock size={14} className="text-slate-400" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="w-full bg-transparent text-xs outline-none font-semibold"
                      placeholder="At least 8 characters"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 py-3.5 text-xs font-black text-white shadow-lg shadow-cyan-600/10 transition"
              >
                {loading
                  ? "Processing..."
                  : localMode === "signup"
                  ? "Create Account"
                  : localMode === "login"
                  ? "Sign In"
                  : "Send Reset Link"}
              </button>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold"
                  >
                    <CheckCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 rounded-xl bg-red-500/5 border border-red-500/10 p-3 text-[11px] text-red-500 font-semibold"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              {localMode === "forgot" ? (
                <button
                  type="button"
                  className="font-black text-cyan-500 hover:underline"
                  onClick={() => {
                    setLocalMode("login");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  type="button"
                  className="font-black text-cyan-500 hover:underline"
                  onClick={() => {
                    const nextMode = localMode === "signup" ? "login" : "signup";
                    setLocalMode(nextMode);
                    onModeChange(nextMode);
                    setError("");
                    setSuccess("");
                  }}
                >
                  {localMode === "signup" ? "Have an account? Sign in" : "New user? Sign up"}
                </button>
              )}
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
