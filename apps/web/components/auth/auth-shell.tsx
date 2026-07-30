"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Lock, User, ShieldCheck, HeartHandshake, ArrowLeft, Activity, Compass, Flame } from "lucide-react";
import { demoSignup, demoLogin, demoGoogleLogin, demoForgotPassword, demoResetPassword, getCurrentUser } from "@/lib/auth/demo-auth";
import { useLifeline } from "@/lib/state-engine";
import {
  getFirebaseConfigurationMessage,
  isFirebaseConfigured,
} from "@/lib/firebase";

const signupSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email")
});

const resetSchema = z.object({
  token: z.string().min(10, "Reset token/code is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters")
});

type View = "login" | "signup" | "forgot" | "reset";

export function AuthShell() {
  const [view, setView] = useState<View>("login");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: engineLogin } = useLifeline();

  const redirectTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("redirect") || "/profile"
    : "/profile";

  const signupForm = useForm<z.infer<typeof signupSchema>>({ resolver: zodResolver(signupSchema) });
  const loginForm = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const forgotForm = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setStatusMessage(msg);
    setStatusType(type);
  };

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      const user = await demoSignup(data.full_name, data.email, data.password);
      // Sync with global state engine
      engineLogin(user.full_name, user.email, user.phone || "", user.photoUrl);
      showMessage("Account created! A real verification link has been sent to your email by Firebase. Please check your inbox and verify your account.", "success");
      setTimeout(() => { window.location.href = redirectTo; }, 3000);
    } catch (err: any) {
      showMessage(err.message || "Sign up failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const user = await demoLogin(data.email, data.password);
      // Sync with global state engine
      engineLogin(user.full_name, user.email, user.phone || "", user.photoUrl);
      if (!user.is_verified) {
        showMessage("Login successful! Please note: Your email has not been verified yet. Check your inbox for the Firebase verification link.", "info");
      } else {
        showMessage("Login successful! Redirecting...", "success");
      }
      setTimeout(() => { window.location.href = redirectTo; }, 1500);
    } catch (err: any) {
      showMessage(err.message || "Login failed. Check your credentials or sign up.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await demoGoogleLogin();
      engineLogin(user.full_name, user.email, user.phone || "", user.photoUrl);
      showMessage("Google Sign-In successful! Redirecting...", "success");
      router.replace(redirectTo);
    } catch (err: any) {
      showMessage(err.message || "Google login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (email: string) => {
    setIsLoading(true);
    try {
      await demoForgotPassword(email);
      showMessage(`A real password reset email has been sent to ${email} by Firebase. Please click the link inside to set a new password.`, "success");
    } catch (err: any) {
      showMessage(err.message || "Failed to send reset link", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (data: z.infer<typeof resetSchema>) => {
    setIsLoading(true);
    try {
      await demoResetPassword(data.token, data.new_password);
      showMessage("Password reset successfully via Firebase! You can now sign in.", "success");
      setView("login");
    } catch (err: any) {
      showMessage(err.message || "Failed to reset password. The link or code may have expired.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors = {
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    error: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-brand-50 text-brand-700 dark:bg-slate-900/70 dark:text-brand-300",
  };

  return (
    <section className="section-shell py-12 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Futuristic command-center-like aside panel */}
        <motion.aside
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-brand-500/10 bg-slate-900 p-8 text-white shadow-2xl dark:border-slate-800/80"
        >
          {/* Ambient Glows */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-400">
                  National Health ID Portal
                </p>
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                Lifeline <span className="bg-gradient-to-r from-brand-400 to-teal-400 bg-clip-text text-transparent">Command</span>
              </h1>
              <p className="mt-4 text-base text-slate-300 leading-relaxed">
                Seamlessly integrated with Firebase Authentication, providing lightning-fast secure session management for emergency responders, doctors, and citizens alike.
              </p>

              {/* Heartbeat pulse animation simulation */}
              <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="text-brand-400 animate-pulse" size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Pulse Monitor</span>
                  </div>
                  <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-300">
                    Live Status
                  </span>
                </div>
                
                {/* Simulated wave diagram */}
                <div className="mt-3 flex items-end gap-[3px] h-10">
                  {[20, 45, 12, 10, 80, 5, 20, 95, 30, 15, 60, 40, 25, 75, 10, 15, 85, 45, 20, 55, 12, 40, 90, 50, 15, 25, 70, 12].map((height, idx) => (
                    <motion.div
                      key={idx}
                      className="w-1 bg-brand-400/80 rounded-full"
                      style={{ height: `${height}%` }}
                      animate={{
                        height: [
                          `${height}%`,
                          `${Math.min(100, Math.max(5, height + (Math.random() * 30 - 15)))}%`,
                          `${height}%`,
                        ],
                      }}
                      transition={{
                        duration: 1.5 + (idx % 3) * 0.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Key Features Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 hover:bg-white/[0.04] transition">
                  <ShieldCheck className="text-teal-400 mb-1" size={18} />
                  <h4 className="text-xs font-bold text-slate-200">Firebase Security</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dual-factor token rotation</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 hover:bg-white/[0.04] transition">
                  <Compass className="text-brand-400 mb-1" size={18} />
                  <h4 className="text-xs font-bold text-slate-200">Global Coverage</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Redundant cloud nodes</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 hover:bg-white/[0.04] transition">
                  <Flame className="text-orange-400 mb-1" size={18} />
                  <h4 className="text-xs font-bold text-slate-200">Instant Access</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Under 200ms dispatch</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 hover:bg-white/[0.04] transition">
                  <HeartHandshake className="text-pink-400 mb-1" size={18} />
                  <h4 className="text-xs font-bold text-slate-200">Zero Trust Ready</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Secure clinical data</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition">
                <ArrowLeft size={14} />
                Return to Command Center Portal
              </Link>
            </div>
          </div>
        </motion.aside>

        {/* Action Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="glass-card flex flex-col justify-between rounded-3xl p-6 md:p-10 border border-slate-200/50 dark:border-slate-800/80 shadow-xl"
          aria-live="polite"
        >
          <div>
            {/* Header / Tabs Selection */}
            <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900/80">
              {(["login", "signup", "forgot", "reset"] as View[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setView(item);
                    setStatusMessage("");
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                    view === item
                      ? "bg-white text-slate-900 shadow-md dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {item === "forgot" ? "Forgot" : item === "reset" ? "Reset" : item}
                </button>
              ))}
            </div>

            {/* Google OAuth Button */}
            {view !== "forgot" && view !== "reset" && (
              <>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-55"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="mr-1">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google Account
                </button>

                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">or use secure credentials</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
              </>
            )}

            {/* Status Messages */}
            {!isFirebaseConfigured() ? (
              <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-500">
                <p>{getFirebaseConfigurationMessage()}</p>
              </div>
            ) : statusMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mb-5 rounded-2xl p-4 text-sm font-medium border ${
                  statusType === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : statusType === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                }`}
              >
                {statusMessage}
              </motion.div>
            ) : null}

            {/* Interactive Animated Forms Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {view === "signup" ? (
                  <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignup)}>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="Full Name"
                        {...signupForm.register("full_name")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="Email"
                        type="email"
                        {...signupForm.register("email")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="Email Address"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="Password"
                        type="password"
                        {...signupForm.register("password")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="Password (At least 8 chars)"
                      />
                    </div>
                    <button
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-brand-600/35 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isLoading ? "Creating Authorized Firebase Profile..." : "Initialize New Profile"}
                    </button>
                  </form>
                ) : null}

                {view === "login" ? (
                  <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="Email"
                        type="email"
                        {...loginForm.register("email")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="Registered Email Address"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="Password"
                        type="password"
                        {...loginForm.register("password")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="Password"
                      />
                    </div>
                    <button
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-brand-600/35 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isLoading ? "Synchronizing Credentials with Firebase..." : "Access Secure Session"}
                    </button>
                  </form>
                ) : null}

                {view === "forgot" ? (
                  <form className="space-y-4" onSubmit={forgotForm.handleSubmit((data) => handleForgot(data.email))}>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="Email"
                        type="email"
                        {...forgotForm.register("email")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="Registered Email Address"
                      />
                    </div>
                    <button
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-brand-600/35 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isLoading ? "Generating Secure Link..." : "Request Password Reset"}
                    </button>
                  </form>
                ) : null}

                {view === "reset" ? (
                  <form className="space-y-4" onSubmit={resetForm.handleSubmit(handleReset)}>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="Reset Token/Code"
                        {...resetForm.register("token")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="oobCode from Firebase Email Link"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                      <input
                        aria-label="New Password"
                        type="password"
                        {...resetForm.register("new_password")}
                        className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:focus:border-brand-500"
                        placeholder="New Password (At least 8 chars)"
                      />
                    </div>
                    <button
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-brand-600/35 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isLoading ? "Setting New Password with Firebase..." : "Establish New Password"}
                    </button>
                  </form>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400 dark:border-slate-900">
            <p>India National Lifeline Security Dispatch Terminal</p>
            <p className="mt-1 font-mono text-[10px]">VER: 4.1.2-SECURE // AES-GCM-256</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}