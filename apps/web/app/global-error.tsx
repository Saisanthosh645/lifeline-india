"use client";

import { HeartPulse } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-950 text-white">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse size={36} className="text-red-500 animate-pulse" />
          <p className="text-sm font-black tracking-[0.18em] text-slate-300">LIFELINE INDIA</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-red-500 mb-2">Critical Core Interruption</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          The core layout failed to load securely. Let&apos;s attempt to reboot the local operational node.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow"
        >
          Reboot Node
        </button>
      </body>
    </html>
  );
}
