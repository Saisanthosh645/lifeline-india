"use client";

import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "./site-chrome";

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  backHref?: string;
};

export function FeaturePageLayout({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-brand-600",
  children,
  backHref = "/",
}: Props) {
  return (
    <main className="min-h-screen pb-8">
      <SiteHeader />
      <div className="section-shell pt-8">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="glass-card rounded-3xl p-6 md:p-10">
          <div className="mb-8">
            {Icon && (
              <div className={`mb-4 inline-flex rounded-2xl bg-brand-500/10 p-3 ${iconColor}`}>
                <Icon size={28} />
              </div>
            )}
            <h1 className="text-3xl font-black md:text-4xl">{title}</h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
