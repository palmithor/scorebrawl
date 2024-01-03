"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { Provider as BalancerProvider } from "react-wrap-balancer";

export const Providers = ({ children, ...props }: ThemeProviderProps) => (
  <NextThemesProvider {...props}>
    <BalancerProvider>{children}</BalancerProvider>
  </NextThemesProvider>
);
