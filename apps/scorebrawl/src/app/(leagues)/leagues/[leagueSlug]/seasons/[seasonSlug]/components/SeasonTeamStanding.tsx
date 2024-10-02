"use client";
import { Standing } from "@/components/standing/standing";
import { EmptyCardContentText } from "@/components/state/empty-card-content";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";

export const SeasonTeamStanding = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  const { data = [], isLoading: isLoadingStanding } = api.seasonTeam.getStanding.useQuery({
    leagueSlug,
    seasonSlug,
  });
  const { data: avatars, isLoading: isLoadingAvatars } = api.avatar.getBySeasonTeamIds.useQuery(
    { leagueSlug, seasonSlug, seasonTeamIds: data.map((sp) => sp.seasonTeamId) },
    { enabled: data.length > 0 },
  );
  const isLoading = isLoadingAvatars || isLoadingStanding;

  return (
    <>
      {isLoading && <Skeleton className={"w-full h-80"} />}
      {!isLoading && data.length > 0 && (
        <Standing
          items={data?.map((st) => ({
            id: st.seasonTeamId,
            name: st.name,
            score: st.score,
            form: st.form,
            matchCount: st.matchCount,
            winCount: st.winCount,
            drawCount: st.drawCount,
            lossCount: st.lossCount,
            pointDiff: st.pointDiff,
            avatars:
              avatars
                ?.find((t) => t.teamId === st.seasonTeamId)
                ?.players.map((p) => ({ id: p.userId, name: p.name, imageUrl: p.imageUrl })) ?? [],
          }))}
        />
      )}
      {data.length === 0 && <EmptyCardContentText>No team matches registered</EmptyCardContentText>}
    </>
  );
};
