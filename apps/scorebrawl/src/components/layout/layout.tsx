import { Toaster, TooltipProvider } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { ThemeProvider } from "~/components/layout/providers";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { fontSans } from "~/lib/fonts";

export const MainLayout = ({ children }: { children: React.JSX.Element }) => (
  <div className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <div className="container relative flex-1">{children}</div>
          <SiteFooter />
        </div>
      </TooltipProvider>
      <TailwindIndicator />
      <Toaster />
    </ThemeProvider>
  </div>
);
