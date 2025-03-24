"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Provider as BalancerProvider } from "react-wrap-balancer";

export const Providers = ({ children, ...props }: ThemeProviderProps) => (
  <NextThemesProvider {...props}>
    <BalancerProvider>
      <TooltipProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TooltipProvider>
    </BalancerProvider>
  </NextThemesProvider>
);
