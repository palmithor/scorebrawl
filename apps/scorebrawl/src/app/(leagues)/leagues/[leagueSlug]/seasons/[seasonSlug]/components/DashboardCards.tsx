"use client";
import {
  OnFireCard,
  StrugglingCard,
} from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/PlayerFormCard";
import { InfoCard } from "./InfoCard";
import { LatestMatchCard } from "./LatestMatchCard";

type Props = { leagueSlug: string; seasonSlug: string };

export const DashboardCards = ({ leagueSlug, seasonSlug }: Props) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <OnFireCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    <StrugglingCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    <InfoCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    <LatestMatchCard leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
  </div>
);
