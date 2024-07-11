"use client";
import { LatestMatchCard } from "./LatestMatchCard";

type Props = { leagueSlug: string; seasonSlug: string };

export const StatsCards = ({ leagueSlug, seasonSlug }: Props) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <LatestMatchCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
  </div>
);
