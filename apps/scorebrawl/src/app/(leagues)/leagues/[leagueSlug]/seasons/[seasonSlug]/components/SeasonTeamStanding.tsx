"use client";
import { OverviewCard } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/OverviewCard";
import { Standing } from "@/components/standing/standing";
import { api } from "@/trpc/react";
import { Skeleton } from "@scorebrawl/ui/skeleton";

export const SeasonStanding = ({
  leagueSlug,
  seasonSlug,
}: { leagueSlug: string; seasonSlug: string }) => {
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
      {!isLoading && data && data.length < 1 && (
        <div className={"w-full h-80 justify-center"}>No team matches</div>
      )}
      {!isLoading && data && (
        <OverviewCard title="Team Standing">
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
                  ?.players.map((p) => ({ id: p.userId, name: p.name, imageUrl: p.imageUrl })) ??
                [],
            }))}
          />
        </OverviewCard>
      )}
    </>
  );
};
