"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { useRouter } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Provider as BalancerProvider } from "react-wrap-balancer";

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  const router = useRouter();

  return (
    <NextThemesProvider {...props}>
      <BalancerProvider>
        <TooltipProvider>
          <NuqsAdapter>
            <AuthUIProvider
              authClient={authClient}
              navigate={router.push}
              replace={router.replace}
              providers={["google"]}
              credentials={false}
              //forgotPassword={process.env.VERCEL_ENV !== "production"}
              onSessionChange={() => router.refresh()}
              defaultRedirectTo="/"
            >
              {children}
            </AuthUIProvider>
          </NuqsAdapter>
        </TooltipProvider>
      </BalancerProvider>
    </NextThemesProvider>
  );
};
