import { auth } from "@/lib/auth";
import { OpenpanelProvider } from "@openpanel/nextjs";
import { headers } from "next/headers";

export const AnalyticsProvider = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return (
      <OpenpanelProvider
        clientId="89689e18-34da-4fc2-b92a-3de6f0155767"
        trackScreenViews={true}
        trackAttributes={true}
        trackOutgoingLinks={true}
        profileId={session ? session.user.id : undefined}
      />
    );
  } catch {
    return null;
  }
};
