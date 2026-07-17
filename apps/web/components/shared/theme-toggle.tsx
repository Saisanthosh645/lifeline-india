"use client";

import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until mounted on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold opacity-50"
        aria-label="Loading theme toggle"
        disabled
      >
        <div className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
        <span className="w-10 h-4 bg-slate-300 dark:bg-slate-700 animate-pulse rounded" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:scale-[1.03]"
      aria-label="Toggle theme"
      id="theme-toggle-btn"
    >
      {theme === "dark" ? <Sun size={16} /> : <MoonStar size={16} />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

