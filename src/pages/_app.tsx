import { type AppType } from "next/app";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <SignedIn>
        <Component {...pageProps} />
      </SignedIn>
      <SignedOut>
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <SignIn></SignIn>
          </div>
        </div>
      </SignedOut>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
