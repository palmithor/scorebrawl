import { type AppType } from "next/app";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { MainLayout } from "~/components/layout/layout";
import { type NavbarTab } from "~/components/layout/navbar";

const MyApp: AppType<{ currentTab: NavbarTab }> = ({
  Component,
  pageProps,
}) => {
  return (
    <ClerkProvider {...pageProps}>
      <SignedIn>
        <MainLayout currentTab={pageProps.currentTab}>
          <Component {...pageProps} />
        </MainLayout>
      </SignedIn>
      <SignedOut>
        <div className="flex h-full min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <SignIn
              appearance={{
                elements: {
                  socialButtonsBlockButtonText: "text-center",
                  button: "text-center",
                  logoBox: "justify-center h-24",
                  header: "text-center",
                },
              }}
            ></SignIn>
          </div>
        </div>
      </SignedOut>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
