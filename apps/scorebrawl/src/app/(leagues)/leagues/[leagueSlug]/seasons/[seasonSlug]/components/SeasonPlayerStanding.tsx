"use client";
import { Standing } from "@/components/standing/standing";
import { useSeason } from "@/context/SeasonContext";
import { api } from "@/trpc/react";
import { Skeleton } from "@scorebrawl/ui/skeleton";
import { OverviewCard } from "./OverviewCard";

export const SeasonPlayerStanding = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  const { data, isLoading } = api.seasonPlayer.getStanding.useQuery({ leagueSlug, seasonSlug });
  return (
    <>
      {isLoading && <Skeleton className={"w-full h-80"} />}
      {!isLoading && data && (
        <OverviewCard title="Player Standing">
          <Standing
            items={data?.map((sp) => ({
              id: sp.seasonPlayerId,
              name: sp.user.name,
              score: sp.score,
              form: sp.form,
              matchCount: sp.matchCount,
              winCount: sp.winCount,
              drawCount: sp.drawCount,
              lossCount: sp.lossCount,
              pointDiff: sp.pointDiff,
              avatars: [{ id: sp.user.userId, imageUrl: sp.user.imageUrl, name: sp.user.name }],
            }))}
          />
        </OverviewCard>
      )}
    </>
  );
};
