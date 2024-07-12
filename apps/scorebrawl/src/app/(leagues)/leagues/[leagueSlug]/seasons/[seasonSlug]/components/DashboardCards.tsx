"use client";
import { InfoCard } from "./InfoCard";
import { LatestMatchCard } from "./LatestMatchCard";

type Props = { leagueSlug: string; seasonSlug: string };

export const DashboardCards = ({ leagueSlug, seasonSlug }: Props) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <InfoCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    <LatestMatchCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
  </div>
);
