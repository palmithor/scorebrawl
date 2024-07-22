import { auth } from "@clerk/nextjs/server";
import { OpenpanelProvider } from "@openpanel/nextjs";

export const AnalyticsProvider = () => {
  const { userId } = auth();
  return (
    <OpenpanelProvider
      clientId="89689e18-34da-4fc2-b92a-3de6f0155767"
      trackScreenViews={true}
      trackAttributes={true}
      trackOutgoingLinks={true}
      profileId={userId ?? undefined}
    />
  );
};
