"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { LifelineProvider } from "@/lib/state-engine";
import { GlobalKeyboardShortcuts } from "@/components/shared/keyboard-shortcuts";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <LifelineProvider>
          <GlobalKeyboardShortcuts />
          {children}
        </LifelineProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

