"use client";

import { useEffect } from "react";
import { HeartPulse } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Operational exception encountered:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse size={36} className="text-red-500 animate-pulse" />
        <p className="text-sm font-black tracking-[0.18em]">LIFELINE INDIA</p>
      </div>
      <h1 className="text-3xl font-black tracking-tight text-red-600 mb-2">Operational Grid Interruption</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        A system error occurred while processing telemetry data. Let&apos;s attempt to re-sync the node.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow"
      >
        Re-Sync & Try Again
      </button>
    </div>
  );
}
