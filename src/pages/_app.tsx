import {
  ClerkLoaded,
  ClerkLoading,
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { type AppType } from "next/app";

import { api } from "~/lib/api";

import { useRouter } from "next/router";
import { MainLayout } from "~/components/layout/layout";
import { ThemeProvider } from "~/components/layout/providers";
import { Spinner } from "~/components/spinner";
import { Toaster } from "~/components/ui/toaster";
import "~/styles/globals.css";

const clerkAppearance = {
  elements: {
    socialButtonsBlockButtonText: "text-center",
    button: "text-center",
    logoBox: {
      display: "flex",
      height: "6rem",
      justifyContent: "center",
      "& > a": {
        display: "flex",
        justifyContent: "center",
      },
    },
    header: "text-center",
  },
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const { query } = useRouter();

  return (
    <ClerkProvider {...pageProps}>
      <Analytics />
      <ClerkLoading>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="grid h-screen place-items-center bg-background">
            <Spinner size="40" />
          </div>
        </ThemeProvider>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </SignedIn>
        <SignedOut>
          <div className="flex h-full min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
              {query.signup ? (
                <SignUp signInUrl={"/"} appearance={clerkAppearance} />
              ) : (
                <SignIn signUpUrl={"/?signup=true"} appearance={clerkAppearance} />
              )}
            </div>
          </div>
        </SignedOut>
      </ClerkLoaded>
      <Toaster />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
