import { ThemeProvider } from "~/components/layout/providers";

import { type ReactNode } from "react";
import { cn } from "~/lib/utils";
import { fontSans } from "~/lib/fonts";
import { SiteHeader } from "~/components/layout/site-header";
import { SiteFooter } from "~/components/layout/site-footer";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { Toaster } from "~/components/ui/toaster";

export const MainLayout = ({ children }: { children: ReactNode }) => (
  <body
    className={cn(
      "min-h-screen bg-background font-sans antialiased",
      fontSans.variable
    )}
  >
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container relative flex-1">{children}</div>
        <SiteFooter />
      </div>
      <TailwindIndicator />
    </ThemeProvider>
    {/*<Analytics />*/}
    <Toaster />
  </body>
);
