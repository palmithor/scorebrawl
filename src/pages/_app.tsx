import { type AppType } from "next/app";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/nextjs";

import { api } from "~/lib/api";

import "~/styles/globals.css";
import { MainLayout } from "~/components/layout/layout";
import { type NavbarTab } from "~/components/layout/navbar";
import { useRouter } from "next/router";
import { Toaster } from "~/components/ui/toaster";

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

const MyApp: AppType<{ currentTab: NavbarTab }> = ({
  Component,
  pageProps,
}) => {
  const { query } = useRouter();

  return (
    <ClerkProvider {...pageProps}>
      <SignedIn>
        <MainLayout currentTab={pageProps.currentTab}>
          <Component {...pageProps} />
        </MainLayout>
      </SignedIn>
      <SignedOut>
        <div className="flex h-full min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            {query.signup ? (
              <SignUp signInUrl={"/"} appearance={clerkAppearance} />
            ) : (
              <SignIn
                signUpUrl={"/?signup=true"}
                appearance={clerkAppearance}
              />
            )}
          </div>
        </div>
      </SignedOut>
      <Toaster />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
