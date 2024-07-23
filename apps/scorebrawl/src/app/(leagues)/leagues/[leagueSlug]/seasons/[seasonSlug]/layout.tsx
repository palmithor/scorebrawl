import { SeasonProvider } from "@/context/SeasonContext";
import type { ReactNode } from "react";

export default function Layout({
  children,
  params,
}: { children: ReactNode; params: { leagueSlug: string; seasonSlug: string } }) {
  return (
    <SeasonProvider leagueSlug={params.leagueSlug} seasonSlug={params.seasonSlug}>
      {children}
    </SeasonProvider>
  );
}
