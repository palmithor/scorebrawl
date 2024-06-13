import "@scorebrawl/ui/styles.css";

import { siteConfig } from "@/config/site";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs";
import { fontHeading, fontSans, fontUrban } from "@scorebrawl/ui/fonts";
import { cn } from "@scorebrawl/ui/lib";
import { Analytics, Providers } from "@scorebrawl/ui/providers";
import { Spinner } from "@scorebrawl/ui/spinner";
import { TailwindIndicator } from "@scorebrawl/ui/tailwind-indicator";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Toaster } from "@scorebrawl/ui/toaster";
import type { Metadata } from "next";
import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Scorebrawl"],
  authors: [
    {
      name: "palmithor",
    },
  ],
  creator: "palmithor",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.openGraphImage],
    creator: "@palmithor",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-icon-180x180.png",
  },
  manifest: `${siteConfig.url}/manifest.json`,
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontUrban.variable,
            fontHeading.variable,
          )}
        >
          <Providers attribute="class" defaultTheme="system" enableSystem>
            <ClerkLoaded>{children}</ClerkLoaded>
            <ClerkLoading>
              <div className="grid h-screen place-items-center">
                <Spinner size="40" />
              </div>
            </ClerkLoading>
            <Analytics />
            <SpeedInsights />
            <Toaster />
            <TailwindIndicator />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
