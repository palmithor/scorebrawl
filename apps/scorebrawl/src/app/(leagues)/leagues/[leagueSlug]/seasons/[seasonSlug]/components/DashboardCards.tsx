"use client";
import {
  OnFireCard,
  StrugglingCard,
} from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/PlayerFormCard";
import { useSeason } from "@/context/SeasonContext";
import { InfoCard } from "./InfoCard";
import { LatestMatchCard } from "./LatestMatchCard";

export const DashboardCards = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <OnFireCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
      <StrugglingCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
      <InfoCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
      <LatestMatchCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    </div>
  );
};
