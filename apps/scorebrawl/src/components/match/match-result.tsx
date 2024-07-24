"use client";
import { api } from "@/trpc/react";
import type { Match } from "@scorebrawl/db/types";
import { Badge } from "@scorebrawl/ui/badge";
import { MultiAvatarWithSkeletonLoading } from "@scorebrawl/ui/multi-avatar";

export const MatchResult = ({
  leagueSlug,
  seasonSlug,
  match: { homeScore, awayScore, homeTeamSeasonPlayerIds, awayTeamSeasonPlayerIds },
}: {
  leagueSlug: string;
  seasonSlug: string;
  match: Match;
}) => {
  const { data: homeTeamAvatars } = api.avatar.getBySeasonPlayerIds.useQuery({
    leagueSlug,
    seasonSlug,
    seasonPlayerIds: homeTeamSeasonPlayerIds,
  });
  const { data: awayTeamAvatars } = api.avatar.getBySeasonPlayerIds.useQuery({
    leagueSlug,
    seasonSlug,
    seasonPlayerIds: awayTeamSeasonPlayerIds,
  });
  const { data: _homeTeam } = api.leagueTeam.getBySeasonPlayerIds.useQuery(
    {
      leagueSlug,
      seasonSlug,
      seasonPlayerIds: homeTeamSeasonPlayerIds,
    },
    { enabled: homeTeamSeasonPlayerIds.length > 1 },
  );
  return (
    <div className="flex items-center justify-between gap-3">
      <MultiAvatarWithSkeletonLoading
        users={homeTeamAvatars?.map(({ userId, ...u }) => ({ id: userId, ...u }))}
        visibleCount={3}
      />
      <Badge className="text-base rounded font-bold">
        {homeScore} - {awayScore}
      </Badge>
      <MultiAvatarWithSkeletonLoading
        users={awayTeamAvatars?.map(({ userId, ...u }) => ({ id: userId, ...u }))}
        visibleCount={3}
      />
    </div>
  );
};
