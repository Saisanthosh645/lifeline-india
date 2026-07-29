"use client";

import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse size={36} className="text-red-500 animate-pulse" />
        <p className="text-sm font-black tracking-[0.18em]">LIFELINE INDIA</p>
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-2">404 — Node Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The request was routing across the emergency operational grid, but this specific page or resource was not found.
      </p>
      <Link href="/" className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow">
        Return to Control Center
      </Link>
    </div>
  );
}
